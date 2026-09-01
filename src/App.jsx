import { useMemo, useState } from 'react'
import locationsData from '../locations.json'
import {
  filterLocations,
  findLocation,
  generateAllLocations,
} from './location-utils.js'

const BRAND_ASSETS = {
  association: '/assets/ibiti-reserva.jpg',
  product: '/assets/ibiti-digital-map.png',
  developer: '/assets/mike-trindade.png',
}

function BrandImage({ src, alt, className, fallback }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <span className={`${className} brand-fallback`}>{fallback}</span>
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

export default function App() {
  const allLocations = useMemo(() => generateAllLocations(locationsData), [])
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [message, setMessage] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)

  const suggestions = useMemo(
    () => filterLocations(allLocations, searchTerm),
    [allLocations, searchTerm],
  )

  function startNavigation(location) {
    const { lat, lng } = location.coordinates
    const geoUrl = `geo:${lat},${lng}`

    window.open(geoUrl, '_blank', 'noopener,noreferrer')
  }

  function search(locationName = searchTerm) {
    const location = findLocation(allLocations, locationName)
    setShowSuggestions(false)

    if (!location) {
      setSelectedLocation(null)
      setMessage({ type: 'error', text: 'Local não existe.' })
      return
    }

    setSearchTerm(location.name)

    if (!location.coordinates) {
      setSelectedLocation(location)
      setMessage({
        type: 'warning',
        text: 'Local encontrado, mas as coordenadas ainda não estão disponíveis.',
      })
      return
    }

    setSelectedLocation(location)
    setMessage({ type: 'success', text: 'Local encontrado. Abrindo a navegação…' })
    startNavigation(location)
  }

  function handleSubmit(event) {
    event.preventDefault()
    search()
  }

  function handleChange(event) {
    setSearchTerm(event.target.value)
    setShowSuggestions(true)
    setMessage(null)
    setSelectedLocation(null)
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-content">
          <BrandImage
            src={BRAND_ASSETS.association}
            alt="Ibiti Reserva"
            className="association-logo"
            fallback="Ibiti Reserva"
          />
          <BrandImage
            src={BRAND_ASSETS.developer}
            alt="Mike Trindade — Desenvolvedor"
            className="developer-logo"
            fallback="Mike Trindade"
          />
        </div>
      </header>

      <main className="main-content">
        <section className="search-panel" aria-labelledby="page-title">
          <div className="product-brand">
            <BrandImage
              src={BRAND_ASSETS.product}
              alt="Ibiti Digital Map"
              className="product-logo"
              fallback="Ibiti Digital Map"
            />
            <h1 id="page-title">Encontre seu destino no Ibiti Reserva</h1>
            <p>Digite uma unidade ou área comum para iniciar a navegação.</p>
          </div>

          {selectedLocation && (
            <div className="selected-location" aria-live="polite">
              <PinIcon />
              <div>
                <span>Destino selecionado</span>
                <strong>{selectedLocation.name}</strong>
              </div>
            </div>
          )}

          <form className="search-form" onSubmit={handleSubmit}>
            <label htmlFor="location-search">Unidade ou local</label>
            <div className="search-control">
              <span className="search-icon"><SearchIcon /></span>
              <input
                id="location-search"
                type="search"
                value={searchTerm}
                onChange={handleChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Ex.: D5-01 ou Piscinas"
                autoComplete="off"
                aria-autocomplete="list"
                aria-controls="location-suggestions"
                aria-expanded={showSuggestions && suggestions.length > 0}
              />

              {showSuggestions && suggestions.length > 0 && (
                <ul id="location-suggestions" className="suggestions" role="listbox">
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.name}>
                      <button
                        type="button"
                        onClick={() => search(suggestion.name)}
                        role="option"
                      >
                        <PinIcon />
                        <span>{suggestion.name}</span>
                        <small>
                          {suggestion.type === 'unidade' ? 'Unidade' : 'Área comum'}
                        </small>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button className="search-button" type="submit">
              <SearchIcon />
              Encontrar localização
            </button>
          </form>

          {message && (
            <div className={`message message-${message.type}`} role="status">
              {message.text}
              {selectedLocation?.coordinates && (
                <button type="button" onClick={() => startNavigation(selectedLocation)}>
                  Abrir novamente
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        © Todos os direitos reservados | Desenvolvido por Mike Trindade
      </footer>
    </div>
  )
}
