import { buildLocalizedPath } from './localeRouting.js'

export const SITE_URL = 'https://breedz.app'
const DEFAULT_IMAGE = `${SITE_URL}/icons/icon-512x512.png`
const ORGANIZATION_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`
const AUTHOR_ID = `${SITE_URL}/#victor-v-piccoli`
const AUTHOR_NAME = 'Victor V. Piccoli (Lypzis)'

const OG_LOCALES = {
  en: 'en_US',
  'pt-BR': 'pt_BR',
  es: 'es_ES',
}

function normalizeCanonicalPath(path, trailingSlash) {
  if (!trailingSlash) {
    return path
  }

  if (path === '/') {
    return path
  }

  return path.endsWith('/') ? path : `${path}/`
}

function absoluteUrl(value) {
  if (/^https?:\/\//.test(String(value || ''))) {
    return value
  }

  return `${SITE_URL}${value}`
}

export function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => {
    const escapes = {
      '<': '\\u003c',
      '>': '\\u003e',
      '&': '\\u0026',
      '\u2028': '\\u2028',
      '\u2029': '\\u2029',
    }

    return escapes[character]
  })
}

export function buildLocalizedAlternateLinks(internalPath) {
  return {
    alternateEn: {
      rel: 'alternate',
      hreflang: 'en',
      href: absoluteUrl(buildLocalizedPath('en', internalPath)),
    },
    alternatePtBr: {
      rel: 'alternate',
      hreflang: 'pt-BR',
      href: absoluteUrl(buildLocalizedPath('pt-BR', internalPath)),
    },
    alternateEs: {
      rel: 'alternate',
      hreflang: 'es',
      href: absoluteUrl(buildLocalizedPath('es', internalPath)),
    },
    alternateDefault: {
      rel: 'alternate',
      hreflang: 'x-default',
      href: absoluteUrl(buildLocalizedPath('en', internalPath)),
    },
  }
}

function buildOrganizationSchema() {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'BreedZ',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: DEFAULT_IMAGE,
      width: 512,
      height: 512,
    },
  }
}

function buildWebsiteSchema(locale) {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'BreedZ',
    url: absoluteUrl(buildLocalizedPath(locale, '/')),
    inLanguage: locale,
    publisher: { '@id': ORGANIZATION_ID },
  }
}

function buildAuthorSchema(locale) {
  return {
    '@type': 'Person',
    '@id': AUTHOR_ID,
    name: AUTHOR_NAME,
    jobTitle: 'Founder',
    url: `${absoluteUrl(buildLocalizedPath(locale, '/about'))}#victor-v-piccoli`,
    worksFor: { '@id': ORGANIZATION_ID },
  }
}

export function buildPageMeta({
  title,
  description,
  path,
  trailingSlash = false,
  image = DEFAULT_IMAGE,
  type = 'website',
  locale,
  internalPath,
}) {
  const url = `${SITE_URL}${normalizeCanonicalPath(path, trailingSlash)}`
  const fullTitle = `${title} | BreedZ`
  const resolvedImage = absoluteUrl(image)
  const alternateLinks = internalPath ? buildLocalizedAlternateLinks(internalPath) : {}

  return {
    title: fullTitle,
    meta: {
      description: {
        name: 'description',
        content: description,
      },
      ogTitle: {
        property: 'og:title',
        content: fullTitle,
      },
      ogDescription: {
        property: 'og:description',
        content: description,
      },
      ogType: {
        property: 'og:type',
        content: type,
      },
      ogUrl: {
        property: 'og:url',
        content: url,
      },
      ogImage: {
        property: 'og:image',
        content: resolvedImage,
      },
      ...(locale
        ? {
            ogLocale: {
              property: 'og:locale',
              content: OG_LOCALES[locale] || locale,
            },
          }
        : {}),
      twitterCard: {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      twitterTitle: {
        name: 'twitter:title',
        content: fullTitle,
      },
      twitterDescription: {
        name: 'twitter:description',
        content: description,
      },
      twitterImage: {
        name: 'twitter:image',
        content: resolvedImage,
      },
    },
    link: {
      canonical: {
        rel: 'canonical',
        href: url,
      },
      ...alternateLinks,
    },
  }
}

export function buildGuideMeta({
  title,
  description,
  internalPath,
  locale,
  publishedAt,
  modifiedAt,
  image,
  guidesLabel,
}) {
  const path = buildLocalizedPath(locale, internalPath)
  const url = absoluteUrl(path)
  const guidesUrl = absoluteUrl(buildLocalizedPath(locale, '/guides'))
  const resolvedImage = absoluteUrl(image || DEFAULT_IMAGE)
  const meta = buildPageMeta({
    title,
    description,
    path,
    image: resolvedImage,
    type: 'article',
    locale,
    internalPath,
  })
  const article = {
    '@type': 'Article',
    '@id': `${url}#article`,
    url,
    mainEntityOfPage: url,
    headline: title,
    description,
    inLanguage: locale,
    datePublished: publishedAt,
    dateModified: modifiedAt,
    image: resolvedImage,
    author: { '@id': AUTHOR_ID },
    publisher: { '@id': ORGANIZATION_ID },
    isPartOf: { '@id': WEBSITE_ID },
  }
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: guidesLabel || 'Guides',
        item: guidesUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: title,
        item: url,
      },
    ],
  }

  meta.meta.articlePublishedTime = {
    property: 'article:published_time',
    content: publishedAt,
  }
  meta.meta.articleModifiedTime = {
    property: 'article:modified_time',
    content: modifiedAt,
  }
  meta.meta.articleAuthor = {
    property: 'article:author',
    content: AUTHOR_NAME,
  }
  meta.script = {
    guideStructuredData: {
      type: 'application/ld+json',
      innerHTML: serializeJsonLd({
        '@context': 'https://schema.org',
        '@graph': [
          article,
          breadcrumb,
          buildAuthorSchema(locale),
          buildOrganizationSchema(),
          buildWebsiteSchema(locale),
        ],
      }),
    },
  }

  return meta
}

export function buildSiteEntityMeta({ locale, includeFounder = false } = {}) {
  const graph = [buildOrganizationSchema(), buildWebsiteSchema(locale)]

  if (includeFounder) {
    graph.push(buildAuthorSchema(locale))
  }

  return {
    script: {
      siteStructuredData: {
        type: 'application/ld+json',
        innerHTML: serializeJsonLd({
          '@context': 'https://schema.org',
          '@graph': graph,
        }),
      },
    },
  }
}
