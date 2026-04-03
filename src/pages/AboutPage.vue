<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-7">
        <q-card flat>
          <q-card-section>
            <div class="text-overline text-weight-bold text-primary">About</div>
            <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">About BreedZ</div>
            <div class="text-body1 text-grey-8 q-mb-lg">
              BreedZ is an offline herd management app focused on cattle breeding records, animal history, and field use.
              The goal is to make daily farm recordkeeping faster and less fragile than paper notes or scattered messages.
            </div>

            <div class="column q-gutter-lg">
              <div>
                <div class="text-h6 text-weight-bold q-mb-sm">What BreedZ is for</div>
                <div class="text-body1 text-grey-8">
                  Track animals, log breeding events, record births, and keep each animal history in one place.
                </div>
              </div>

              <div>
                <div class="text-h6 text-weight-bold q-mb-sm">Why it exists</div>
                <div class="text-body1 text-grey-8">
                  Many farms do not have reliable internet in the field, but still need clean records and fast
                  access when decisions have to be made on the spot.
                </div>
              </div>

              <div>
                <div class="text-h6 text-weight-bold q-mb-sm">Current stage</div>
                <div class="text-body1 text-grey-8">
                  BreedZ is in early product validation. The focus right now is a reliable offline-first
                  workflow before expanding into sync, backup, and broader management tools.
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
    title: 'About BreedZ',
    description:
      'Learn about BreedZ, an offline herd management app for cattle breeding records, animal history, and farm recordkeeping in the field.',
    path: '/about',
  }),
)
</script>
