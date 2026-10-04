import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const markdown = await readFile(resolve(root, 'docs/analysis-rules.md'), 'utf8');
const escape = value => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
await writeFile(resolve(root, 'analysis-rules.md'), markdown);
await writeFile(resolve(root, 'analysis-rules.html'), `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>解析ルール | カバネリ</title><link rel="stylesheet" href="style.css"></head>
<body><main><a href="./">← カウンター</a><h1>解析ルール</h1><p><a href="analysis-rules.md" download>Markdownをダウンロード</a></p><pre style="white-space:pre-wrap;font:13px/1.9 system-ui;overflow-wrap:anywhere">${escape(markdown)}</pre></main></body></html>`);
await writeFile(resolve(root, '.nojekyll'), '');
for (const file of ['index.html', 'style.css', 'app.js', 'rules.js']) {
  await access(resolve(root, file));
}
console.log('Static site ready: repository root (no dependencies, no server)');
