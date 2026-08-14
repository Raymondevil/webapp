import React, { useState } from 'react'
import type { GalleryItem } from '../types'

interface CheckboxSelectionPageProps {
  galleryItems: GalleryItem[]
  selectedPhotoMap: Map<string, 'digital' | 'fisica' | 'marco'>
  setSelectedPhotoMap: React.Dispatch<React.SetStateAction<Map<string, 'digital' | 'fisica' | 'marco'>>>
  videoPass: boolean
  setVideoPass: React.Dispatch<React.SetStateAction<boolean>>
  onGoToOrder: () => void
}

export const CheckboxSelectionPage: React.FC<CheckboxSelectionPageProps> = ({
  galleryItems,
  selectedPhotoMap,
  setSelectedPhotoMap,
  videoPass,
  setVideoPass,
  onGoToOrder
}) => {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const togglePhotoSelection = (id: string, format: 'digital' | 'fisica' | 'marco' = 'digital') => {
    const nextMap = new Map(selectedPhotoMap)
    if (nextMap.has(id)) {
      nextMap.delete(id)
    } else {
      nextMap.set(id, format)
    }
    setSelectedPhotoMap(nextMap)
  }

  const setPhotoFormat = (id: string, format: 'digital' | 'fisica' | 'marco') => {
    const nextMap = new Map(selectedPhotoMap)
    nextMap.set(id, format)
    setSelectedPhotoMap(nextMap)
  }

  // Price calculations
  let photoTotal = 0
  selectedPhotoMap.forEach((fmt) => {
    if (fmt === 'marco') photoTotal += 100
    else photoTotal += 50
  })

  const videoTotal = videoPass ? 600 : 0
  const grandTotal = photoTotal + videoTotal

  const filteredItems = galleryItems.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const titleMatch = item.title.toLowerCase().includes(q)
      const dorsalMatch = item.dorsal?.toLowerCase().includes(q)
      if (!titleMatch && !dorsalMatch) return false
    }
    return true
  })

  // WhatsApp url generator
  const generateWhatsAppUrl = () => {
    const selectedIds = Array.from(selectedPhotoMap.keys())
    let text = `*SELECCIÓN DE FOTOS CON CHECKBOX - EL TIGRE*\n\n`
    if (videoPass) {
      text += `• Paquete de Videos Completo: $600 MXN\n`
    }
    text += `• Fotos Seleccionadas (${selectedIds.length}):\n`
    selectedIds.forEach((id) => {
      const item = galleryItems.find((g) => g.id === id)
      const fmt = selectedPhotoMap.get(id) || 'digital'
      if (item) {
        text += `   - ${item.title} (Dorsal: ${item.dorsal || 'N/A'}, Formato: ${fmt})\n`
      }
    })
    text += `\n*TOTAL:* $${grandTotal} MXN`
    return `https://wa.me/523118470860?text=${encodeURIComponent(text)}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-36">
      {/* BANNER HEADER */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-4 text-center">
        <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-black px-3 py-1 rounded-full uppercase">
          <i className="fa-solid fa-square-check mr-1"></i> Selección Masiva por Casillas
        </span>
        <h1 className="font-serif font-black text-3xl sm:text-5xl text-white">
          Elige tus Fotos con Checkbox
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto">
          Marca la casilla de cada foto que desees incluir en tu pedido ($50 MXN c/u). Verás la cotización en tiempo real en la barra inferior.
        </p>

        {/* SEARCH AND FILTER BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="w-full sm:w-80 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por dorsal (#12, #45) o título..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-500 text-xs"></i>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['all', 'topaderas', 'cabalgatas', 'grito', 'desfiles', 'bailes'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {cat === 'all' ? 'Todas' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VIDEO PASS OPTION */}
      <div
        onClick={() => setVideoPass(!videoPass)}
        className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
          videoPass
            ? 'bg-amber-500/15 border-amber-400 shadow-lg'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={videoPass}
            onChange={() => {}}
            className="w-5 h-5 rounded accent-amber-500"
          />
          <div>
            <span className="font-serif font-black text-base text-white block">
              Agregar Paquete Completo de Videos de Todos los Días
            </span>
            <span className="text-xs text-slate-400">
              Desfiles, Grito, Jaripeos y Topaderas filmadas en HD.
            </span>
          </div>
        </div>
        <span className="font-serif font-black text-xl text-amber-400">$600 MXN</span>
      </div>

      {/* PHOTO CHECKBOX GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const isSelected = selectedPhotoMap.has(item.id)
          const currentFmt = selectedPhotoMap.get(item.id) || 'digital'

          return (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-xl'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" />

                  {/* CHECKBOX OVERLAY */}
                  <button
                    onClick={() => togglePhotoSelection(item.id)}
                    className="absolute top-3 left-3 bg-slate-950/80 hover:bg-amber-500 rounded-xl p-2 border border-slate-700 flex items-center gap-2 text-white shadow-lg transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded accent-amber-500 pointer-events-none"
                    />
                    <span className="text-xs font-bold">
                      {isSelected ? 'Seleccionada' : 'Elegir'}
                    </span>
                  </button>

                  {item.dorsal && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md">
                      #{item.dorsal}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-serif font-bold text-sm text-white line-clamp-1">{item.title}</h3>
                  <p className="text-slate-400 text-xs line-clamp-2">{item.description}</p>
                </div>
              </div>

              {/* FORMAT OPTIONS WHEN SELECTED */}
              {isSelected && (
                <div className="p-4 pt-0 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Formato deseado:
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setPhotoFormat(item.id, 'digital')}
                      className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                        currentFmt === 'digital'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      Digital ($50)
                    </button>
                    <button
                      onClick={() => setPhotoFormat(item.id, 'fisica')}
                      className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                        currentFmt === 'fisica'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      Impresa ($50)
                    </button>
                    <button
                      onClick={() => setPhotoFormat(item.id, 'marco')}
                      className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                        currentFmt === 'marco'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      Marco ($100)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* FLOATING CHECKOUT BAR AT BOTTOM */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-amber-500/40 p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl text-amber-400">
              <i className="fa-solid fa-cart-shopping text-2xl"></i>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">
                {selectedPhotoMap.size} fotos elegidas {videoPass ? '+ Paquete Video ($600)' : ''}
              </span>
              <span className="font-serif font-black text-2xl text-amber-400">${grandTotal} MXN</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onGoToOrder}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-3.5 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-calculator"></i> Ajustar en Cotizador
            </button>
            <a
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-brands fa-whatsapp text-lg"></i> Enviar Selección por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
