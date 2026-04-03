<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-7">
        <q-card flat>
          <q-card-section>
            <div class="text-overline text-weight-bold text-primary">Contact</div>
            <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">Get in touch</div>
            <div class="text-body1 text-grey-8 q-mb-lg">
              BreedZ is still in its early stage. If you want to ask a question, report a problem, or talk
              about using the app on your farm, reach out through one of the placeholder contacts below.
            </div>

            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="mail" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">General contact</q-item-label>
                  <q-item-label caption>
                    <a href="mailto:hello@breedz.app" class="text-primary">hello@breedz.app</a>
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="support_agent" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Support</q-item-label>
                  <q-item-label caption>
                    <a href="mailto:support@breedz.app" class="text-primary">support@breedz.app</a>
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="privacy_tip" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Privacy requests</q-item-label>
                  <q-item-label caption>
                    <a href="mailto:privacy@breedz.app" class="text-primary">privacy@breedz.app</a>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useMeta } from 'quasar'
import { buildPageMeta } from 'src/utils/seo-meta'

useMeta(
  buildPageMeta({
    title: 'Contact',
    description:
      'Contact BreedZ about the offline herd management app, cattle breeding records, support, privacy questions, or farm recordkeeping feedback.',
    path: '/contact',
  }),
)
</script>
