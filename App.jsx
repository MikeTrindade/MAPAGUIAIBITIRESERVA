import { useState, useEffect } from 'react'
import { Search, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import './App.css'

// Importando logos
import ibitiDigitalMapLogo from './assets/Designsemnome(2)_1754167584136.png'
import mikeTrindadeLogo from './assets/logo_mike_trindade_horizontal_1754167658801.png'
import ibitiReservaLogo from './assets/logoreserva(1)_1754090512985_1754167680974.JPG'

// Importando dados de localização
import locationsData from './data/locations.json'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Gerar lista de todas as unidades e áreas comuns para autocomplete
  const generateAllLocations = () => {
    const allLocations = []
    
    // Adicionar todas as unidades
    Object.keys(locationsData.unidades).forEach(quadra => {
      const quadraData = locationsData.unidades[quadra]
      for (let i = 1; i <= quadraData.total; i++) {
        const unidade = `${quadra}-${i.toString().padStart(2, '0')}`
        allLocations.push({
          name: unidade,
          type: 'unidade',
          coordinates: quadraData.coordenadas[unidade] || null
        })
      }
    })
    
    // Adicionar áreas comuns
    Object.keys(locationsData.areas_comuns).forEach(area => {
      allLocations.push({
        name: area,
        type: 'area_comum',
        coordinates: locationsData.areas_comuns[area]
      })
    })
    
    return allLocations
  }

  const allLocations = generateAllLocations()

  // Filtrar sugestões baseado no termo de busca
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = allLocations.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10) // Limitar a 10 sugestões
      
      setSuggestions(filtered)
      setShowSuggestions(true)
      setErrorMessage('')
    } else {
      setSuggestions([])
      setShowSuggestions(false)
      setErrorMessage('')
    }
  }, [searchTerm])

  // Função para buscar localização
  const handleSearch = (locationName = searchTerm) => {
    const location = allLocations.find(loc => 
      loc.name.toLowerCase() === locationName.toLowerCase()
    )
    
    if (location && location.coordinates) {
      // Abrir GPS com coordenadas
      const { lat, lng } = location.coordinates
      const geoUrl = `geo:${lat},${lng}`
      window.open(geoUrl, '_blank')
      setErrorMessage('')
      setShowSuggestions(false)
    } else if (location && !location.coordinates) {
      setErrorMessage('Coordenadas não disponíveis para este local')
    } else {
      setErrorMessage('Local não existe')
    }
  }

  // Função para selecionar sugestão
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.name)
    setShowSuggestions(false)
    handleSearch(suggestion.name)
  }

  // Função para lidar com Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-green-50 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <img 
            src={ibitiReservaLogo} 
            alt="Ibiti Reserva" 
            className="h-12 w-auto object-contain"
          />
          <img 
            src={mikeTrindadeLogo} 
            alt="Mike Trindade - Desenvolvedor" 
            className="h-8 w-auto object-contain"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto text-center space-y-8">
          {/* Logo Principal */}
          <div className="space-y-4">
            <img 
              src={ibitiDigitalMapLogo} 
              alt="Ibiti Digital Map" 
              className="h-32 w-auto mx-auto object-contain"
            />
          </div>

          {/* Campo de Busca */}
          <div className="relative space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Digite o nome da unidade ou local (ex: D5-01, Piscinas)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full h-14 text-lg pl-12 pr-4 rounded-xl border-2 border-sky-200 focus:border-sky-400 focus:ring-sky-400"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sky-400 h-5 w-5" />
            </div>

            {/* Sugestões */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="p-3 hover:bg-sky-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center space-x-2"
                  >
                    <MapPin className="h-4 w-4 text-sky-400" />
                    <span className="text-gray-700">{suggestion.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {suggestion.type === 'unidade' ? 'Unidade' : 'Área Comum'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Botão de Busca */}
            <Button
              onClick={() => handleSearch()}
              className="w-full h-14 text-lg bg-sky-400 hover:bg-sky-500 text-white rounded-xl font-semibold"
            >
              <Search className="mr-2 h-5 w-5" />
              Encontrar Localização
            </Button>

            {/* Mensagem de Erro */}
            {errorMessage && (
              <div className="text-red-500 text-center p-2 bg-red-50 rounded-lg">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-600">
          <p>© Todos os direitos reservados | Desenvolvido por Mike Trindade</p>
        </div>
      </footer>
    </div>
  )
}

export default App

