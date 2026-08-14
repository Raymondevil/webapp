import React from 'react'

export const Footer: React.FC = () => {
  const LOCAL_LOGO_URL = '/static/logo.jpg'

  return (
    <footer className="bg-slate-950 border-t border-amber-900/40 text-slate-400 py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src={LOCAL_LOGO_URL}
              alt="Logo El Tigre"
              className="w-10 h-10 rounded-full border border-amber-400 object-cover"
            />
            <div>
              <span className="font-serif font-black text-lg text-amber-400 block">
                FOTOGRAFÍAS EL TIGRE
              </span>
              <span className="text-[10px] text-slate-500 block">
                San Pedro Lagunillas, Nayarit • Fiestas Patrias 2026
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <a href="#inicio" className="hover:text-amber-400 transition-colors">
              Inicio
            </a>
            <a href="#programa" className="hover:text-amber-400 transition-colors">
              Programa
            </a>
            <a href="#precios" className="hover:text-amber-400 transition-colors">
              Precios
            </a>
            <a href="#galeria" className="hover:text-amber-400 transition-colors">
              Galería
            </a>
            <a href="#cotizador" className="hover:text-amber-400 transition-colors">
              Cotizador
            </a>
          </div>

          <a
            href="https://wa.me/523118470860"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-400 hover:underline font-bold flex items-center gap-1.5"
          >
            <i className="fa-brands fa-whatsapp text-sm"></i> 311 847 0860
          </a>
        </div>

        <div className="pt-6 border-t border-slate-900 text-center text-[11px] text-slate-500">
          <p>
            © 2026 Fotografías y Videos "El Tigre". Todos los derechos reservados. Desarrollado para las Fiestas Patrias de San Pedro Lagunillas, Nayarit.
          </p>
        </div>
      </div>
    </footer>
  )
}
