#!/usr/bin/env node
/*
 * TLS-bridge relay — lets a headless Chromium reach HTTPS in this cloud
 * environment, whose egress proxy RESETs Chromium's raw TLS ClientHello.
 * See docs/headless-browser-in-this-env.md for the full story.
 *
 * Chromium --TLS--> [relay terminates] --plaintext HTTP/1.1--> [relay re-TLS] --> origin
 *                                                              (via the env CONNECT proxy)
 * Both sides terminate TLS, then the cleartext HTTP is piped byte-for-byte.
 * The origin is still reached ONLY through the env proxy's policy-enforced
 * CONNECT — this bridges TLS locally, it does not bypass egress policy.
 *
 * Also acts as a plain-HTTP forward proxy so a local dev/static server
 * (http://127.0.0.1:PORT/...) can be routed through the same proxy, avoiding
 * proxy-bypass juggling in the browser.
 *
 * Usage:  node scripts/browser/relay.cjs [listenPort=8899]
 * Env:    HTTPS_PROXY (upstream CONNECT proxy; default http://127.0.0.1:39813)
 *         RELAY_DEBUG=1 to log each CONNECT/HTTP
 */
const net = require('net');
const tls = require('tls');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const UP = new URL(process.env.HTTPS_PROXY || process.env.https_proxy || 'http://127.0.0.1:39813');
const PROXY_HOST = UP.hostname;
const PROXY_PORT = parseInt(UP.port || '39813', 10);
const LISTEN_PORT = parseInt(process.argv[2] || process.env.RELAY_PORT || '8899', 10);

function log(...a) { if (process.env.RELAY_DEBUG) console.error('[relay]', ...a); }

// The relay must never die on a stray socket error.
process.on('uncaughtException', (e) => log('uncaught', e.message));
process.on('unhandledRejection', (e) => log('unhandledRejection', e && e.message));

// Self-signed cert for the Chromium-facing side. Chromium runs with
// --ignore-certificate-errors, so any cert (even a hostname mismatch) is fine.
// Generated once into tmp with openssl and reused.
const CERT = path.join(os.tmpdir(), 'ccr-relay-cert.pem');
const KEY = path.join(os.tmpdir(), 'ccr-relay-key.pem');
if (!fs.existsSync(CERT) || !fs.existsSync(KEY)) {
  execSync(
    `openssl req -x509 -newkey rsa:2048 -keyout "${KEY}" -out "${CERT}" -days 3650 -nodes ` +
    `-subj "/CN=relay.local" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"`,
    { stdio: 'ignore' }
  );
}
const cert = fs.readFileSync(CERT);
const key = fs.readFileSync(KEY);

// Open a raw TLS tunnel to origin host:port through the env CONNECT proxy.
function connectOrigin(host, port) {
  return new Promise((resolve, reject) => {
    const raw = net.connect(PROXY_PORT, PROXY_HOST);
    raw.once('error', reject);
    raw.once('connect', () => {
      raw.write(`CONNECT ${host}:${port} HTTP/1.1\r\nHost: ${host}:${port}\r\n\r\n`);
    });
    let buf = Buffer.alloc(0);
    const onData = (d) => {
      buf = Buffer.concat([buf, d]);
      const i = buf.indexOf('\r\n\r\n');
      if (i === -1) return;
      raw.removeListener('data', onData);
      const statusLine = buf.slice(0, buf.indexOf('\r\n')).toString();
      if (!/ 200 /.test(statusLine)) { raw.destroy(); return reject(new Error('upstream CONNECT: ' + statusLine)); }
      // Origin presents its own real cert (transparent tunnel). We don't verify —
      // this relay only renders public pages for screenshots.
      const upstream = tls.connect({
        socket: raw, servername: host, rejectUnauthorized: false, ALPNProtocols: ['http/1.1'],
      }, () => resolve(upstream));
      upstream.once('error', reject);
    };
    raw.on('data', onData);
  });
}

const server = net.createServer((clientSock) => {
  clientSock.once('error', () => {});
  let headBuf = Buffer.alloc(0);
  const onHead = (d) => {
    headBuf = Buffer.concat([headBuf, d]);
    const i = headBuf.indexOf('\r\n\r\n');
    if (i === -1) return;
    clientSock.removeListener('data', onHead);
    const reqLine = headBuf.slice(0, headBuf.indexOf('\r\n')).toString();
    const m = reqLine.match(/^CONNECT\s+([^:]+):(\d+)/i);
    if (!m) {
      // Plain-HTTP forward proxy (absolute-form request line) — for local servers.
      const hm = reqLine.match(/^(\S+)\s+http:\/\/([^\/:\s]+)(?::(\d+))?(\/\S*)?\s+HTTP/i);
      if (!hm) { clientSock.end('HTTP/1.1 400 Bad Request\r\n\r\n'); return; }
      const hHost = hm[2], hPort = parseInt(hm[3] || '80', 10), hPath = hm[4] || '/';
      log('HTTP', hm[1], hHost, hPort, hPath);
      const rewritten = headBuf.toString().replace(reqLine, `${hm[1]} ${hPath} HTTP/1.1`);
      const up = net.connect(hPort, hHost, () => { up.write(rewritten); });
      up.on('error', (e) => { log('http up err', hHost, e.message); clientSock.destroy(); });
      up.pipe(clientSock);
      clientSock.pipe(up);
      clientSock.once('close', () => up.destroy());
      return;
    }
    const host = m[1], port = parseInt(m[2], 10);
    log('CONNECT', host, port);
    clientSock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    const clientTls = new tls.TLSSocket(clientSock, { isServer: true, key, cert, ALPNProtocols: ['http/1.1'] });
    clientTls.once('error', (e) => { log('clientTls err', host, e.message); clientSock.destroy(); });
    clientTls.once('secure', async () => {
      try {
        const upstream = await connectOrigin(host, port);
        upstream.once('error', (e) => { log('upstream err', host, e.message); clientTls.destroy(); });
        clientTls.pipe(upstream);
        upstream.pipe(clientTls);
        clientTls.once('close', () => upstream.destroy());
        upstream.once('close', () => clientTls.destroy());
      } catch (e) {
        log('connectOrigin fail', host, e.message);
        clientTls.destroy();
      }
    });
  };
  clientSock.on('data', onHead);
});

server.listen(LISTEN_PORT, '127.0.0.1', () => {
  console.error(`RELAY_LISTENING ${LISTEN_PORT} (upstream ${PROXY_HOST}:${PROXY_PORT})`);
});
