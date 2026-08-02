import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { GUIDE_ENTRIES } from '../src/utils/guide-manifest.js'
import { buildLocalizedPath } from '../src/utils/localeRouting.js'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8')
const locales = ['en', 'pt-BR', 'es']

test('guide manifest defines nine unique guides with valid dates and existing images', () => {
  assert.equal(GUIDE_ENTRIES.length, 9)
  assert.equal(new Set(GUIDE_ENTRIES.map((guide) => guide.internalPath)).size, 9)

  for (const guide of GUIDE_ENTRIES) {
    assert.match(guide.publishedAt, /^\d{4}-\d{2}-\d{2}$/)
    assert.match(guide.modifiedAt, /^\d{4}-\d{2}-\d{2}$/)
    assert.equal(guide.modifiedAt >= guide.publishedAt, true)
    assert.equal(existsSync(`${projectRoot}public${guide.image}`), true, guide.image)
  }
})

test('sitemap contains every localized guide canonical exactly once with its lastmod', () => {
  const expectedGuideUrls = []

  for (const guide of GUIDE_ENTRIES) {
    for (const locale of locales) {
      const url = `https://breedz.app${buildLocalizedPath(locale, guide.internalPath)}`
      const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const matches = sitemap.match(new RegExp(`<loc>${escapedUrl}</loc>`, 'g')) || []
      const blockPattern = new RegExp(
        `<url>\\s*<loc>${escapedUrl}</loc>\\s*<lastmod>${guide.modifiedAt}</lastmod>\\s*</url>`,
      )

      expectedGuideUrls.push(url)
      assert.equal(matches.length, 1, url)
      assert.match(sitemap, blockPattern)
    }
  }

  assert.equal(new Set(expectedGuideUrls).size, 27)
})
