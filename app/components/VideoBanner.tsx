import React, { useRef, useState } from 'react'

interface VideoBannerProps {
  onSelectVideoPass: () => void
  onOpenCotizador: () => void
}

export const VideoBanner: React.FC<VideoBannerProps> = ({
  onSelectVideoPass,
  onOpenCotizador
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  const handlePlayToggle = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  const handleChooseVideoPass = () => {
    onSelectVideoPass()
    onOpenCotizador()
  }

  return (
    <section id="video-trailer" className="py-16 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative border-t border-b border-amber-900/30">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <i className="fa-solid fa-film" /> Cobertura Cinematográfica HD
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-white">
            Revive la Emoción en Video Full HD
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm">
            Disfruta del tráiler oficial con los mejores momentos de las fiestas. Adquiere el <strong>Pase Total de Videos ($600 MXN)</strong> para tener todas las grabaciones completas de cada día y evento.
          </p>
        </div>

        {/* VIDEO CONTAINER */}
        <div className="max-w-4xl mx-auto bg-slate-950 border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/10 relative group">
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              src="/static/video/vueno.mp4"
              poster="/static/logo.jpg"
              playsInline
              loop
              muted={isMuted}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover"
            />

            {/* OVERLAY PLAY BUTTON (WHEN PAUSED) */}
            {!isPlaying && (
              <button
                onClick={handlePlayToggle}
                className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-amber-500/90 hover:bg-amber-400 text-slate-950 flex items-center justify-center text-3xl shadow-2xl transform hover:scale-110 transition-all cursor-pointer z-20 group/btn"
                aria-label="Reproducir video"
              >
                <i className="fa-solid fa-play ml-1" />
              </button>
            )}

            {/* VIDEO CONTROLS BAR AT BOTTOM */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent flex items-center justify-between z-20 opacity-90 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayToggle}
                  className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 text-amber-400 flex items-center justify-center border border-slate-700 transition-all cursor-pointer"
                  aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                >
                  <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`} />
                </button>
                <button
                  onClick={handleMuteToggle}
                  className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 text-amber-400 flex items-center justify-center border border-slate-700 transition-all cursor-pointer"
                  aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                >
                  <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`} />
                </button>
                <span className="text-xs text-slate-200 font-semibold bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 hidden sm:inline-block">
                  <i className="fa-solid fa-video text-amber-400 mr-1" /> Tráiler Oficial San Pedro Lagunillas
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg shadow">
                  Full HD 1080p
                </span>
              </div>
            </div>
          </div>

          {/* BANNER CTA BOTTOM BAR */}
          <div className="p-6 bg-slate-900/95 border-t border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="font-serif font-black text-lg text-white">
                  Pase Total de Videos Fiestas Patrias
                </span>
                <span className="font-serif font-black text-amber-400 text-xl">$600 MXN</span>
              </div>
              <p className="text-slate-400 text-xs">
                Incluye todos los días (10 Sep al Cierre): Desfiles, Noche del Grito, Jaripeos y todas las Topaderas en Memoria USB o Digital.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleChooseVideoPass}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transform hover:-translate-y-0.5"
              >
                <i className="fa-solid fa-ticket" /> Apartar Paquete de Video ($600)
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
