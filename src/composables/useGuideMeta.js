import { useMeta } from 'quasar'
import { getGuideManifestEntry } from 'src/utils/guide-manifest'
import { buildGuideMeta } from 'src/utils/seo-meta'

export function useGuideMeta(guideKey, t, routeLocale, options = {}) {
  const guide = getGuideManifestEntry(guideKey)

  useMeta(() =>
    buildGuideMeta({
      title: t(`${guide.messageKey}.meta.title`),
      description: t(`${guide.messageKey}.meta.description`),
      internalPath: guide.internalPath,
      locale: routeLocale.value,
      publishedAt: guide.publishedAt,
      modifiedAt: guide.modifiedAt,
      image: guide.image,
      guidesLabel: t('guideArticle.guides'),
      faqs: options.faqs?.value || options.faqs || [],
    }),
  )

  return guide
}
