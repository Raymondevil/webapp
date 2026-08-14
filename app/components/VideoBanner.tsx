import React, { useRef, useState } from 'react'

interface VideoBannerProps {
  onSelectVideoPass?: () => void
  onOpenCotizador?: () => void
}

export const VideoBanner: React.FC<VideoBannerProps> = ({
  onSelectVideoPass,
  onOpenCotizador
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch((e) => {
        console.error('Video play failed:', e)
        setHasError(true)
      })
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  const toggleFullScreen = () => {
    if (!videoRef.current) return
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen()
    }
  }

  return (
    <section id="video-trailer" className="py-16 md:py-24 bg-gradient-to-b from-slate-950 via-amber-950/30 to-slate-950 relative overflow-hidden">
      {/* GLOW BACKGROUND EFFECT */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-amber-500/15 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* HEADER */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
            <i className="fa-solid fa-clapperboard text-amber-400"></i>
            <span>Tráiler Oficial • Fiestas Patrias 2026</span>
          </div>
          <h2 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
            Revive la Emoción en{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
              Video Full HD
            </span>
          </h2>
          <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
            Disfruta aquí de una muestra de las mejores tomas de la gran Topadera, jaripeos, desfiles y la Noche del Grito en San Pedro Lagunillas.
          </p>
        </div>

        {/* MAIN VIDEO BANNER CONTAINER */}
        <div className="relative mx-auto max-w-5xl rounded-3xl p-1 bg-gradient-to-b from-amber-500/50 via-amber-700/20 to-slate-900 shadow-2xl shadow-amber-950/60 overflow-hidden">
          <div className="bg-slate-950/95 backdrop-blur-2xl rounded-[23px] overflow-hidden p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* VIDEO PLAYER COLUMN */}
              <div className="lg:col-span-8 relative group rounded-2xl overflow-hidden bg-slate-900 border border-amber-500/20 shadow-2xl aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  src="/static/video/vueno.mp4"
                  poster="/static/logo.jpg"
                  preload="metadata"
                  playsInline
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={() => setHasError(true)}
                  className="w-full h-full object-contain rounded-2xl bg-black"
                >
                  <source src="/static/video/vueno.mp4" type="video/mp4" />
                  Tu navegador no soporta reproducción de video HTML5.
                </video>

                {/* PLAY OVERLAY (shown when paused) */}
                {!isPlaying && (
                  <div
                    onClick={togglePlay}
                    className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-950/30 group/btn"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center text-3xl sm:text-4xl pl-1 shadow-2xl shadow-amber-500/50 group-hover/btn:scale-110 group-hover/btn:bg-amber-400 transition-all">
                      <i className="fa-solid fa-play"></i>
                    </div>
                    <span className="mt-4 bg-slate-900/90 text-amber-300 font-black text-xs sm:text-sm px-4 py-1.5 rounded-full border border-amber-500/30 shadow-lg tracking-wide uppercase">
                      Reproducir Muestra de Video
                    </span>
                  </div>
                )}

                {/* BADGES ON VIDEO */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                  <span className="bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                    <i className="fa-solid fa-video text-amber-400"></i> Full HD 1080p
                  </span>
                  <span className="bg-emerald-500/90 text-slate-950 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                    <i className="fa-solid fa-volume-high"></i> Sonido en Vivo
                  </span>
                </div>

                {hasError && (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
                    <i className="fa-solid fa-circle-exclamation text-3xl text-amber-400 mb-2"></i>
                    <p className="text-white text-sm font-bold">No se pudo cargar el archivo de video.</p>
                    <p className="text-slate-400 text-xs mt-1">Verifica que el archivo esté en /static/video/vueno.mp4</p>
                  </div>
                )}
              </div>

              {/* DETAILS & ACTIONS COLUMN */}
              <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-lg border border-amber-500/20">
                    <i className="fa-solid fa-crown text-amber-400"></i> Paquete de Video Oficial
                  </div>

                  <h3 className="font-serif font-black text-2xl sm:text-3xl text-white">
                    Todo el Evento en Tus Manos
                  </h3>

                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Grabación con cámaras de alta definición y drones. Incluye todas las jornadas: desde la Entrada de la Música hasta la Gran Topadera Final.
                  </p>

                  {/* PRICE CARD */}
                  <div className="p-4 bg-slate-900/90 rounded-2xl border border-amber-500/30 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-slate-400">Paquete Completo:</span>
                      <span className="font-serif font-black text-3xl text-amber-400">$600 <span className="text-xs font-sans text-slate-400 font-normal">MXN</span></span>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                      <i className="fa-solid fa-check"></i> Incluye todas las fechas y eventos
                    </div>
                  </div>

                  {/* HIGHLIGHT POINTS */}
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-amber-400"></i>
                      <span>Entrega en memoria USB o enlace digital de descarga</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-amber-400"></i>
                      <span>Edición cinematográfica con sonido ambiente</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-amber-400"></i>
                      <span>Ideal para familias, jinetes y paisanos en USA</span>
                    </li>
                  </ul>
                </div>

                {/* ACTION BUTTONS */}
                <div className="space-y-3 pt-2">
                  <a
                    href="#cotizador"
                    onClick={() => {
                      if (onSelectVideoPass) onSelectVideoPass()
                      if (onOpenCotizador) onOpenCotizador()
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm py-3.5 px-6 rounded-xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <i className="fa-solid fa-film text-base"></i>
                    <span>Apartar Paquete de Video ($600)</span>
                    <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  </a>

                  <a
                    href="https://wa.me/523118470860?text=Hola!%20Vi%20el%20video%20de%20muestra%20y%20quiero%20información%20del%20Paquete%20de%20Videos%20Completo%20($600)%20de%20San%20Pedro%20Lagunillas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i>
                    <span>Preguntar por Video en WhatsApp</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
