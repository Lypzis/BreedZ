import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'

const sourceRoot = resolve('dist/ssr')
const targetRoot = resolve('dist/netlify-ssr')

const RELATIVE_JS_SPECIFIER_RE = /(['"`])((?:\.\.?\/)[^'"`]+?)\.js\1/g

async function pathExists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

function toTargetPath(sourcePath) {
  const relPath = relative(sourceRoot, sourcePath)
  return join(
    targetRoot,
    relPath.endsWith('.js') ? relPath.replace(/\.js$/u, '.mjs') : relPath,
  )
}

async function transformJsFile(sourcePath, targetPath) {
  const original = await readFile(sourcePath, 'utf8')
  const transformed = original.replace(RELATIVE_JS_SPECIFIER_RE, '$1$2.mjs$1')

  await mkdir(dirname(targetPath), { recursive: true })
  await writeFile(targetPath, transformed, 'utf8')
}

async function copyTree(currentSource) {
  const entries = await readdir(currentSource, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name === 'client' || entry.name === 'node_modules' || entry.name === 'package.json') {
      continue
    }

    const sourcePath = join(currentSource, entry.name)
    const targetPath = toTargetPath(sourcePath)

    if (entry.isDirectory()) {
      await mkdir(targetPath, { recursive: true })
      await copyTree(sourcePath)
      continue
    }

    await mkdir(dirname(targetPath), { recursive: true })

    if (entry.name.endsWith('.js')) {
      await transformJsFile(sourcePath, targetPath)
      continue
    }

    await cp(sourcePath, targetPath)
  }
}

await rm(targetRoot, { recursive: true, force: true })

if (!(await pathExists(sourceRoot))) {
  throw new Error('Missing dist/ssr build output. Run the SSR build first.')
}

await copyTree(sourceRoot)
