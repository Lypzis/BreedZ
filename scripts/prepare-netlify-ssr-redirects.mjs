import { mkdir, readFile, writeFile } from 'node:fs/promises'

const sourcePath = new URL('../public/_redirects', import.meta.url)
const targetPath = new URL('../dist/ssr/client/_redirects', import.meta.url)

const fallbackRule = '/* /index.html 200'

const source = await readFile(sourcePath, 'utf8')
const lines = source
  .split(/\r?\n/)
  .filter((line) => line.trim() !== fallbackRule)

await mkdir(new URL('../dist/ssr/client/', import.meta.url), { recursive: true })
await writeFile(targetPath, `${lines.join('\n').trim()}\n`, 'utf8')
