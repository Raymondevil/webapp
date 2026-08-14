import React from 'react'
import type { GalleryItem } from '../types'

interface LightboxModalProps {
  photo: GalleryItem | null
  onClose: () => void
  onAddPhotoToOrder: (photo: GalleryItem) => void
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  photo,
  onClose,
  onAddPhotoToOrder
}) => {
  if (!photo) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-950/80 border border-slate-700 text-amber-400 hover:text-amber-300 flex items-center justify-center text-lg transition-all cursor-pointer"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* IMAGE / VIDEO MEDIA CONTAINER */}
        <div className="md:w-3/5 bg-slate-950 flex items-center justify-center p-4 relative min-h-[300px]">
          {photo.type === 'video' ? (
            <video
              src={photo.videoUrl || photo.url}
              controls
              autoPlay
              className="max-h-[60vh] w-full object-contain rounded-xl"
            />
          ) : (
            <img
              src={photo.url}
              alt={photo.title}
              className="max-h-[65vh] w-full object-contain rounded-xl"
            />
          )}

          {photo.dorsal && (
            <span className="absolute bottom-6 left-6 bg-amber-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg shadow-lg">
              <i className="fa-solid fa-user-tag mr-1"></i> Dorsal #{photo.dorsal}
            </span>
          )}
        </div>

        {/* DETAILS SIDEBAR */}
        <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                {photo.date}
              </span>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 bg-slate-950 px-2 py-0.5 rounded">
                {photo.category}
              </span>
            </div>

            <h3 className="font-serif font-black text-2xl text-white">{photo.title}</h3>

            <p className="text-slate-300 text-xs leading-relaxed">{photo.description}</p>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Precio Unitario:</span>
                <span className="font-serif font-black text-xl text-amber-400">${photo.price} MXN</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Formato: {photo.type === 'video' ? 'Video Full HD' : 'Fotografía Digital HD / Impresa'}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                onAddPhotoToOrder(photo)
                onClose()
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-plus-circle"></i> Agregar a mi Pedido (${photo.price})
            </button>
            <a
              href={`https://wa.me/523118470860?text=${encodeURIComponent(`Hola! Me interesa pedir la foto/video "${photo.title}" (ID: ${photo.id}, Dorsal: ${photo.dorsal || 'N/A'})`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <i className="fa-brands fa-whatsapp text-sm"></i> Preguntar por esta Foto en WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
