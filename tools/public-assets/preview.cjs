const http = require('node:http');
const {readFile, realpath} = require('node:fs/promises');
const path = require('node:path');

const rootDefault = path.resolve(__dirname,'../..');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'};
const entries = [
  ['carousel-large-2026-11-03/index.html','Comparaison des carrousels'],
  ['door-transition-2026-11-02/index.html','Ouverture des portes 3D'],
  ['header-equipment-2026-10-30/apercu.html','Objets sportifs du header'],
  ['pentagon-carousel-2026-11-02/index.html','Ancien prototype pentagonal'],
];

async function createPreview({root = rootDefault} = {}) {
  root = await realpath(root);
  const manifest = JSON.parse(await readFile(path.join(root,'prototypes/manifest.json'),'utf8'));
  if (manifest.version !== 1 || !manifest.entries) throw new Error('Invalid preview manifest');
  const files = new Map();
  for (const [url, item] of Object.entries(manifest.entries)) {
    if (!url.startsWith('/design_assets/') || /[\\?#\0]/.test(url) || url.split('/').includes('..')
      || typeof item.file !== 'string' || !types[path.extname(item.file)]
      || !/^(prototypes\/design-assets|gym-next\/public\/design_assets)\//.test(item.file)
      || /[\\\0]/.test(item.file) || item.file.split('/').some(p=>p==='..'||p==='.')) throw new Error('Unsafe preview entry');
    const resolved = await realpath(path.join(root,item.file));
    if (resolved !== path.resolve(root,item.file)) throw new Error('Symlink preview entry refused');
    files.set(url,{resolved,type:types[path.extname(item.file)]});
  }
  const server = http.createServer(async (req,res) => {
    const end = (status,body='') => {res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8'});res.end(body);};
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'");
    if (req.headers.host !== `127.0.0.1:${server.address().port}`) return end(403);
    if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) return end(403);
    if (!['GET','HEAD'].includes(req.method)) return end(405);
    let url;
    try {url = decodeURIComponent(req.url.split('?')[0]);} catch {return end(400);}
    if (/[\\\0]/.test(url) || url.split('/').some(p=>p==='..'||p==='.')) return end(400);
    if (url === '/') {
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
      return res.end(req.method==='HEAD'?'':`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Démonstrations locales GetYourMentor</title><h1>Démonstrations locales</h1><p>Aperçu isolé : aucun compte, paiement ni parcours métier. Les liens vers le site applicatif ne sont pas servis ici.</p><ul>${entries.map(([url,label])=>`<li><a href="/design_assets/${url}">${label}</a></li>`).join('')}</ul></html>`);
    }
    const file = files.get(url);
    if (!file) return end(404,'Not available in isolated preview');
    try {
      // Recheck real path on each request: no symlink substitution after startup.
      if (await realpath(file.resolved) !== file.resolved) return end(403);
      const body = await readFile(file.resolved);
      res.writeHead(200,{'Content-Type':file.type,'Content-Length':body.length});
      res.end(req.method==='HEAD'?undefined:body);
    } catch {end(404);}
  });
  return server;
}

exports.createPreview = createPreview;
