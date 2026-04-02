<template>
  <q-layout view="lHh Lpr lFf" class="breedz-shell">
    <q-header class="q-pa-sm bg-transparent text-dark">
      <q-toolbar class="breedz-toolbar rounded-borders">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Toggle navigation"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="row items-center no-wrap q-gutter-sm">
          <div class="brand-mark">BZ</div>
          <div>
            <div class="text-h6 text-weight-bold">BreedZ</div>
            <div class="text-caption text-grey-7">Offline-first livestock records</div>
          </div>
        </q-toolbar-title>

        <q-badge color="positive" rounded class="q-px-sm q-py-xs">PWA ready</q-badge>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above :width="260" bordered class="breedz-drawer">
      <div class="q-pa-md">
        <div class="text-overline text-weight-bold text-grey-7">Workspace</div>
        <div class="text-h6 text-weight-bold">BreedZ MVP</div>
        <div class="text-caption text-grey-7">
          Built for daily field work, not office-heavy workflows.
        </div>
      </div>

      <q-list padding>
        <q-item v-for="item in navItems" :key="item.label" clickable>
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.label }}</q-item-label>
            <q-item-label caption>{{ item.caption }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div class="drawer-note q-ma-md q-pa-md rounded-borders">
        <div class="text-subtitle2 text-weight-bold">Safety baseline</div>
        <div class="text-caption text-grey-8">
          Local-first data storage with planned JSON import/export backup.
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const navItems = [
  {
    label: 'Today',
    caption: 'Pending actions and fast follow-up',
    icon: 'today',
  },
  {
    label: 'Animals',
    caption: 'Create, edit, and list livestock',
    icon: 'pets',
  },
  {
    label: 'Events',
    caption: 'Vaccination, breeding, birth, death',
    icon: 'assignment',
  },
  {
    label: 'Timeline',
    caption: 'Chronological animal history',
    icon: 'timeline',
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
