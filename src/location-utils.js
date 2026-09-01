export function normalizeLocationName(value) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toLowerCase()
}

export function generateAllLocations(locationsData) {
  const residential = Object.entries(locationsData.unidades).flatMap(
    ([quadra, quadraData]) =>
      Array.from({ length: quadraData.total }, (_, index) => {
        const unidade = `${quadra}-${String(index + 1).padStart(2, '0')}`

        return {
          name: unidade,
          type: 'unidade',
          coordinates: quadraData.coordenadas[unidade] ?? null,
        }
      }),
  )

  const commonAreas = Object.entries(locationsData.areas_comuns).map(
    ([name, coordinates]) => ({
      name,
      type: 'area_comum',
      coordinates,
    }),
  )

  return [...residential, ...commonAreas]
}

export function findLocation(allLocations, value) {
  const normalizedValue = normalizeLocationName(value)

  return allLocations.find(
    (location) => normalizeLocationName(location.name) === normalizedValue,
  )
}

export function filterLocations(allLocations, value, limit = 10) {
  const normalizedValue = normalizeLocationName(value)

  if (!normalizedValue) return []

  return allLocations
    .filter((location) =>
      normalizeLocationName(location.name).includes(normalizedValue),
    )
    .slice(0, limit)
}

export function buildNavigationUrl(coordinates) {
  const destination = `${coordinates.lat},${coordinates.lng}`
  const encodedDestination = encodeURIComponent(destination)

  return `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}&travelmode=driving&dir_action=navigate`
}

export function openNavigation(
  coordinates,
  navigate = (url) => window.location.assign(url),
) {
  const navigationUrl = buildNavigationUrl(coordinates)
  navigate(navigationUrl)

  return navigationUrl
}
