import React, { useState } from 'react'
import axios from 'axios'
import type { EventItem, GalleryItem } from '../types'

interface OrderCalculatorProps {
  events: EventItem[]
  selectedPhotos: GalleryItem[]
  onOrderSubmitted: (orderId: string) => void
  videoPass?: boolean
  setVideoPass?: React.Dispatch<React.SetStateAction<boolean>>
}

export const OrderCalculator: React.FC<OrderCalculatorProps> = ({
  events,
  selectedPhotos,
  onOrderSubmitted,
  videoPass: externalVideoPass,
  setVideoPass: externalSetVideoPass
}) => {
  const [internalVideoPass, setInternalVideoPass] = useState<boolean>(false)
  const videoPass = externalVideoPass !== undefined ? externalVideoPass : internalVideoPass
  const setVideoPass = externalSetVideoPass || setInternalVideoPass
  const [photoCounts, setPhotoCounts] = useState<{ digital: number; fisica: number; marco: number }>({
    digital: selectedPhotos.length || 0,
    fisica: 0,
    marco: 0
  })
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [clientName, setClientName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Calculate total
  const videoTotal = videoPass ? 600 : 0
  const photosTotal = photoCounts.digital * 50 + photoCounts.fisica * 50 + photoCounts.marco * 100
  const grandTotal = videoTotal + photosTotal

  const handleEventToggle = (title: string) => {
    if (selectedEvents.includes(title)) {
      setSelectedEvents(selectedEvents.filter((t) => t !== title))
    } else {
      setSelectedEvents([...selectedEvents, title])
    }
  }

  const handlePhotoCountChange = (type: 'digital' | 'fisica' | 'marco', delta: number) => {
    setPhotoCounts((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta)
    }))
  }

  // Generate WhatsApp Message
  const generateWhatsAppUrl = () => {
    let text = `*PEDIDO / COTIZACIÓN - FOTOGRAFÍAS EL TIGRE*\n\n`
    text += `*Cliente:* ${clientName || 'Cliente'}\n`
    text += `*Teléfono:* ${phone || 'N/A'}\n\n`
    text += `*DETALLE DE COMPRA:*\n`
    if (videoPass) {
      text += `• Paquete de Video Todos los Días: $600 MXN\n`
    }
    if (photoCounts.digital > 0) {
      text += `• Fotos Digitales HD (${photoCounts.digital}): $${photoCounts.digital * 50} MXN\n`
    }
    if (photoCounts.fisica > 0) {
      text += `• Fotos Impresas (${photoCounts.fisica}): $${photoCounts.fisica * 50} MXN\n`
    }
    if (photoCounts.marco > 0) {
      text += `• Fotos con Marco (${photoCounts.marco}): $${photoCounts.marco * 100} MXN\n`
    }
    if (selectedEvents.length > 0) {
      text += `\n*Eventos de Interés:* ${selectedEvents.join(', ')}\n`
    }
    if (selectedPhotos.length > 0) {
      text += `\n*Fotos Elegidas:* ${selectedPhotos.map((p) => `#${p.dorsal || p.id}`).join(', ')}\n`
    }
    if (notes) {
      text += `\n*Notas / Solicitudes:* ${notes}\n`
    }
    text += `\n*TOTAL ESTACIONAL:* $${grandTotal} MXN`

    return `https://wa.me/523118470860?text=${encodeURIComponent(text)}`
  }

  // Register online order via API
  const handleSubmitOnline = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim() || !phone.trim()) {
      setMessage({ type: 'error', text: 'Por favor ingresa tu Nombre y Teléfono.' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    const totalPhotosCount = photoCounts.digital + photoCounts.fisica + photoCounts.marco

    try {
      const response = await axios.post('/api/orders', {
        clientName,
        phone,
        videoPass,
        photoCount: totalPhotosCount,
        selectedPhotoIds: selectedPhotos.map((p) => p.id),
        selectedEvents,
        notes,
        total: grandTotal
      })

      if (response.data && response.data.success) {
        const orderId = response.data.order?.id || 'TIG-ORDER'
        setMessage({
          type: 'success',
          text: `¡Solicitud #${orderId} registrada con éxito! En breve te contactaremos.`
        })
        onOrderSubmitted(orderId)
      } else {
        setMessage({ type: 'error', text: 'Error al registrar pedido. Intenta por WhatsApp.' })
      }
    } catch (err: any) {
      console.error('Order submission error:', err)
      setMessage({ type: 'error', text: 'Error de conexión. Puedes enviar la orden directamente por WhatsApp.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="cotizador" className="py-16 bg-slate-950 relative border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-black px-4 py-1.5 rounded-full uppercase">
            <i className="fa-solid fa-calculator mr-1"></i> Cotizador Interactivo
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-white">
            Arma tu Pedido y Cotiza al Instante
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm">
            Selecciona el paquete de video, suma el número de fotos que necesitas o especifica tus dorsales para armar tu encargo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* FORM OPTIONS (LEFT 7 COLS) */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
            {/* STEP 1: VIDEO PASS */}
            <div className="space-y-4">
              <h3 className="font-serif font-black text-lg text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <span className="bg-amber-500 text-slate-950 rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">
                  1
                </span>
                ¿Deseas el Paquete Completo de Videos?
              </h3>

              <div
                onClick={() => setVideoPass(!videoPass)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                  videoPass
                    ? 'bg-amber-500/15 border-amber-400 shadow-lg'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={videoPass}
                  onChange={() => {}}
                  className="w-5 h-5 rounded accent-amber-500 mt-1 cursor-pointer"
                />
                <div className="space-y-1 flex-grow">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-black text-base text-white">
                      Pase Total de Videos (Del 10 Sep al Cierre)
                    </span>
                    <span className="font-serif font-black text-amber-400">$600 MXN</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Incluye la filmación en Full HD de todos los desfiles, Grito, jaripeos y todas las topaderas. Entrega en memoria USB o digital.
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 2: PHOTO COUNTERS */}
            <div className="space-y-4">
              <h3 className="font-serif font-black text-lg text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <span className="bg-amber-500 text-slate-950 rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">
                  2
                </span>
                Cantidad de Fotos Individuales
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* DIGITAL */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Digital HD</span>
                    <span className="text-amber-400 font-bold">$50 c/u</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 rounded-xl p-1.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => handlePhotoCountChange('digital', -1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-black text-lg flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-serif font-black text-base text-white">{photoCounts.digital}</span>
                    <button
                      type="button"
                      onClick={() => handlePhotoCountChange('digital', 1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-black text-lg flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* IMPRESA */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Impresa 6x8</span>
                    <span className="text-amber-400 font-bold">$50 c/u</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 rounded-xl p-1.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => handlePhotoCountChange('fisica', -1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-black text-lg flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-serif font-black text-base text-white">{photoCounts.fisica}</span>
                    <button
                      type="button"
                      onClick={() => handlePhotoCountChange('fisica', 1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-black text-lg flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* CON MARCO */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Con Marco</span>
                    <span className="text-amber-400 font-bold">$100 c/u</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 rounded-xl p-1.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => handlePhotoCountChange('marco', -1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-black text-lg flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-serif font-black text-base text-white">{photoCounts.marco}</span>
                    <button
                      type="button"
                      onClick={() => handlePhotoCountChange('marco', 1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-black text-lg flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: EVENT PICKER */}
            <div className="space-y-4">
              <h3 className="font-serif font-black text-lg text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <span className="bg-amber-500 text-slate-950 rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">
                  3
                </span>
                Eventos de los que te interesa conseguir fotos/video
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {events.map((ev) => {
                  const isChecked = selectedEvents.includes(ev.title)
                  return (
                    <label
                      key={ev.id}
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center gap-2.5 transition-all ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleEventToggle(ev.title)}
                        className="w-4 h-4 rounded accent-amber-500"
                      />
                      <span className="font-semibold line-clamp-1">{ev.title}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* STEP 4: NOTES & CUSTOM REQUESTS */}
            <div className="space-y-4">
              <h3 className="font-serif font-black text-lg text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <span className="bg-amber-500 text-slate-950 rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">
                  4
                </span>
                Detalles y Dorsales Específicos
              </h3>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Escribe números de dorsal (#12, #45), color de vestimenta, nombre del participante o instrucciones para encontrar tus fotos..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none"
              ></textarea>
            </div>
          </div>

          {/* SUMMARY SIDEBAR (RIGHT 5 COLS) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 sticky top-28 shadow-2xl">
            <h3 className="font-serif font-black text-2xl text-white border-b border-slate-800 pb-4">
              Resumen de Cotización
            </h3>

            {/* COST BREAKDOWN */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Paquete de Videos Completo:</span>
                <span className="font-bold text-white">{videoPass ? '$600 MXN' : '$0 MXN'}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Fotos Digitales HD ({photoCounts.digital}):</span>
                <span className="font-bold text-white">${photoCounts.digital * 50} MXN</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Fotos Impresas ({photoCounts.fisica}):</span>
                <span className="font-bold text-white">${photoCounts.fisica * 50} MXN</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Fotos con Marco ({photoCounts.marco}):</span>
                <span className="font-bold text-white">${photoCounts.marco * 100} MXN</span>
              </div>

              {selectedPhotos.length > 0 && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-amber-300">
                  <i className="fa-solid fa-square-check mr-1"></i> {selectedPhotos.length} fotos elegidas
                  desde la Galería / Casillas.
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold block">Total Estacional:</span>
                  <span className="text-[10px] text-amber-300/80">San Pedro Lagunillas</span>
                </div>
                <span className="font-serif font-black text-4xl text-amber-400">${grandTotal} MXN</span>
              </div>
            </div>

            {/* CLIENT INPUTS */}
            <form onSubmit={handleSubmitOnline} className="space-y-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. 311 123 4567"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              {message && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold text-center ${
                    message.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <i className="fa-brands fa-whatsapp text-lg"></i> Enviar Pedido por WhatsApp (3118470860)
                </a>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  )}
                  Registrar Solicitud en Línea
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
