import React, { useState } from 'react'

interface HeaderProps {
  activeTab: 'main' | 'seleccionar' | 'admin'
  setActiveTab: (tab: 'main' | 'seleccionar' | 'admin') => void
  selectedPhotoCount: number
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedPhotoCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const LOCAL_LOGO_URL = '/static/logo.jpg'

  return (
    <>
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 font-bold text-xs md:text-sm py-2 px-4 text-center shadow-lg relative z-50 flex items-center justify-center gap-2 flex-wrap">
        <span>
          <img
            src={LOCAL_LOGO_URL}
            alt="El Tigre Logo"
            className="w-6 h-6 inline-block rounded-full border border-slate-950 mr-1 object-cover"
          />
          <strong>FOTOGRAFÍAS "EL TIGRE"</strong> — Cobertura Oficial Fiestas Patrias San Pedro Lagunillas 2026
        </span>
        <span className="bg-slate-950 text-amber-400 px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider font-extrabold ml-2">
          Del 10 Sep a la Última Topadera
        </span>
        <a
          href="#cotizador"
          onClick={() => setActiveTab('main')}
          className="underline hover:text-slate-900 transition-colors font-extrabold ml-2"
        >
          <i className="fa-solid fa-ticket mr-1"></i>¡Apártalo Ya!
        </a>
      </div>

      {/* MAIN NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-amber-900/40 transition-all shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* BRAND LOGO */}
          <button
            onClick={() => setActiveTab('main')}
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full p-0.5 bg-gradient-to-br from-amber-400 via-amber-500 to-red-600 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src={LOCAL_LOGO_URL}
                alt="Fotografías El Tigre"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <span className="font-serif font-black text-lg md:text-2xl text-amber-400 tracking-wide block leading-tight group-hover:text-amber-300 transition-colors">
                FOTOGRAFÍAS EL TIGRE
              </span>
              <span className="text-[10px] md:text-xs text-amber-200/80 font-medium tracking-wider uppercase block">
                San Pedro Lagunillas • Nayarit
              </span>
            </div>
          </button>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-5 font-medium text-sm text-slate-300">
            <button
              onClick={() => setActiveTab('main')}
              className={`hover:text-amber-400 transition-colors py-1 cursor-pointer ${activeTab === 'main' ? 'text-amber-400 font-bold' : ''}`}
            >
              Inicio
            </button>
            <a href="#programa" onClick={() => setActiveTab('main')} className="hover:text-amber-400 transition-colors py-1">
              Programa
            </a>
            <a href="#precios" onClick={() => setActiveTab('main')} className="hover:text-amber-400 transition-colors py-1">
              Precios
            </a>
            <a href="#galeria" onClick={() => setActiveTab('main')} className="hover:text-amber-400 transition-colors py-1">
              Galería
            </a>
            <a href="#cotizador" onClick={() => setActiveTab('main')} className="hover:text-amber-400 transition-colors py-1">
              Hacer Pedido
            </a>
            <button
              onClick={() => setActiveTab('seleccionar')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'seleccionar'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <i className="fa-solid fa-square-check"></i>
              Selección por Casillas
              {selectedPhotoCount > 0 && (
                <span className="bg-amber-400 text-slate-950 font-black rounded-full px-1.5 text-[10px]">
                  {selectedPhotoCount}
                </span>
              )}
            </button>
            <a href="#contacto" onClick={() => setActiveTab('main')} className="hover:text-amber-400 transition-colors py-1">
              Contacto
            </a>
            <button
              onClick={() => setActiveTab('admin')}
              className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <i className="fa-solid fa-lock text-[10px]"></i> Admin
            </button>
          </nav>

          {/* DESKTOP CTA BUTTONS */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="https://wa.me/523118470860"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 transition-all flex items-center gap-2"
            >
              <i className="fa-brands fa-whatsapp text-sm"></i> 311 847 0860
            </a>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-amber-400 hover:text-amber-300 p-2 rounded-lg bg-slate-900 border border-slate-800 focus:outline-none cursor-pointer"
            aria-label="Menu"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {/* MOBILE NAVIGATION MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-b border-amber-900/40 px-4 pt-2 pb-6 space-y-3">
            <button
              onClick={() => { setActiveTab('main'); setMobileMenuOpen(false) }}
              className="block w-full text-left py-2 font-medium text-slate-300 hover:text-amber-400 cursor-pointer"
            >
              <i className="fa-solid fa-house mr-2"></i> Inicio
            </button>
            <a
              href="#programa"
              onClick={() => { setActiveTab('main'); setMobileMenuOpen(false) }}
              className="block py-2 font-medium text-slate-300 hover:text-amber-400"
            >
              <i className="fa-solid fa-calendar mr-2"></i> Programa de Eventos
            </a>
            <a
              href="#precios"
              onClick={() => { setActiveTab('main'); setMobileMenuOpen(false) }}
              className="block py-2 font-medium text-slate-300 hover:text-amber-400"
            >
              <i className="fa-solid fa-tag mr-2"></i> Precios
            </a>
            <a
              href="#galeria"
              onClick={() => { setActiveTab('main'); setMobileMenuOpen(false) }}
              className="block py-2 font-medium text-slate-300 hover:text-amber-400"
            >
              <i className="fa-solid fa-images mr-2"></i> Galería Muestra
            </a>
            <button
              onClick={() => { setActiveTab('seleccionar'); setMobileMenuOpen(false) }}
              className="block w-full text-left py-2 font-bold text-amber-300 hover:text-amber-400 cursor-pointer"
            >
              <i className="fa-solid fa-square-check mr-2"></i> Selección por Casillas ($50 c/u)
              {selectedPhotoCount > 0 && ` (${selectedPhotoCount})`}
            </button>
            <a
              href="#cotizador"
              onClick={() => { setActiveTab('main'); setMobileMenuOpen(false) }}
              className="block py-2 font-medium text-slate-300 hover:text-amber-400"
            >
              <i className="fa-solid fa-calculator mr-2"></i> Hacer Pedido
            </a>
            <a
              href="#contacto"
              onClick={() => { setActiveTab('main'); setMobileMenuOpen(false) }}
              className="block py-2 font-medium text-slate-300 hover:text-amber-400"
            >
              <i className="fa-solid fa-envelope mr-2"></i> Contacto y Ubicación
            </a>
            <button
              onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false) }}
              className="block w-full text-left py-2 text-xs text-slate-400 hover:text-amber-400 cursor-pointer"
            >
              <i className="fa-solid fa-lock mr-2"></i> Panel de Administrador
            </button>
            <div className="pt-2">
              <a
                href="https://wa.me/523118470860"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 text-white font-bold text-center py-3 rounded-xl flex items-center justify-center gap-2 w-full"
              >
                <i className="fa-brands fa-whatsapp text-lg"></i> Contactar por WhatsApp
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
