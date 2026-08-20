import { copyFile } from 'node:fs/promises';

await copyFile('build/404/index.html', 'build/404.html');
console.log('Copied build/404/index.html → build/404.html');
