import test from 'node:test'
import assert from 'node:assert/strict'

import { buildLocalizedPath, isAppShellPath } from '../src/utils/localeRouting.js'

test('overview is treated as an app shell route', () => {
  assert.equal(isAppShellPath('/overview'), true)
})

test('localized public paths remain localized', () => {
  assert.equal(buildLocalizedPath('pt-BR', '/contact'), '/pt-br/contato')
  assert.equal(
    buildLocalizedPath('es', '/guides/how-long-is-cow-pregnancy'),
    '/es/guias/cuanto-dura-la-gestacion-de-una-vaca',
  )
  assert.equal(
    buildLocalizedPath('pt-BR', '/guides/cattle-gestation-calculator'),
    '/pt-br/guias/calculadora-de-gestacao-bovina',
  )
  assert.equal(
    buildLocalizedPath('es', '/guides/breeding-management-app'),
    '/es/guias/app-para-manejo-reproductivo-del-ganado',
  )
  assert.equal(
    buildLocalizedPath('pt-BR', '/guides/how-to-avoid-missing-calving-dates'),
    '/pt-br/guias/como-evitar-perder-datas-de-parto',
  )
  assert.equal(
    buildLocalizedPath('es', '/guides/how-to-avoid-missing-calving-dates'),
    '/es/guias/como-evitar-perder-fechas-de-parto',
  )
  assert.equal(buildLocalizedPath('pt-BR', '/guides'), '/pt-br/guias')
  assert.equal(buildLocalizedPath('es', '/guides'), '/es/guias')
})
