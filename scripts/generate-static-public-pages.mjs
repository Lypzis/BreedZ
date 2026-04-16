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
  {
    locale: 'es',
    routeSegment: 'es',
    htmlLang: 'es',
    ogLocale: 'es_ES',
  },
]

const localizedPublicPaths = {
  en: {
    '/': '/',
    '/guides/track-cattle-breeding-dates': '/guides/track-cattle-breeding-dates',
    '/guides/how-to-track-cattle-lineage': '/guides/how-to-track-cattle-lineage',
    '/about': '/about',
    '/contact': '/contact',
    '/privacy': '/privacy',
    '/terms': '/terms',
  },
  'pt-BR': {
    '/': '/',
    '/guides/track-cattle-breeding-dates': '/guias/acompanhar-datas-de-cobertura-no-gado',
    '/guides/how-to-track-cattle-lineage': '/guias/como-acompanhar-linhagem-no-gado',
    '/about': '/sobre',
    '/contact': '/contato',
    '/privacy': '/privacidade',
    '/terms': '/termos',
  },
  es: {
    '/': '/',
    '/guides/track-cattle-breeding-dates': '/guias/registrar-fechas-de-reproduccion-del-ganado',
    '/guides/how-to-track-cattle-lineage': '/guias/como-rastrear-el-linaje-del-ganado',
    '/about': '/acerca-de',
    '/contact': '/contacto',
    '/privacy': '/privacidad',
    '/terms': '/terminos',
  },
}

const publicPages = [
  {
    path: '/',
    titleKey: 'home.meta.title',
    descriptionKey: 'home.meta.description',
    renderBody: renderHomePage,
  },
  {
    path: '/guides/track-cattle-breeding-dates',
    titleKey: 'guideBreedingDates.meta.title',
    descriptionKey: 'guideBreedingDates.meta.description',
    renderBody: renderGuideBreedingDatesPage,
  },
  {
    path: '/guides/how-to-track-cattle-lineage',
    titleKey: 'guideCattleLineage.meta.title',
    descriptionKey: 'guideCattleLineage.meta.description',
    renderBody: renderGuideCattleLineagePage,
  },
  {
    path: '/about',
    titleKey: 'about.meta.title',
    descriptionKey: 'about.meta.description',
    renderBody: renderAboutPage,
  },
  {
    path: '/contact',
    titleKey: 'contact.meta.title',
    descriptionKey: 'contact.meta.description',
    renderBody: renderContactPage,
  },
  {
    path: '/privacy',
    titleKey: 'privacy.meta.title',
    descriptionKey: 'privacy.meta.description',
    renderBody: renderPrivacyPage,
  },
  {
    path: '/terms',
    titleKey: 'terms.meta.title',
    descriptionKey: 'terms.meta.description',
    renderBody: renderTermsPage,
  },
]

const staticStyles = `
<style id="breedz-static-public-styles">
  :root {
    color-scheme: light;
  }

  body {
    margin: 0;
    font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: #f6f8f5;
    color: #213127;
  }

  .breedz-static-shell {
    min-height: 100vh;
    padding: 24px 16px 40px;
  }

  .breedz-static-wrap {
    max-width: 980px;
    margin: 0 auto;
  }

  .breedz-static-card {
    background: #ffffff;
    border-radius: 18px;
    box-shadow: 0 8px 28px rgba(35, 58, 42, 0.08);
    padding: 24px;
  }

  .breedz-static-overline {
    margin: 0 0 10px;
    color: #2a6438;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .breedz-static-title {
    margin: 0 0 14px;
    font-size: clamp(2rem, 3vw, 2.6rem);
    line-height: 1.15;
  }

  .breedz-static-subtitle,
  .breedz-static-copy,
  .breedz-static-block p,
  .breedz-static-faq-answer,
  .breedz-static-list li {
    margin: 0;
    color: #4f5d53;
    line-height: 1.7;
  }

  .breedz-static-subtitle {
    font-size: 1.05rem;
  }

  .breedz-static-block + .breedz-static-block,
  .breedz-static-grid + .breedz-static-block,
  .breedz-static-banner + .breedz-static-block,
  .breedz-static-cta + .breedz-static-block {
    margin-top: 28px;
  }

  .breedz-static-block-title {
    margin: 0 0 10px;
    font-size: 1.25rem;
    line-height: 1.3;
  }

  .breedz-static-grid {
    display: grid;
    gap: 16px;
    margin-top: 24px;
  }

  .breedz-static-grid--two {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }

  .breedz-static-panel {
    padding: 18px;
    border: 1px solid #e3e8e2;
    border-radius: 14px;
    background: #fbfcfb;
  }

  .breedz-static-panel-title {
    margin: 0 0 8px;
    font-size: 1rem;
    font-weight: 700;
    color: #213127;
  }

  .breedz-static-list,
  .breedz-static-faq-list {
    margin: 0;
    padding-left: 20px;
  }

  .breedz-static-list li + li,
  .breedz-static-faq-item + .breedz-static-faq-item {
    margin-top: 10px;
  }

  .breedz-static-banner {
    margin-top: 20px;
    padding: 16px 18px;
    border-radius: 14px;
    background: #eef6ef;
    color: #2a6438;
    font-weight: 600;
    line-height: 1.6;
  }

  .breedz-static-banner--accent {
    background: #fff2e7;
    color: #7b4d2a;
  }

  .breedz-static-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 18px;
  }

  .breedz-static-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0 18px;
    border-radius: 12px;
    border: 1px solid #2a6438;
    text-decoration: none;
    font-weight: 700;
    line-height: 1;
  }

  .breedz-static-button--primary {
    background: #2a6438;
    color: #ffffff;
  }

  .breedz-static-button--secondary {
    background: #ffffff;
    color: #2a6438;
  }

  .breedz-static-faq-question {
    margin: 0 0 4px;
    font-size: 1rem;
    font-weight: 700;
    color: #213127;
  }

  .breedz-static-meta {
    margin: 0 0 22px;
    color: #6f7a72;
    font-size: 0.95rem;
  }

  .breedz-static-contact-list {
    display: grid;
    gap: 14px;
  }

  .breedz-static-contact-item {
    padding: 16px 18px;
    border: 1px solid #e3e8e2;
    border-radius: 14px;
    background: #fbfcfb;
  }

  .breedz-static-contact-item strong,
  .breedz-static-contact-item a {
    display: block;
  }

  .breedz-static-contact-item a {
    margin-top: 4px;
    color: #2a6438;
    text-decoration: none;
    font-weight: 600;
  }

  .breedz-static-contact-item a:hover {
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    .breedz-static-card {
      padding: 20px 18px;
    }

    .breedz-static-shell {
      padding: 16px 12px 28px;
    }
  }
</style>
`.trim()

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

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("'", '&#39;')
}

function buildPageUrl(locale, routeSegment, pagePath) {
  const localizedPath = localizePublicPath(locale, pagePath)

  return localizedPath === '/'
    ? `${SITE_URL}/${routeSegment}/`
    : `${SITE_URL}/${routeSegment}${localizedPath}/`
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
    staticStyles,
  ].join('')
}

function renderList(items) {
  return `<ul class="breedz-static-list">${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('')}</ul>`
}

function renderFaqs(faqs) {
  return `<div class="breedz-static-faq-list">${faqs
    .map(
      (faq) => `
        <article class="breedz-static-faq-item">
          <h3 class="breedz-static-faq-question">${escapeHtml(faq.question)}</h3>
          <p class="breedz-static-faq-answer">${escapeHtml(faq.answer)}</p>
        </article>
      `,
    )
    .join('')}</div>`
}

function renderActions(actions) {
  return `<div class="breedz-static-actions">${actions
    .map(
      ({ href, label, primary = false }) =>
        `<a class="breedz-static-button ${primary ? 'breedz-static-button--primary' : 'breedz-static-button--secondary'}" href="${escapeAttribute(href)}">${escapeHtml(label)}</a>`,
    )
    .join('')}</div>`
}

function renderPanels(items) {
  return `<div class="breedz-static-grid breedz-static-grid--two">${items
    .map(
      (item) => `
        <section class="breedz-static-panel">
          <h3 class="breedz-static-panel-title">${escapeHtml(item.title)}</h3>
          <p class="breedz-static-copy">${escapeHtml(item.description)}</p>
          <div class="breedz-static-banner">${escapeHtml(item.chip)}</div>
        </section>
      `,
    )
    .join('')}</div>`
}

function renderBlocks(blocks) {
  return blocks
    .map(
      (block) => `
        <section class="breedz-static-block">
          <h2 class="breedz-static-block-title">${escapeHtml(block.title)}</h2>
          <p>${escapeHtml(block.body)}</p>
        </section>
      `,
    )
    .join('')
}

function wrapContent({ overline, title, description, innerHtml, meta }) {
  return `
    <div class="breedz-static-shell">
      <main class="breedz-static-wrap">
        <article class="breedz-static-card">
          ${overline ? `<p class="breedz-static-overline">${escapeHtml(overline)}</p>` : ''}
          <h1 class="breedz-static-title">${escapeHtml(title)}</h1>
          ${meta ? `<p class="breedz-static-meta">${escapeHtml(meta)}</p>` : ''}
          ${description ? `<p class="breedz-static-subtitle">${escapeHtml(description)}</p>` : ''}
          ${innerHtml}
        </article>
      </main>
    </div>
  `.trim()
}

function renderHomePage(localeConfig, pagePath, localeMessages) {
  const home = localeMessages.home

  return wrapContent({
    overline: home.overline,
    title: home.heroTitle,
    description: home.heroSubtitle,
    innerHtml: [
      `<div class="breedz-static-banner">${escapeHtml(home.heroBanner)}</div>`,
      renderActions([
        { href: '/', label: home.openDashboard, primary: true },
        { href: '/tutorial', label: home.seeHowItWorks },
      ]),
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(home.appTitle)}</h2>
        <p class="breedz-static-copy">${escapeHtml(home.featuresDescription)}</p>
        ${renderPanels(home.appItems)}
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(home.problemTitle)}</h2>
        ${renderList(home.problemItems)}
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(home.featuresTitle)}</h2>
        ${renderList(home.featuresItems)}
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(home.howItWorksTitle)}</h2>
        ${renderList(home.howItWorksItems)}
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(home.offlineTitle)}</h2>
        ${renderList(home.offlineItems)}
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(home.premiumTitle)}</h2>
        <p class="breedz-static-copy">${escapeHtml(home.premiumDescription)}</p>
        ${renderList(home.premiumItems)}
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(home.guidesTitle)}</h2>
        <p class="breedz-static-copy">${escapeHtml(home.guidesDescription)}</p>
        <div class="breedz-static-grid breedz-static-grid--two">
          <section class="breedz-static-panel">
            <h3 class="breedz-static-panel-title">${escapeHtml(localeMessages.guideBreedingDates.title)}</h3>
            <p class="breedz-static-copy">${escapeHtml(home.breedingGuideDescription)}</p>
            ${renderActions([
              {
                href: buildPageUrl(localeConfig.locale, localeConfig.routeSegment, '/guides/track-cattle-breeding-dates'),
                label: home.openBreedingGuide,
                primary: false,
              },
            ])}
          </section>
          <section class="breedz-static-panel">
            <h3 class="breedz-static-panel-title">${escapeHtml(home.lineageGuideTitle)}</h3>
            <p class="breedz-static-copy">${escapeHtml(home.lineageGuideDescription)}</p>
            ${renderActions([
              {
                href: buildPageUrl(localeConfig.locale, localeConfig.routeSegment, '/guides/how-to-track-cattle-lineage'),
                label: home.openLineageGuide,
                primary: false,
              },
            ])}
          </section>
        </div>
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(home.faqTitle)}</h2>
        ${renderFaqs(home.faqs)}
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(home.ctaTitle)}</h2>
        ${renderActions([{ href: '/', label: home.openDashboard, primary: true }])}
      </section>`,
    ].join(''),
  })
}

function renderGuideBreedingDatesPage(localeConfig, pagePath, localeMessages) {
  const guide = localeMessages.guideBreedingDates

  return wrapContent({
    overline: guide.overline,
    title: guide.title,
    description: guide.description,
    innerHtml: [
      renderActions([
        { href: '/', label: guide.openApp, primary: true },
        { href: '/tutorial', label: guide.openTutorial },
      ]),
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(guide.problemTitle)}</h2>
        ${renderList(guide.problemItems)}
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(guide.logicTitle)}</h2>
        <p class="breedz-static-copy">${escapeHtml(guide.logicDescription)}</p>
        ${renderList(guide.logicSteps)}
        <div class="breedz-static-banner">${escapeHtml(`${guide.exampleLabel} ${guide.exampleText}`)}</div>
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(guide.commonWaysTitle)}</h2>
        ${renderList(guide.commonWaysItems)}
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(guide.breaksTitle)}</h2>
        ${renderList(guide.breaksItems)}
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(guide.betterWayTitle)}</h2>
        <p class="breedz-static-copy">${escapeHtml(guide.betterWayDescription)}</p>
        ${renderList(guide.betterWayItems)}
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(guide.tipsTitle)}</h2>
        ${renderList(guide.tipsItems)}
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(guide.faqTitle)}</h2>
        ${renderFaqs(guide.faqs)}
      </section>`,
    ].join(''),
  })
}

function renderGuideCattleLineagePage(localeConfig, pagePath, localeMessages) {
  const guide = localeMessages.guideCattleLineage

  return wrapContent({
    overline: guide.overline,
    title: guide.title,
    description: guide.description,
    innerHtml: [
      renderActions([{ href: '/', label: guide.openApp, primary: true }]),
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(guide.hookTitle)}</h2>
        <p class="breedz-static-copy">${escapeHtml(guide.hookDescription)}</p>
        ${renderList(guide.hookItems)}
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(guide.realFarmsTitle)}</h2>
        <p class="breedz-static-copy">${escapeHtml(guide.realFarmsDescription)}</p>
        ${renderList(guide.realFarmsItems)}
        <div class="breedz-static-banner breedz-static-banner--accent">${escapeHtml(guide.realFarmsTakeaway)}</div>
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(guide.systemTitle)}</h2>
        <p class="breedz-static-copy">${escapeHtml(guide.systemDescription)}</p>
        <div class="breedz-static-grid">${guide.systemSteps
          .map(
            (step) => `
              <section class="breedz-static-panel">
                <h3 class="breedz-static-panel-title">${escapeHtml(step.title)}</h3>
                <p class="breedz-static-copy">${escapeHtml(step.description)}</p>
                ${Array.isArray(step.items) && step.items.length ? renderList(step.items) : ''}
              </section>
            `,
          )
          .join('')}</div>
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(guide.changesTitle)}</h2>
        ${renderList(guide.changesItems)}
        <div class="breedz-static-banner">${escapeHtml(guide.changesTakeaway)}</div>
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(guide.toolsTitle)}</h2>
        <p class="breedz-static-copy">${escapeHtml(guide.toolsDescription)}</p>
        ${renderList(guide.toolsItems)}
      </section>`,
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(guide.takeawayTitle)}</h2>
        <p class="breedz-static-copy">${escapeHtml(guide.takeawayDescription)}</p>
        <div class="breedz-static-banner">${escapeHtml(guide.takeawayBanner)}</div>
      </section>`,
    ].join(''),
  })
}

function renderAboutPage(localeConfig, pagePath, localeMessages) {
  const about = localeMessages.about

  return wrapContent({
    overline: about.overline,
    title: about.title,
    description: about.intro,
    innerHtml: renderBlocks(about.blocks),
  })
}

function renderContactPage(localeConfig, pagePath, localeMessages) {
  const contact = localeMessages.contact

  return wrapContent({
    overline: contact.overline,
    title: contact.title,
    description: contact.intro,
    innerHtml: `
      <div class="breedz-static-contact-list">
        ${contact.items
          .map(
            (item) => `
              <section class="breedz-static-contact-item">
                <strong>${escapeHtml(item.title)}</strong>
                <a href="mailto:${escapeAttribute(item.email)}">${escapeHtml(item.email)}</a>
              </section>
            `,
          )
          .join('')}
      </div>
    `,
  })
}

function renderPrivacyPage(localeConfig, pagePath, localeMessages) {
  const privacy = localeMessages.privacy

  return wrapContent({
    overline: privacy.overline,
    title: privacy.title,
    meta: privacy.lastUpdated,
    innerHtml: [
      renderBlocks(privacy.blocks),
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(privacy.contactTitle)}</h2>
        <p>${escapeHtml(privacy.contactBody)} <a href="mailto:privacy@breedz.app">privacy@breedz.app</a>.</p>
      </section>`,
    ].join(''),
  })
}

function renderTermsPage(localeConfig, pagePath, localeMessages) {
  const terms = localeMessages.terms

  return wrapContent({
    overline: terms.overline,
    title: terms.title,
    meta: terms.lastUpdated,
    innerHtml: [
      renderBlocks(terms.blocks),
      `<section class="breedz-static-block">
        <h2 class="breedz-static-block-title">${escapeHtml(terms.contactTitle)}</h2>
        <p>${escapeHtml(terms.contactBody)} <a href="mailto:legal@breedz.app">legal@breedz.app</a>.</p>
      </section>`,
    ].join(''),
  })
}

function renderStaticPage(template, { htmlLang, fullTitle, description, metaBlock, bodyContent }) {
  return template
    .replace('<html>', `<html lang="${htmlLang}">`)
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`)
    .replace(
      /<meta name=description content=".*?">/,
      `<meta name=description content="${escapeHtml(description)}">`,
    )
    .replace('</head>', `${metaBlock}</head>`)
    .replace('<div id=q-app></div>', `<div id=q-app>${bodyContent}</div>`)
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
      const bodyContent = page.renderBody(localeConfig, page.path, localeMessages)

      const html = renderStaticPage(template, {
        htmlLang: localeConfig.htmlLang,
        fullTitle,
        description,
        metaBlock,
        bodyContent,
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
