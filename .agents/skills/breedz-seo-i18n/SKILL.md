# BreedZ SEO And I18n Skill

## When To Use

Use this skill for public pages, guide pages, localized routes, translations, sitemap entries, SEO metadata, canonical URLs, social previews, and public content strategy.

## Locales

BreedZ currently supports:

- English: `en`
- Brazilian Portuguese: `pt-br`
- Spanish: `es`

Write English first, then keep PT-BR and ES aligned.

## Key Files

- `src/pages`
- `src/layouts/PublicLayout.vue`
- `src/router/routes.js`
- `src/i18n/messages.js`
- `src/i18n/index.js`
- `src/i18n/localePreference.js`
- `src/utils/seo-meta.js`
- `src/utils/localeRouting.js`
- `public/sitemap.xml`
- `scripts/generate-static-public-pages.mjs`
- `AGENTS.md`
- `.agents/skills/breedz-roadmap/SKILL.md`

## Guide Workflow

- Make each guide answer a distinct search intent.
- Avoid thin duplicate keyword pages.
- Add localized routes for every supported locale.
- Update `public/sitemap.xml` when public routes change.
- Use existing SEO helpers for canonical, Open Graph, and Twitter metadata.
- Add one useful related-guide link when appropriate.
- Add sources when trust matters, especially for gestation, health, veterinary-adjacent, or regulatory content.
- Keep public pages readable without turning them into generic marketing copy.

## Current SEO Priorities

- `cattle-record-keeping-system`
- `animal-lineage-tracking-software`
- `how-to-track-cattle-pedigree`
- `how-to-avoid-missing-calving-dates`
- `cattle-app-offline`
- `forgot-cow-breeding-date`

## Current Baseline

Last known early Search Console signal:

- app age: about 1.5 months
- impressions: 530
- clicks: 3
- approximate CTR: 0.57%

That is not alarming for a young niche site. The opportunity is to tighten the cluster around searches BreedZ can satisfy better than broad ranch platforms.

## Competitor Patterns

Established cattle software:

- Examples: CattleMax, Ranchr, Ranch Pro.
- They do well with cattle-specific positioning, trust language, broad feature coverage, testimonials, offline or field-use messaging, and cattle record keeping pages.
- BreedZ gap: be narrower and more practical around breeding, expected birth, pregnancy check, birth, and weaning workflows.

Broad farm management suites:

- Examples: Mobble, Farmbrite, Barnsbook, Livestock Pulse, Mind the Farm.
- They cover many features such as mapping, inventory, finance, compliance, team access, and reporting.
- BreedZ gap: simple breeding-first records that work offline, then sync when needed.

Breeder-focused multi-species apps:

- Examples: Livestockstar, Mind the Farm, Barnsbook.
- They do well with breeding, lineage, due dates, offspring linking, species flexibility, and pricing clarity.
- BreedZ gap: build topical authority around cattle breeding operations first.

Calculator and informational pages:

- Examples: university extension calculators, CattleMax calculator, generic Spanish and Portuguese calculators.
- They match direct calculator intent but often stop at date output.
- BreedZ gap: explain operational next steps: save breeding record, schedule pregnancy check, watch calving window, record birth, link calf, avoid losing records next season.

## Best Opportunistic Gaps

### Breeding Workflow Pages

Targets:

- `how to track cattle breeding records`
- `cattle breeding record keeping system`
- `cow calf breeding records`
- `how to organize cattle breeding records`
- `cattle breeding records template vs app`

Use the minimum cow-calf record structure: cow, sire, breeding date, pregnancy check, expected calving date, actual birth, calf link, and weaning.

### Offline-First Cattle Records

Targets:

- `offline cattle record keeping app`
- `cattle app without internet`
- `farm record app without internet`
- `offline ranch management app`

Answer what still works with no signal: add animal, record breeding, record birth, record sale/death, check expected births, sync later.

### Lost Or Uncertain Breeding Date Recovery

Targets:

- `forgot-cow-breeding-date`
- `cow breeding date unknown`
- `missed calving date records`
- `how to fix cattle breeding records`

Do not pretend the exact date can always be recovered. Teach estimated windows, notes, and prevention.

### Commercial-Intent App Pages

Targets:

- `breeding-management-app`
- `breeding-record-keeping-app`
- `cattle-record-keeping-system`
- `animal-lineage-tracking-software`

Make each page distinct:

- `breeding-management-app`: workflow and follow-up
- `breeding-record-keeping-app`: records, history, backup, and sync
- `cattle-record-keeping-system`: whole cattle record structure, still simple
- `animal-lineage-tracking-software`: parent/offspring, dam/sire, breeding pair history, and pedigree-adjacent needs

### Spanish And Portuguese Practical Cattle Content

Targets:

- `app registros reproductivos ganado`
- `control reproductivo bovino app`
- `calculadora gestacion bovina`
- `aplicativo controle reprodutivo bovino`
- `aplicativo para manejo reprodutivo bovino`

Spanish and Portuguese pages should not read like translated English. Use local terms around `gado`, `rebanho`, `ganado`, `parto`, `cobertura`, `inseminação`, and `inseminación`.

### Spreadsheet Versus App Comparison

Targets:

- `cattle record keeping spreadsheet`
- `cattle breeding records spreadsheet`
- `herd management spreadsheet vs app`
- `livestock record keeping template`

Be honest: spreadsheets are fine for small, stable herds; apps become better when breeding, births, lineage, backup, and sync matter.

## Recommended 90-Day Content Plan

Phase 1, commercial intent:

1. `breeding-record-keeping-app`
2. `cattle-record-keeping-system`
3. `animal-lineage-tracking-software`

Phase 2, breeding workflow pain:

4. `cattle-breeding-record-keeping-system`
5. `forgot-cow-breeding-date`
6. `how-to-avoid-missing-calving-dates`

Phase 3, offline field use:

7. `cattle-app-offline`
8. `farm-management-app-without-internet`

Phase 4, comparison and utility:

9. `cattle-breeding-records-spreadsheet-vs-app`
10. `digital-calving-book`

## On-Page Improvements

- Make the first viewport answer who the page is for, what problem it solves, and what to do next.
- Add practical mini-tables such as record/why it matters/where it helps later, paper vs spreadsheet vs app, and breeding event/follow-up/next action.
- Add internal links by workflow, for example breeding dates guide -> cattle gestation calculator -> cow pregnancy guide -> lost records guide.
- Add product screenshots to commercial pages where the user compares tools.
- Keep informational guides simple and source-focused.
- Use clean demo data, not empty states.
- Add intent-based FAQs such as "Can I use BreedZ without internet?" and "What should I record after a cow is bred?"

Strong screenshot placements:

- Landing page: dashboard plus animal timeline first.
- `breeding-management-app`: dashboard lifecycle panels plus birth outcome flow.
- `breeding-records-app`: animal timeline plus event form/detail.
- `cattle-record-keeping-system`: dashboard plus export/sync/settings proof.
- `animal-lineage-tracking-software`: lineage and parent-offspring views.

## Product Gaps That Affect SEO

Do not over-promise these until built:

- Herd/location grouping: later supports `cattle pasture rotation records`, `cattle herd grouping app`, and `livestock movement records app`.
- Structured health records: later supports `cattle vaccination records app`, `livestock treatment records`, and `cattle withdrawal period records`.
- Financial reporting: later supports `cattle expense tracking app`, `livestock profit per animal`, and `farm income expense app`.

## Recommended Positioning

Best short-term positioning:

```text
BreedZ is the simple offline-first cattle breeding records app for farmers who need breeding history, expected births, lineage, and daily herd records without turning recordkeeping into office work.
```

Avoid for now:

- complete farm management platform
- AI ranch management
- farm accounting software
- pasture mapping software
- veterinary compliance system

## Priority Checklist

- [x] Publish `breeding-management-app`
- [ ] Publish `breeding-record-keeping-app`
- [ ] Publish `cattle-record-keeping-system`
- [x] Publish `cattle-breeding-record-keeping-system`
- [ ] Publish `forgot-cow-breeding-date`
- [ ] Publish `cattle-app-offline`
- [ ] Add product screenshots to commercial pages
- [ ] Add FAQ schema later if the current SEO setup supports structured data cleanly
- [x] Build localized guides hub
- [ ] Split i18n messages before the guide library grows much more

## Validation

```bash
npm test
npm run build:netlify
```

Use route-focused tests for localized routing changes.
