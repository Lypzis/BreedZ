<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <q-card flat>
          <q-card-section>
            <div class="text-overline text-weight-bold text-primary">{{ t('tutorial.overline') }}</div>
            <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">{{ t('tutorial.title') }}</div>
            <div class="text-body1 text-grey-7">
              {{ t('tutorial.description') }}
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
            <div class="text-overline text-weight-bold text-accent">{{ t('tutorial.tipsOverline') }}</div>
            <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">{{ t('tutorial.tipsTitle') }}</div>

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
                <q-btn unelevated color="primary" icon="pets" :label="t('tutorial.openAnimals')" to="/animals" />
              </div>
              <div class="col-12 col-sm-auto">
                <q-btn outline color="primary" icon="assignment" :label="t('tutorial.openEvents')" to="/events" />
              </div>
              <div class="col-12 col-sm-auto">
                <q-btn outline color="primary" icon="settings" :label="t('tutorial.openSettings')" to="/settings" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useMeta } from 'quasar'
import { useI18nText } from 'src/i18n'
import { buildPageMeta } from 'src/utils/seo-meta'

const { t, tm } = useI18nText()

useMeta(() =>
  buildPageMeta({
    title: t('tutorial.meta.title'),
    description: t('tutorial.meta.description'),
    path: '/tutorial',
  }),
)

const steps = computed(() => tm('tutorial.steps') ?? [])
const tips = computed(() => tm('tutorial.tips') ?? [])
</script>
