import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { GalleryItem } from '../types'

interface CarouselProps {
  items: GalleryItem[]
  onOpenLightbox?: (item: GalleryItem) => void
  onAddPhotoToOrder?: (item: GalleryItem) => void
  autoPlay?: boolean
  autoPlayInterval?: number
  title?: string
  subtitle?: string
}

export const Carousel: React.FC<CarouselProps> = ({
  items,
  onOpenLightbox,
  onAddPhotoToOrder,
  autoPlay = false,
  autoPlayInterval = 5000,
  title,
  subtitle
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const touchStartXRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Ensure currentIndex is always in bounds when items changes
  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0)
    }
  }, [items.length, currentIndex])

  const goToPrev = useCallback(() => {
    if (items.length === 0) return
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1))
  }, [items.length])

  const goToNext = useCallback(() => {
    if (items.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }, [items.length])

  const goToSlide = (index: number) => {
    if (index >= 0 && index < items.length) {
      setCurrentIndex(index)
    }
  }

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isHovered || items.length <= 1) return

    const interval = setInterval(() => {
      goToNext()
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, isHovered, items.length, goToNext])

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartXRef.current - touchEndX
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        goToNext()
      } else {
        goToPrev()
      }
    }
    touchStartXRef.current = null
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goToPrev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      goToNext()
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
        <i className="fa-solid fa-images text-4xl text-slate-600"></i>
        <h3 className="font-serif font-bold text-lg text-slate-300">No hay fotos para mostrar en el carrusel</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Prueba cambiando el filtro o término de búsqueda.
        </p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden relative shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 group/carousel"
    >
      {/* HEADER (OPTIONAL) */}
      {(title || subtitle) && (
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="font-serif font-black text-lg md:text-xl text-white flex items-center gap-2">
                <i className="fa-solid fa-sparkles text-amber-400 text-sm"></i>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-full">
            {currentIndex + 1} / {items.length}
          </div>
        </div>
      )}

      {/* MAIN SLIDE STAGE */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-slate-950 select-none">
        {/* SLIDES CONTAINER WITH SMOOTH TRANSFORM */}
        <div
          className="flex transition-transform duration-500 ease-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item, index) => {
            // Lazy load check: only render full image if near currentIndex
            const isNearCurrent = Math.abs(index - currentIndex) <= 2 || index === 0 || index === items.length - 1

            return (
              <div
                key={item.id}
                className="min-w-full h-full flex-shrink-0 relative group cursor-pointer"
                onClick={() => onOpenLightbox?.(item)}
              >
                {isNearCurrent ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    loading={index === currentIndex ? 'eager' : 'lazy'}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-950 flex items-center justify-center">
                    <i className="fa-solid fa-spinner fa-spin text-slate-600 text-2xl"></i>
                  </div>
                )}

                {/* OVERLAY GRADIENT */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 md:p-8">
                  <div className="max-w-3xl space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {item.dorsal && (
                        <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                          <i className="fa-solid fa-user-tag text-[10px]"></i> #{item.dorsal}
                        </span>
                      )}
                      <span className="bg-slate-950/80 backdrop-blur-md text-amber-400 border border-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-md">
                        {item.date}
                      </span>
                      <span className="bg-slate-900/80 text-slate-300 text-[11px] font-semibold px-2.5 py-1 rounded-md uppercase">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="font-serif font-black text-xl sm:text-2xl md:text-3xl text-white leading-tight drop-shadow-md">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-slate-200 text-xs sm:text-sm line-clamp-2 leading-relaxed max-w-2xl drop-shadow">
                        {item.description}
                      </p>
                    )}

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <span className="font-serif font-black text-lg sm:text-xl text-amber-400">
                        ${item.price} MXN
                      </span>

                      {onAddPhotoToOrder && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onAddPhotoToOrder(item)
                          }}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer transform hover:scale-105"
                        >
                          <i className="fa-solid fa-plus-circle"></i>
                          <span>Agregar al Pedido</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenLightbox?.(item)
                        }}
                        className="bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-bold px-3.5 py-2 rounded-xl backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-expand"></i>
                        <span>Ampliar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* NAVIGATION ARROWS */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={(e) => {
                e.stopPropagation()
                goToPrev()
              }}
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-950/80 hover:bg-amber-500 text-white hover:text-slate-950 flex items-center justify-center text-base sm:text-lg z-20 transition-all duration-300 backdrop-blur-md border border-slate-700/80 hover:border-amber-400 shadow-xl cursor-pointer hover:scale-110"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            <button
              type="button"
              aria-label="Siguiente foto"
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-950/80 hover:bg-amber-500 text-white hover:text-slate-950 flex items-center justify-center text-base sm:text-lg z-20 transition-all duration-300 backdrop-blur-md border border-slate-700/80 hover:border-amber-400 shadow-xl cursor-pointer hover:scale-110"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </>
        )}
      </div>

      {/* FOOTER BAR WITH CONTROLS AND INDICATORS */}
      {items.length > 1 && (
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950 border-t border-slate-800 text-xs">
          {/* PREV QUICK BUTTON */}
          <button
            type="button"
            onClick={goToPrev}
            className="text-slate-400 hover:text-amber-400 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left text-[11px]"></i>
            <span className="hidden sm:inline">Anterior</span>
          </button>

          {/* INDICATORS: PILLS IF <= 12, ELSE PROGRESS COUNTER */}
          {items.length <= 12 ? (
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-md py-1">
              {items.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Ir a foto ${index + 1}`}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentIndex
                      ? 'w-7 bg-amber-500 shadow-lg shadow-amber-500/50'
                      : 'w-2 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-medium text-xs">
                Foto <strong className="text-amber-400">{currentIndex + 1}</strong> de {items.length}
              </span>
              <div className="w-24 sm:w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* NEXT QUICK BUTTON */}
          <button
            type="button"
            onClick={goToNext}
            className="text-slate-400 hover:text-amber-400 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <i className="fa-solid fa-arrow-right text-[11px]"></i>
          </button>
        </div>
      )}
    </div>
  )
}
