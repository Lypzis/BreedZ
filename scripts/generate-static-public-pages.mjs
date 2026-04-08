import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { messages } from '../src/i18n/messages.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const distRoot = path.join(projectRoot, 'dist', 'pwa')
const templatePath = path.join(distRoot, 'index.html')

const SITE_URL = 'https://breedz.app'
const DEFAULT_IMAGE = `${SITE_URL}/icons/icon-512x512.png`

const localeConfigs = [
  {
    locale: 'en',
    routeSegment: 'en',
    htmlLang: 'en',
    ogLocale: 'en_US',
  },
  {
    locale: 'pt-BR',
    routeSegment: 'pt-br',
    htmlLang: 'pt-BR',
    ogLocale: 'pt_BR',
  },
]

const localizedPublicPaths = {
  en: {
    '/': '/',
    '/guides/track-cattle-breeding-dates': '/guides/track-cattle-breeding-dates',
    '/about': '/about',
    '/contact': '/contact',
    '/privacy': '/privacy',
    '/terms': '/terms',
  },
  'pt-BR': {
    '/': '/',
    '/guides/track-cattle-breeding-dates': '/guias/acompanhar-datas-de-cobertura-no-gado',
    '/about': '/sobre',
    '/contact': '/contato',
    '/privacy': '/privacidade',
    '/terms': '/termos',
  },
}

const publicPages = [
  {
    path: '/',
    titleKey: 'home.meta.title',
    descriptionKey: 'home.meta.description',
  },
  {
    path: '/guides/track-cattle-breeding-dates',
    titleKey: 'guideBreedingDates.meta.title',
    descriptionKey: 'guideBreedingDates.meta.description',
  },
  {
    path: '/about',
    titleKey: 'about.meta.title',
    descriptionKey: 'about.meta.description',
  },
  {
    path: '/contact',
    titleKey: 'contact.meta.title',
    descriptionKey: 'contact.meta.description',
  },
  {
    path: '/privacy',
    titleKey: 'privacy.meta.title',
    descriptionKey: 'privacy.meta.description',
  },
  {
    path: '/terms',
    titleKey: 'terms.meta.title',
    descriptionKey: 'terms.meta.description',
  },
]

function localizePublicPath(locale, pagePath) {
  return localizedPublicPaths[locale]?.[pagePath] || pagePath
}

function getPathValue(obj, valuePath) {
  return valuePath.split('.').reduce((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return current[key]
    }

    return undefined
  }, obj)
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function buildPageUrl(locale, routeSegment, pagePath) {
  const localizedPath = localizePublicPath(locale, pagePath)

  return localizedPath === '/'
    ? `${SITE_URL}/${routeSegment}`
    : `${SITE_URL}/${routeSegment}${localizedPath}`
}

function buildOutputPath(locale, routeSegment, pagePath) {
  const localizedPath = localizePublicPath(locale, pagePath)

  if (localizedPath === '/') {
    return path.join(distRoot, routeSegment, 'index.html')
  }

  const segments = localizedPath.replace(/^\//, '').split('/')
  return path.join(distRoot, routeSegment, ...segments, 'index.html')
}

function buildAlternateLinks(pagePath) {
  return localeConfigs
    .map(({ locale, htmlLang, routeSegment }) =>
      `<link rel="alternate" hreflang="${htmlLang}" href="${buildPageUrl(locale, routeSegment, pagePath)}">`,
    )
    .concat(
      `<link rel="alternate" hreflang="x-default" href="${buildPageUrl(localeConfigs[0].locale, localeConfigs[0].routeSegment, pagePath)}">`,
    )
    .join('')
}

function buildMetaBlock({ fullTitle, description, url, ogLocale, pagePath }) {
  return [
    `<meta property="og:title" content="${escapeHtml(fullTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    '<meta property="og:type" content="website">',
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${DEFAULT_IMAGE}">`,
    `<meta property="og:locale" content="${ogLocale}">`,
    '<meta property="og:site_name" content="BreedZ">',
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeHtml(fullTitle)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `<meta name="twitter:image" content="${DEFAULT_IMAGE}">`,
    `<link rel="canonical" href="${url}">`,
    buildAlternateLinks(pagePath),
  ].join('')
}

function renderStaticPage(template, { htmlLang, fullTitle, description, metaBlock }) {
  return template
    .replace('<html>', `<html lang="${htmlLang}">`)
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`)
    .replace(
      /<meta name=description content=".*?">/,
      `<meta name=description content="${escapeHtml(description)}">`,
    )
    .replace('</head>', `${metaBlock}</head>`)
}

async function main() {
  const template = await readFile(templatePath, 'utf8')
  const generatedFiles = []

  for (const localeConfig of localeConfigs) {
    const localeMessages = messages[localeConfig.locale]

    for (const page of publicPages) {
      const title = getPathValue(localeMessages, page.titleKey)
      const description = getPathValue(localeMessages, page.descriptionKey)

      if (typeof title !== 'string' || typeof description !== 'string') {
        throw new Error(`Missing localized SEO copy for ${localeConfig.locale} ${page.path}`)
      }

      const fullTitle = `${title} | BreedZ`
      const url = buildPageUrl(localeConfig.locale, localeConfig.routeSegment, page.path)
      const outputPath = buildOutputPath(localeConfig.locale, localeConfig.routeSegment, page.path)
      const metaBlock = buildMetaBlock({
        fullTitle,
        description,
        url,
        ogLocale: localeConfig.ogLocale,
        pagePath: page.path,
      })

      const html = renderStaticPage(template, {
        htmlLang: localeConfig.htmlLang,
        fullTitle,
        description,
        metaBlock,
      })

      await mkdir(path.dirname(outputPath), { recursive: true })
      await writeFile(outputPath, html)
      generatedFiles.push(path.relative(distRoot, outputPath))
    }
  }

  console.log(`Generated ${generatedFiles.length} static public pages:`)
  for (const file of generatedFiles) {
    console.log(`- ${file}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
