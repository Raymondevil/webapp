import React from 'react'

interface HeroProps {
  onOpenCotizador: () => void
  onOpenGaleria: () => void
  onOpenSeleccionar: () => void
  onOpenVideo?: () => void
}

export const Hero: React.FC<HeroProps> = ({
  onOpenCotizador,
  onOpenGaleria,
  onOpenSeleccionar,
  onOpenVideo
}) => {
  const LOCAL_LOGO_URL = '/static/logo.jpg'

  return (
    <section id="inicio" className="relative overflow-hidden pt-12 pb-20 md:py-24">
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 -z-10" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* TEXT CONTENT */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs md:text-sm font-extrabold px-4 py-2 rounded-full backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <i className="fa-solid fa-bullhorn text-amber-400"></i>
              <span>COBERTURA COMPLETA • SAN PEDRO LAGUNILLAS</span>
            </div>

            <h1 className="font-serif font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.1]">
              Guarda los Mejores Recuerdos de las{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                Fiestas Patrias
              </span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Fotografía HD profesional y video completo de desfiles, la Noche del Grito, la gran Topadera y bailes en San Pedro Lagunillas. ¡Cotiza y encarga tus fotos por número de dorsal o evento!
            </p>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <a
                href="#cotizador"
                onClick={onOpenCotizador}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base px-8 py-4 rounded-2xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all flex items-center justify-center gap-3 group transform hover:-translate-y-0.5 cursor-pointer"
              >
                <i className="fa-solid fa-film text-xl"></i>
                <span>Apartar Paquete de Video ($600)</span>
                <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </a>

              <button
                onClick={onOpenSeleccionar}
                className="w-full sm:w-auto bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-base px-6 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-square-check text-lg"></i>
                <span>Elegir Fotos ($50 c/u)</span>
              </button>
            </div>

            {/* FEATURES BULLETS */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <div className="font-black text-amber-400 text-2xl md:text-3xl font-serif">$600</div>
                <div className="text-slate-400 text-xs font-semibold">Paquete Videos Completo</div>
              </div>
              <div>
                <div className="font-black text-amber-400 text-2xl md:text-3xl font-serif">$50</div>
                <div className="text-slate-400 text-xs font-semibold">Foto HD Individual</div>
              </div>
              <div>
                <div className="font-black text-emerald-400 text-2xl md:text-3xl font-serif">
                  <i className="fa-brands fa-whatsapp"></i> Directo
                </div>
                <div className="text-slate-400 text-xs font-semibold">San Pedro Lagunillas</div>
              </div>
            </div>
          </div>

          {/* HERO VISUAL CARD */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl p-1 bg-gradient-to-b from-amber-500/40 via-amber-900/20 to-slate-900 shadow-2xl hero-card-glow overflow-hidden">
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-[23px] p-6 space-y-6">
                <div 
                  onClick={onOpenVideo}
                  className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-amber-500/30 group cursor-pointer"
                >
                  <img
                    src={LOCAL_LOGO_URL}
                    alt="San Pedro Lagunillas Fiestas Patrias"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-center justify-center">
                    <span className="w-12 h-12 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center text-xl shadow-lg transform group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-play ml-0.5" />
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md uppercase">
                      Ver Tráiler HD
                    </span>
                    <span className="text-xs font-semibold text-slate-200 bg-slate-950/80 px-2 py-1 rounded-md backdrop-blur-sm">
                      <i className="fa-solid fa-camera-retro text-amber-400 mr-1"></i> "El Tigre"
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-serif font-black text-lg text-white">
                    ¿Buscas tu foto o video en las Fiestas?
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Usa el selector para encontrar tus fotos por fecha, evento o dorsal (#). Entregas en memoria USB o enlace digital de alta definición.
                  </p>
                  <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Informes físicos en:</span>
                    <span className="text-amber-400 font-bold">Carpintería "El Tigre"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
