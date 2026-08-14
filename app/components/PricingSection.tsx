import React from 'react'

interface PricingSectionProps {
  onOpenCotizador: () => void
  onOpenSeleccionar: () => void
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onOpenCotizador,
  onOpenSeleccionar
}) => {
  return (
    <section id="precios" className="py-16 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
            <i className="fa-solid fa-tags mr-1"></i> Precios Transparentes y Oficiales
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-white">
            Elige tu Paquete de Contenido
          </h2>
          <p className="text-slate-300 text-sm">
            Sin precios ocultos. Cobertura profesional completa de todas las festividades del 10 de septiembre hasta la última topadera.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* CARD 1: PAQUETE COMPLETO DE VIDEOS */}
          <div className="bg-gradient-to-b from-amber-950/60 to-slate-900 border-2 border-amber-500/60 rounded-3xl p-8 relative flex flex-col justify-between shadow-2xl shadow-amber-500/10 hover:border-amber-400 transition-all">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-xs px-4 py-1 rounded-full uppercase tracking-widest shadow-md">
              ★ MÁS POPULAR Y COMPLETO ★
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-amber-900/40 pb-6">
                <div>
                  <h3 className="font-serif font-black text-2xl text-white">Pase Total de Videos</h3>
                  <p className="text-amber-300/80 text-xs font-medium">Todos los días y eventos incluidos</p>
                </div>
                <div className="text-right">
                  <span className="font-serif font-black text-4xl text-amber-400">$600</span>
                  <span className="text-slate-400 text-xs block">MXN</span>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-200">
                <li className="flex items-start gap-3">
                  <i className="fa-solid fa-circle-check text-amber-400 text-sm mt-0.5"></i>
                  <span><strong>Video Full HD de TODOS los días</strong> (10 de Septiembre a Última Topadera).</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fa-solid fa-circle-check text-amber-400 text-sm mt-0.5"></i>
                  <span>Desfiles, Entrada de la Música, Desfile de Antorchas y Noche del Grito.</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fa-solid fa-circle-check text-amber-400 text-sm mt-0.5"></i>
                  <span>Cabalgatas, Jaripeos y <strong>Todas las Topaderas</strong> filmadas en directo.</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fa-solid fa-circle-check text-amber-400 text-sm mt-0.5"></i>
                  <span>Entrega en <strong>Memoria USB</strong> o Enlace Privado de Descarga Digital HD.</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <a
                href="#cotizador"
                onClick={onOpenCotizador}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-center py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-film"></i> Apartar Paquete de Video ($600)
              </a>
            </div>
          </div>

          {/* CARD 2: FOTOS INDIVIDUALES */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                <div>
                  <h3 className="font-serif font-black text-2xl text-white">Fotos Individuales</h3>
                  <p className="text-slate-400 text-xs font-medium">Búsqueda personalizada por dorsal</p>
                </div>
                <div className="text-right">
                  <span className="font-serif font-black text-4xl text-amber-400">$50</span>
                  <span className="text-slate-400 text-xs block">c/u MXN</span>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-start gap-3">
                  <i className="fa-solid fa-camera text-emerald-400 text-sm mt-0.5"></i>
                  <span>Fotografía individual retocada en alta resolución HD.</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fa-solid fa-magnifying-glass text-emerald-400 text-sm mt-0.5"></i>
                  <span>Búsqueda por número de dorsal (#) o nombre de participante/charro.</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fa-solid fa-print text-emerald-400 text-sm mt-0.5"></i>
                  <span>Disponible en formato digital o impresión fotográfica.</span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="fa-solid fa-cubes text-emerald-400 text-sm mt-0.5"></i>
                  <span>Descuento especial al ordenar paquetes grandes de fotos.</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={onOpenSeleccionar}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-center py-4 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-square-check"></i> Seleccionar Fotos ($50 c/u)
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
