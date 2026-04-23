import test from 'node:test'
import assert from 'node:assert/strict'

import { buildLocalizedPath, isAppShellPath } from '../src/utils/localeRouting.js'

test('overview is treated as an app shell route', () => {
  assert.equal(isAppShellPath('/overview'), true)
})

test('localized public paths remain localized', () => {
  assert.equal(buildLocalizedPath('pt-BR', '/contact'), '/pt-br/contato')
})
