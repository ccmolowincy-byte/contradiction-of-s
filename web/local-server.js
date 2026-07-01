const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.wasm': 'application/wasm',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.json': 'application/json',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  // swim/ (Elemental-Serenity) assets
  '.mp3':  'audio/mpeg',
  '.glb':  'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin':  'application/octet-stream',
  '.hdr':  'image/vnd.radiance',
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const requestedPath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(ROOT, requestedPath);

  // Resolve directory requests (e.g. /swim/) to their index.html, mirroring how
  // static hosts (Vercel) serve sub-app folders.
  try {
    if (fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  } catch (e) { /* not a real path — fall through to 404 below */ }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + urlPath);
    } else {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    }
  });
}).listen(PORT, () => {
  console.log(`Serving on http://localhost:${PORT}`);
});
