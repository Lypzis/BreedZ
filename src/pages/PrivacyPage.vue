<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-7">
        <q-card flat>
          <q-card-section>
            <div class="text-overline text-weight-bold text-primary">Privacy</div>
            <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">Privacy Policy</div>
            <div class="text-caption text-grey-7 q-mb-lg">Last updated: April 2, 2026</div>

            <div class="column q-gutter-lg">
              <div>
                <div class="text-h6 text-weight-bold q-mb-sm">What BreedZ stores</div>
                <div class="text-body1 text-grey-8">
                  BreedZ stores the records you enter, such as animal details, breeding events, birth history,
                  and notes needed to manage your herd.
                </div>
              </div>

              <div>
                <div class="text-h6 text-weight-bold q-mb-sm">Where data is stored</div>
                <div class="text-body1 text-grey-8">
                  In the current version, your data is stored locally on your device. That means records stay
                  on the phone, tablet, or computer where you use the app unless you later export or sync them.
                </div>
              </div>

              <div>
                <div class="text-h6 text-weight-bold q-mb-sm">What we collect</div>
                <div class="text-body1 text-grey-8">
                  At this stage, BreedZ does not require account creation for basic use. If contact or support
                  channels are added later, any submitted information will be handled only to respond or improve
                  the service.
                </div>
              </div>

              <div>
                <div class="text-h6 text-weight-bold q-mb-sm">Sharing</div>
                <div class="text-body1 text-grey-8">
                  We do not sell your herd records. If future sync, backup, or analytics features are added,
                  this policy will be updated before those features are broadly released.
                </div>
              </div>

              <div>
                <div class="text-h6 text-weight-bold q-mb-sm">Contact</div>
                <div class="text-body1 text-grey-8">
                  Privacy questions can be sent to
                  <a href="mailto:privacy@breedz.app" class="text-primary">privacy@breedz.app</a>.
                </div>
              </div>
            </div>
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
    title: 'Privacy Policy',
    description:
      'Read how BreedZ handles animal records, cattle breeding data, and locally stored herd management information.',
    path: '/privacy',
  }),
)
</script>
