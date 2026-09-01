import { useMemo, useState } from 'react'
import locationsData from '../locations.json'
import {
  buildNavigationLinks,
  filterLocations,
  findLocation,
  generateAllLocations,
} from './location-utils.js'

const BRAND_ASSETS = {
  association: '/assets/ibiti-reserva.png',
  product: '/assets/zelunexa-guia.png',
  productIcon: '/assets/zelunexa-guia-icon.png',
  map: '/assets/ibiti-reserva-map.jpg',
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

function RouteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h3a3 3 0 0 0 3-3V8a3 3 0 0 1 3-3" />
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
    setMessage({
      type: 'success',
      text: 'Local encontrado. Escolha o aplicativo para iniciar a rota.',
    })
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
          <div className="association-brand">
            <BrandImage
              src={BRAND_ASSETS.association}
              alt="Ibiti Reserva"
              className="association-logo"
              fallback="Ibiti Reserva"
            />
            <strong>GUIA DIGITAL IBITI RESERVA</strong>
          </div>
          <BrandImage
            src={BRAND_ASSETS.productIcon}
            alt="Zelunexa Guia"
            className="header-product-icon"
            fallback="Zelunexa Guia"
          />
        </div>
      </header>

      <main className="main-content">
        <div className="content-grid">
          <section className="search-panel" aria-labelledby="page-title">
            <div className="product-brand">
              <BrandImage
                src={BRAND_ASSETS.product}
                alt="Zelunexa Guia — Conectar para zelar"
                className="product-logo"
                fallback="Zelunexa Guia"
              />
            </div>

            <div className="search-intro">
              <span className="eyebrow">Navegação inteligente</span>
              <h1 id="page-title">Encontre seu destino no Ibiti Reserva</h1>
              <p>Digite uma unidade ou área comum e escolha seu aplicativo de GPS.</p>
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
              </div>
            )}

            {selectedLocation?.coordinates && (
              <nav className="navigation-options" aria-label="Aplicativos de navegação">
                {(() => {
                  const links = buildNavigationLinks(selectedLocation.coordinates)

                  return (
                    <>
                      <a
                        className="navigation-button google-maps-button"
                        href={links.googleMaps}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <RouteIcon />
                        Google Maps
                      </a>
                      <a
                        className="navigation-button waze-button"
                        href={links.waze}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <RouteIcon />
                        Waze
                      </a>
                    </>
                  )
                })()}
              </nav>
            )}
          </section>

          <section className="map-panel" aria-labelledby="map-title">
            <div className="map-panel-heading">
              <span className="eyebrow">Referência visual</span>
              <h2 id="map-title">Mapa do Ibiti Reserva</h2>
              <p>Consulte a implantação geral e toque na imagem para ampliar.</p>
            </div>
            <a
              className="map-link"
              href={BRAND_ASSETS.map}
              target="_blank"
              rel="noreferrer"
              aria-label="Ampliar mapa ilustrativo do Ibiti Reserva"
            >
              <img src={BRAND_ASSETS.map} alt="Mapa ilustrativo do Parque Ibiti Reserva" />
              <span>Ampliar mapa</span>
            </a>
            <small>Mapa ilustrativo — não utilizar para locação de divisas.</small>
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <span>© 2026 Zelunexa — Todos os direitos reservados.</span>
        <span>Guia Digital Ibiti Reserva</span>
      </footer>
    </div>
  )
}
