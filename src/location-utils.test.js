import assert from 'node:assert/strict'
import test from 'node:test'
import locationsData from '../locations.json' with { type: 'json' }
import {
  buildNavigationUrl,
  filterLocations,
  findLocation,
  generateAllLocations,
  normalizeLocationName,
  openNavigation,
} from './location-utils.js'

const locations = generateAllLocations(locationsData)

test('gera todas as unidades e áreas comuns previstas', () => {
  const residentialTotal = Object.values(locationsData.unidades).reduce(
    (total, quadra) => total + quadra.total,
    0,
  )

  assert.equal(
    locations.length,
    residentialTotal + Object.keys(locationsData.areas_comuns).length,
  )
})

test('aceita variações simples do nome de uma unidade', () => {
  assert.equal(normalizeLocationName(' d5-01 '), 'd501')
  assert.equal(findLocation(locations, 'D5 01').name, 'D5-01')
})

test('busca áreas comuns sem depender de acentos', () => {
  assert.equal(findLocation(locations, 'Administracao').name, 'Administração')
  assert.equal(filterLocations(locations, 'piscina')[0].name, 'Piscinas')
})

test('preserva as coordenadas residenciais já cadastradas', () => {
  assert.deepEqual(findLocation(locations, 'C5-09').coordinates, {
    lat: -23.439878922806496,
    lng: -47.450280028240336,
  })
})

test('gera uma rota universal com o destino definido', () => {
  const navigationUrl = buildNavigationUrl({
    lat: -23.43820695194719,
    lng: -47.447510367357154,
  })

  assert.equal(
    navigationUrl,
    'https://www.google.com/maps/dir/?api=1&destination=-23.43820695194719%2C-47.447510367357154&travelmode=driving&dir_action=navigate',
  )
})

test('abre a rota automaticamente com uma única ação', () => {
  const openedUrls = []
  const coordinates = {
    lat: -23.43820695194719,
    lng: -47.447510367357154,
  }

  const navigationUrl = openNavigation(coordinates, (url) => openedUrls.push(url))

  assert.deepEqual(openedUrls, [navigationUrl])
  assert.match(navigationUrl, /destination=-23\.43820695194719%2C-47\.447510367357154/)
})
