const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = process.cwd();
const rendererHtml = path.join(root, 'dist', 'index.html');
const electronMain = path.join(root, 'dist-electron', 'electron', 'main.js');

assert.ok(fs.existsSync(rendererHtml), 'renderer build output is missing');
assert.ok(fs.existsSync(electronMain), 'electron build output is missing');

const mainBundle = fs.readFileSync(electronMain, 'utf8');

assert.match(mainBundle, /overlay:show/, 'overlay IPC channel is missing from the build');
assert.match(mainBundle, /Show reminder demo/, 'tray demo action is missing from the build');

console.log('smoke ok');
