<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-7">
        <q-card flat>
          <q-card-section>
            <div class="text-overline text-weight-bold text-primary">Terms</div>
            <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">Terms of Use</div>
            <div class="text-caption text-grey-7 q-mb-lg">Last updated: April 2, 2026</div>

            <div class="column q-gutter-lg">
              <div>
                <div class="text-h6 text-weight-bold q-mb-sm">Using BreedZ</div>
                <div class="text-body1 text-grey-8">
                  BreedZ is provided as a herd management app for recording animals, breeding events, births,
                  and related farm notes. You may use it only for lawful farm, ranch, or business purposes.
                </div>
              </div>

              <div>
                <div class="text-h6 text-weight-bold q-mb-sm">Your data</div>
                <div class="text-body1 text-grey-8">
                  You are responsible for the accuracy of the records you enter. BreedZ is a recordkeeping
                  tool and should not be treated as veterinary, legal, or financial advice.
                </div>
              </div>

              <div>
                <div class="text-h6 text-weight-bold q-mb-sm">Availability</div>
                <div class="text-body1 text-grey-8">
                  We may update, improve, or discontinue parts of the app over time. Some features may still
                  be in early access while the product is being validated.
                </div>
              </div>

              <div>
                <div class="text-h6 text-weight-bold q-mb-sm">Acceptable use</div>
                <div class="text-body1 text-grey-8">
                  You agree not to misuse the app, attempt to disrupt service, or use BreedZ for fraudulent,
                  unlawful, or harmful activity.
                </div>
              </div>

              <div>
                <div class="text-h6 text-weight-bold q-mb-sm">Liability</div>
                <div class="text-body1 text-grey-8">
                  BreedZ is provided on an as-is basis during this early stage. To the extent allowed by law,
                  BreedZ and its operator are not liable for business loss, data loss, or decisions made from
                  incomplete records.
                </div>
              </div>

              <div>
                <div class="text-h6 text-weight-bold q-mb-sm">Contact</div>
                <div class="text-body1 text-grey-8">
                  Questions about these terms can be sent to
                  <a href="mailto:legal@breedz.app" class="text-primary">legal@breedz.app</a>.
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
    title: 'Terms of Use',
    description:
      'Read the BreedZ terms for using the offline herd management app and cattle breeding recordkeeping tools.',
    path: '/terms',
  }),
)
</script>
