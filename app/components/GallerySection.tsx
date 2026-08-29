import React, { useState, useMemo } from 'react'
import type { GalleryItem } from '../types'
import { Carousel } from './Carousel'

interface GallerySectionProps {
  galleryItems: GalleryItem[]
  onOpenLightbox: (item: GalleryItem) => void
  onAddPhotoToOrder: (item: GalleryItem) => void
  onOpenSeleccionar: () => void
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  galleryItems,
  onOpenLightbox,
  onAddPhotoToOrder,
  onOpenSeleccionar
}) => {
  const [currentFilter, setCurrentFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [dorsalFilter, setDorsalFilter] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid')

  const categories = [
    { key: 'all', label: 'Todos' },
    { key: 'topaderas', label: 'Topaderas y Jaripeos' },
    { key: 'cabalgatas', label: 'Cabalgatas' },
    { key: 'grito', label: 'Noche del Grito' },
    { key: 'desfiles', label: 'Desfiles' },
    { key: 'bailes', label: 'Bailes' },
    { key: 'videos', label: 'Videos' }
  ]

  // Filtered items based on search/dorsal/category
  const filteredItems = useMemo(() => {
    return galleryItems.filter((item) => {
      // Category match
      if (currentFilter !== 'all' && item.category !== currentFilter) {
        return false
      }
      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const titleMatch = item.title.toLowerCase().includes(q)
        const descMatch = item.description.toLowerCase().includes(q)
        const dorsalMatch = item.dorsal?.toLowerCase().includes(q)
        if (!titleMatch && !descMatch && !dorsalMatch) return false
      }
      // Dorsal specific filter
      if (dorsalFilter.trim()) {
        const d = dorsalFilter.trim().replace('#', '').toLowerCase()
        if (!item.dorsal?.toLowerCase().includes(d)) return false
      }
      return true
    })
  }, [galleryItems, currentFilter, searchQuery, dorsalFilter])

  // Featured items for the top highlight carousel (Option 1)
  const featuredItems = useMemo(() => {
    return galleryItems.slice(0, 10)
  }, [galleryItems])

  return (
    <section id="galeria" className="py-16 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* SECTION HEADER */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-black px-4 py-1.5 rounded-full uppercase">
            <i className="fa-solid fa-camera-retro mr-1"></i> Muestra de Cobertura
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-white">
            Galería de Fotos y Videos
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm">
            Filtra por evento o ingresa el número de dorsal (#) para localizar tus capturas. Haz clic en la foto para amplificar.
          </p>
        </div>

        {/* OPCIÓN 1: CARRUSEL DE MOMENTOS DESTACADOS */}
        {featuredItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <h3 className="font-serif font-black text-xl sm:text-2xl text-white">
                  Momentos Destacados
                </h3>
              </div>
              <span className="text-slate-400 text-xs font-semibold hidden sm:inline">
                <i className="fa-solid fa-wand-magic-sparkles text-amber-400 mr-1"></i>
                Diapositivas automáticas
              </span>
            </div>

            <Carousel
              items={featuredItems}
              onOpenLightbox={onOpenLightbox}
              onAddPhotoToOrder={onAddPhotoToOrder}
              autoPlay={true}
              autoPlayInterval={5000}
              title="Lo Mejor de las Fiestas Patrias"
              subtitle="Cobertura fotográfica y en video en San Pedro Lagunillas"
            />
          </div>
        )}

        {/* SEARCH AND FILTERS BAR */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* SEARCH INPUTS */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-grow max-w-2xl">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por título o descripción..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-500 text-xs"></i>
              </div>
              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  value={dorsalFilter}
                  onChange={(e) => setDorsalFilter(e.target.value)}
                  placeholder="Dorsal (#12, #45)..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 pl-9 text-xs text-amber-400 font-bold placeholder-slate-500 focus:outline-none"
                />
                <i className="fa-solid fa-shirt absolute left-3 top-3 text-amber-500 text-xs"></i>
              </div>
            </div>

            {/* ACTION BUTTONS & VIEW TOGGLE */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between sm:justify-end">
              {/* OPCIÓN 3: TOGGLE DE VISTA CUADRÍCULA / CARRUSEL */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Vista en Cuadrícula"
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-table-cells"></i>
                  <span className="hidden sm:inline">Cuadrícula</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('carousel')}
                  title="Vista en Carrusel"
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'carousel'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-sliders"></i>
                  <span className="hidden sm:inline">Carrusel</span>
                </button>
              </div>

              {/* SELECCIONAR MULTIPLE BUTTON */}
              <button
                onClick={onOpenSeleccionar}
                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-square-check"></i>
                <span className="hidden sm:inline">Selección por Casillas ($50 c/u)</span>
                <span className="sm:hidden">Casillas</span>
              </button>
            </div>
          </div>

          {/* CATEGORIES TABS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCurrentFilter(cat.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  currentFilter === cat.key
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* RESULTS COUNT & FILTER INFO */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Mostrando <strong className="text-amber-400">{filteredItems.length}</strong> {filteredItems.length === 1 ? 'fotografía' : 'fotografías'}
            {currentFilter !== 'all' && ` en "${categories.find((c) => c.key === currentFilter)?.label}"`}
            {dorsalFilter && ` con dorsal "${dorsalFilter}"`}
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            {viewMode === 'carousel' ? 'Modo de visualización: Carrusel / Diapositivas' : 'Modo de visualización: Cuadrícula'}
          </span>
        </div>

        {/* GALLERY CONTENT: GRID OR CAROUSEL BASED ON VIEW MODE (OPTION 3) */}
        {filteredItems.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <i className="fa-solid fa-images text-4xl text-slate-600"></i>
            <h3 className="font-serif font-bold text-lg text-slate-300">
              No se encontraron fotografías con esos criterios
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Intenta cambiar el filtro o escríbenos directamente por WhatsApp para buscar tu foto en la base de datos completa.
            </p>
          </div>
        ) : viewMode === 'carousel' ? (
          /* VISTA CARRUSEL (OPTION 3) */
          <div className="space-y-4">
            <Carousel
              items={filteredItems}
              onOpenLightbox={onOpenLightbox}
              onAddPhotoToOrder={onAddPhotoToOrder}
              autoPlay={false}
              title={currentFilter !== 'all' ? `Fotos: ${categories.find(c => c.key === currentFilter)?.label}` : 'Explorador en Carrusel'}
              subtitle={`${filteredItems.length} fotografías encontradas`}
            />
          </div>
        ) : (
          /* VISTA CUADRÍCULA */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between group"
              >
                <div>
                  {/* IMAGE THUMBNAIL */}
                  <div
                    onClick={() => onOpenLightbox(item)}
                    className="relative aspect-[4/3] bg-slate-950 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl shadow-lg">
                        <i className="fa-solid fa-expand mr-1"></i> Ampliar
                      </span>
                    </div>

                    {item.dorsal && (
                      <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md shadow-md">
                        #{item.dorsal}
                      </span>
                    )}

                    <span className="absolute bottom-3 right-3 bg-slate-950/90 text-amber-400 text-[10px] font-bold px-2 py-1 rounded border border-slate-800">
                      {item.date}
                    </span>
                  </div>

                  {/* ITEM CONTENT */}
                  <div className="p-5 space-y-3">
                    <h3
                      onClick={() => onOpenLightbox(item)}
                      className="font-serif font-black text-base text-white group-hover:text-amber-300 transition-colors cursor-pointer line-clamp-2"
                    >
                      {item.title}
                    </h3>
                    <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* BOTTOM CARD ACTION */}
                <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-800/80 mt-2">
                  <div>
                    <span className="text-xs text-slate-400 block">Precio:</span>
                    <span className="font-serif font-black text-lg text-amber-400">${item.price} MXN</span>
                  </div>
                  <button
                    onClick={() => onAddPhotoToOrder(item)}
                    className="bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-plus"></i> Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
