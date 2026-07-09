const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

const root = process.cwd();
const rendererHtml = path.join(root, 'dist', 'index.html');
const electronMain = path.join(root, 'dist-electron', 'electron', 'main.js');

assert.ok(fs.existsSync(rendererHtml), 'renderer build output is missing');
assert.ok(fs.existsSync(electronMain), 'electron build output is missing');

const mainBundle = fs.readFileSync(electronMain, 'utf8');

assert.match(mainBundle, /overlay:show/, 'overlay IPC channel is missing from the build');
assert.match(mainBundle, /Show reminder demo/, 'tray demo action is missing from the build');

const electronRun = spawnSync(
  process.execPath,
  [path.join(root, 'node_modules', 'electron', 'cli.js'), electronMain, '--smoke-test'],
  {
    cwd: root,
    env: { ...process.env, PIKA_BOO_SMOKE_TEST: '1' },
    encoding: 'utf8',
    timeout: 20000,
  },
);

assert.equal(electronRun.status, 0, `electron smoke launch failed: ${electronRun.stderr || electronRun.stdout}`);
assert.ok(
  !/ERR_FILE_NOT_FOUND|Failed to load URL/i.test(`${electronRun.stdout}\n${electronRun.stderr}`),
  `electron smoke launch reported renderer load failure: ${electronRun.stderr || electronRun.stdout}`,
);

console.log('smoke ok');
