import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildGuideMeta,
  buildLocalizedAlternateLinks,
  serializeJsonLd,
} from '../src/utils/seo-meta.js'

test('builds localized alternate URLs from a canonical guide path', () => {
  const links = buildLocalizedAlternateLinks('/guides/how-long-is-cow-pregnancy')

  assert.equal(links.alternateEn.href, 'https://breedz.app/en/guides/how-long-is-cow-pregnancy')
  assert.equal(links.alternatePtBr.href, 'https://breedz.app/pt-br/guias/quanto-tempo-dura-a-gestacao-da-vaca')
  assert.equal(links.alternateEs.href, 'https://breedz.app/es/guias/cuanto-dura-la-gestacion-de-una-vaca')
  assert.equal(links.alternateDefault.href, links.alternateEn.href)
})

test('builds article and breadcrumb structured data with localized canonical details', () => {
  const meta = buildGuideMeta({
    title: 'Gestação da vaca',
    description: 'Uma explicação prática.',
    internalPath: '/guides/how-long-is-cow-pregnancy',
    locale: 'pt-BR',
    publishedAt: '2026-04-23',
    modifiedAt: '2026-05-12',
    image: '/images/landing/hero-farm.webp',
    guidesLabel: 'Guias',
  })
  const structuredData = JSON.parse(meta.script.guideStructuredData.innerHTML)
  const article = structuredData['@graph'].find((item) => item['@type'] === 'Article')
  const breadcrumb = structuredData['@graph'].find((item) => item['@type'] === 'BreadcrumbList')
  const author = structuredData['@graph'].find((item) => item['@type'] === 'Person')

  assert.equal(meta.meta.ogType.content, 'article')
  assert.equal(meta.meta.articlePublishedTime.content, '2026-04-23')
  assert.equal(meta.meta.articleModifiedTime.content, '2026-05-12')
  assert.equal(meta.link.canonical.href, 'https://breedz.app/pt-br/guias/quanto-tempo-dura-a-gestacao-da-vaca')
  assert.equal(article.inLanguage, 'pt-BR')
  assert.equal(article.datePublished, '2026-04-23')
  assert.equal(article.dateModified, '2026-05-12')
  assert.equal(breadcrumb.itemListElement[0].name, 'Guias')
  assert.equal(author.name, 'Victor V. Piccoli (Lypzis)')
  assert.equal(author.jobTitle, 'Founder')
})

test('serializes JSON-LD without allowing a script-closing sequence', () => {
  const serialized = serializeJsonLd({ description: '</script><script>alert("x")</script> & more' })

  assert.equal(serialized.includes('</script>'), false)
  assert.deepEqual(JSON.parse(serialized), {
    description: '</script><script>alert("x")</script> & more',
  })
})
