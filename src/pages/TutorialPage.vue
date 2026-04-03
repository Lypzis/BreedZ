<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <q-card flat>
          <q-card-section>
            <div class="text-overline text-weight-bold text-primary">Tutorial</div>
            <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">How BreedZ works</div>
            <div class="text-body1 text-grey-7">
              Start with the herd, link parents when you know them, and keep each animal history updated in a few simple steps for offline farm recordkeeping.
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-list separator>
              <q-item v-for="step in steps" :key="step.title">
                <q-item-section avatar top>
                  <q-avatar color="primary" text-color="white">{{ step.number }}</q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-subtitle1 text-weight-bold">
                    {{ step.title }}
                  </q-item-label>
                  <q-item-label class="text-body2 text-grey-7 q-mt-xs">
                    {{ step.description }}
                  </q-item-label>
                  <div class="row q-col-gutter-sm q-mt-sm">
                    <div
                      v-for="hint in step.hints"
                      :key="hint"
                      class="col-12"
                    >
                      <q-banner rounded class="bg-grey-1 text-grey-8">
                        <template #avatar>
                          <q-icon name="check_circle" color="primary" />
                        </template>
                        {{ hint }}
                      </q-banner>
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="text-overline text-weight-bold text-accent">Tips</div>
            <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">Good habits for local recordkeeping</div>

            <q-list>
              <q-item v-for="tip in tips" :key="tip">
                <q-item-section avatar>
                  <q-icon name="task_alt" color="accent" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ tip }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-auto">
                <q-btn unelevated color="primary" icon="pets" label="Open animals" to="/app/animals" />
              </div>
              <div class="col-12 col-sm-auto">
                <q-btn outline color="primary" icon="assignment" label="Open events" to="/app/events" />
              </div>
              <div class="col-12 col-sm-auto">
                <q-btn outline color="primary" icon="settings" label="Open settings" to="/app/settings" />
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
    title: 'Tutorial',
    description:
      'See how BreedZ works for herd management, cattle breeding records, lineage tracking, herd events, and offline farm recordkeeping.',
    path: '/app/tutorial',
  }),
)

const steps = [
  {
    number: '1',
    title: 'Add your animals',
    description: 'Start in the animals page and create one record for each animal you want to track.',
    hints: [
      'Use the tag as the required unique identifier.',
      'Name is optional, but it helps you recognize animals faster.',
    ],
  },
  {
    number: '2',
    title: 'Link dam and sire (Optional)',
    description: 'When parent information is known, connect lineage in the animal form so offspring history stays useful later.',
    hints: [
      'Parent picker filters automatically.',
      'You can leave lineage blank and fill it in later.',
    ],
  },
  {
    number: '3',
    title: 'Record events as they happen',
    description: 'Use the animal timeline or the events page to log breeding, calving, vaccination, health, and custom notes.',
    hints: [
      'Use animal page for one animal.',
      'Use events page for the whole herd.',
    ],
  },
  {
    number: '4',
    title: 'Review history per animal',
    description: 'Open an animal to see its timeline, linked parents, and linked offspring in one place.',
    hints: [
      'Use this view to verify lineage and check the latest records before making decisions.',
    ],
  },
  {
    number: '5',
    title: 'Back up your records',
    description: 'Go to settings and export a JSON backup so you can keep a safe copy of your local data.',
    hints: [
      'Import replaces existing data — export first to stay safe.',
    ],
  },
]

const tips = [
  'Add records the same day to avoid losing dates and details.',
  'Use notes for context, not as a replacement for structured lineage and events.',
  'Export a backup regularly if this device holds your main herd history.',
]
</script>
