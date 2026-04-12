const SITE_URL = 'https://breedz.app'
const DEFAULT_IMAGE = `${SITE_URL}/icons/icon-512x512.png`

function normalizeCanonicalPath(path, trailingSlash) {
  if (!trailingSlash) {
    return path
  }

  if (path === '/') {
    return path
  }

  return path.endsWith('/') ? path : `${path}/`
}

export function buildPageMeta({ title, description, path, trailingSlash = false }) {
  const url = `${SITE_URL}${normalizeCanonicalPath(path, trailingSlash)}`
  const fullTitle = `${title} | BreedZ`

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
        content: 'website',
      },
      ogUrl: {
        property: 'og:url',
        content: url,
      },
      ogImage: {
        property: 'og:image',
        content: DEFAULT_IMAGE,
      },
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
        content: DEFAULT_IMAGE,
      },
    },
    link: {
      canonical: {
        rel: 'canonical',
        href: url,
      },
    },
  }
}
