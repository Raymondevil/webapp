import React, { useState, useEffect } from 'react'
import type { GalleryItem } from '../types'

interface CarouselProps {
  items: GalleryItem[]
  onOpenLightbox?: (item: GalleryItem) => void
  autoPlay?: boolean
  autoPlayInterval?: number
}

export const Carousel: React.FC<CarouselProps> = ({
  items,
  onOpenLightbox,
  autoPlay = false,
  autoPlayInterval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || items.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, autoPlayInterval)
    
    return () => clearInterval(interval)
  }, [items.length, autoPlay, autoPlayInterval])

  if (items.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center">
        <i className="fa-solid fa-images text-4xl text-slate-600"></i>
        <p className="text-slate-400 mt-2">No hay imágenes para mostrar</p>
      </div>
    )
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden relative">
      {/* MAIN SLIDE CONTAINER */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
        {/* SLIDES */}
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item) => (
            <div 
              key={item.id}
              className="min-w-full h-full flex-shrink-0 relative group cursor-pointer"
              onClick={() => onOpenLightbox?.(item)}
            >
              <img 
                src={item.url} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
              
              {/* OVERLAY INFO */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {item.dorsal && (
                    <span className="inline-block bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md mb-2 shadow-md">
                      #{item.dorsal}
                    </span>
                  )}
                  <h3 className="font-serif font-black text-lg md:text-xl text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-slate-200 text-xs md:text-sm line-clamp-2">
                    {item.description}
                  </p>
                  <span className="text-amber-400 text-xs font-bold mt-2 block">
                    ${item.price} MXN
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* NAVIGATION ARROWS */}
        <button 
          onClick={(e) => { e.stopPropagation(); goToPrev() }}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-950/80 hover:bg-slate-950 text-white p-3 rounded-full z-10 transition-colors backdrop-blur-sm border border-slate-800"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        
        <button 
          onClick={(e) => { e.stopPropagation(); goToNext() }}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-950/80 hover:bg-slate-950 text-white p-3 rounded-full z-10 transition-colors backdrop-blur-sm border border-slate-800"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      {/* INDICATORS */}
      {items.length > 1 && (
        <div className="flex justify-center items-center gap-2 p-4 bg-slate-950/90 border-t border-slate-800">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-6 bg-amber-500 shadow-lg shadow-amber-500/50' 
                  : 'w-2 bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      )}

      {/* CAPTION */}
      <div className="absolute bottom-16 left-0 right-0 text-center p-2 bg-slate-950/80 border-t border-slate-800">
        <span className="text-xs text-slate-300">
          {currentIndex + 1} / {items.length}
        </span>
      </div>
    </div>
  )
}
