const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = process.cwd();
const mode = process.argv[2];
const target = mode === 'installer' ? 'nsis' : 'dir';
const tempOutput = path.join(os.tmpdir(), `pikaboo-build-${target}`);
const releaseDir = path.join(root, 'release');

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  assert.equal(result.status, 0, `${command} ${args.join(' ')} failed`);
}

function resetDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyEntry(name) {
  const source = path.join(tempOutput, name);
  const destination = path.join(releaseDir, name);
  fs.rmSync(destination, { recursive: true, force: true });
  fs.cpSync(source, destination, { recursive: true, force: true });
}

resetDir(tempOutput);
fs.mkdirSync(releaseDir, { recursive: true });

run('npx', ['electron-builder', '--win', target, `--config.directories.output=${tempOutput}`]);

if (target === 'dir') {
  copyEntry('win-unpacked');
} else {
  for (const name of fs.readdirSync(tempOutput)) {
    copyEntry(name);
  }
}

