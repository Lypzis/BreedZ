<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      bordered
      class="text-white"
      style="background: linear-gradient(270deg, var(--q-secondary) 0%, var(--q-primary) 100%)"
    >
      <q-toolbar class="q-px-sm q-py-xs">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Toggle navigation"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <router-link to="/" class="row items-center no-wrap q-gutter-sm text-white" style="text-decoration: none">
            <q-avatar rounded size="42px">
              <img :src="logoIcon" alt="BreedZ icon" />
            </q-avatar>
            <div>
              <div class="text-h6 text-weight-bold">BreedZ</div>
            </div>
          </router-link>
        </q-toolbar-title>

      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above :width="260" bordered class="bg-white">
      <q-item class="bg-green-1 q-py-md">
        <q-item-section>
          <q-item-label class="text-h6 text-weight-bold text-primary">BreedZ</q-item-label>
        </q-item-section>
      </q-item>

      <q-list padding>
        <q-item
          v-for="item in navItems"
          :key="item.label"
          :clickable="Boolean(item.to)"
          :disable="!item.to"
          :to="item.to"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-card flat class="q-ma-md bg-green-1">
        <q-card-section>
          <div class="text-subtitle2 text-weight-bold text-primary">Local-first</div>
          <div class="text-caption text-grey-8">Your records stay on this device.</div>
        </q-card-section>
      </q-card>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer bordered class="bg-white text-grey-8">
      <q-toolbar class="q-py-sm">
        <div class="row items-center justify-between full-width q-col-gutter-md">
          <div class="col-12 col-md-auto">
            <div class="row items-center q-gutter-md text-caption">
              <q-btn flat dense no-caps color="grey-8" label="Terms" to="/terms" />
              <q-btn flat dense no-caps color="grey-8" label="Privacy" to="/privacy" />
              <q-btn flat dense no-caps color="grey-8" label="Contact" to="/contact" />
              <q-btn flat dense no-caps color="grey-8" label="About" to="/about" />
            </div>
          </div>

          <div class="col-12 col-md-auto">
            <div class="row items-center q-gutter-sm text-caption">
              <q-avatar rounded size="24px">
                <img :src="logoSmall" alt="BreedZ small icon" />
              </q-avatar>
              <span>&copy; 2026 BreedZ by Lypzis. All rights reserved.</span>
            </div>
          </div>
        </div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const logoIcon = '/icons/favicon-96x96.png'
const logoSmall = '/icons/favicon-32x32.png'

const navItems = [
  {
    label: 'Dashboard',
    icon: 'today',
    to: '/app',
  },
  {
    label: 'Animals',
    icon: 'pets',
    to: '/app/animals',
  },
  {
    label: 'Events',
    icon: 'assignment',
    to: '/app/events',
  },
  {
    label: 'Settings',
    icon: 'settings',
    to: '/app/settings',
  },
  {
    label: 'Tutorial',
    icon: 'school',
    to: '/app/tutorial',
  },
  {
    label: 'Home',
    icon: 'home',
    to: '/',
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
