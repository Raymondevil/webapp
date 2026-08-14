import React, { useState } from 'react'
import axios from 'axios'

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [messageText, setMessageText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !messageText.trim()) {
      setFeedback({ type: 'error', text: 'Por favor completa todos los campos.' })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const res = await axios.post('/api/contact', {
        name,
        phone,
        message: messageText
      })

      if (res.data && res.data.success) {
        setFeedback({ type: 'success', text: '¡Mensaje enviado con éxito! En breve te responderemos.' })
        setName('')
        setPhone('')
        setMessageText('')
      } else {
        setFeedback({ type: 'error', text: 'Error al enviar mensaje.' })
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Error de red. Intenta enviar el mensaje directamente por WhatsApp.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contacto" className="py-16 bg-slate-900/60 relative border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-black px-4 py-1.5 rounded-full uppercase">
            <i className="fa-solid fa-location-dot mr-1"></i> Punto de Atención e Informes
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-white">
            Ubicación y Entregas Físicas
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm">
            ¿Prefieres atención en persona? Visítanos en San Pedro Lagunillas o escríbenos directamente.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LOCATION INFO (LEFT 6 COLS) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl">
                <i className="fa-solid fa-hammer"></i>
              </div>
              <div>
                <h3 className="font-serif font-black text-xl text-white">Carpintería "El Tigre"</h3>
                <p className="text-xs text-slate-400">Punto Oficial de Entrega Físico</p>
              </div>
            </div>

            <ul className="space-y-4 text-xs text-slate-300">
              <li className="flex items-start gap-3">
                <i className="fa-solid fa-map-pin text-amber-400 text-sm mt-0.5"></i>
                <span>
                  <strong>Ubicación:</strong> San Pedro Lagunillas, Nayarit, México. (Consultar dirección exacta en Carpintería El Tigre).
                </span>
              </li>

              <li className="flex items-start gap-3">
                <i className="fa-solid fa-phone text-emerald-400 text-sm mt-0.5"></i>
                <span>
                  <strong>Teléfono / WhatsApp Directo:</strong>{' '}
                  <a
                    href="https://wa.me/523118470860"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline font-bold"
                  >
                    311 847 0860
                  </a>
                </span>
              </li>

              <li className="flex items-start gap-3">
                <i className="fa-solid fa-hard-drive text-amber-400 text-sm mt-0.5"></i>
                <span>
                  <strong>Formatos de Entrega Disponibles:</strong> Memoria USB de alta velocidad, Enlace Digital privado de descarga HD o Foto impresa fotográfica.
                </span>
              </li>
            </ul>

            <div className="pt-4 border-t border-slate-800">
              <a
                href="https://wa.me/523118470860?text=Hola!%20Deseo%20información%20sobre%20las%20fotos/videos%20de%20San%20Pedro%20Lagunillas"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <i className="fa-brands fa-whatsapp text-base"></i> Chatear por WhatsApp (311 847 0860)
              </a>
            </div>
          </div>

          {/* CONTACT FORM (RIGHT 6 COLS) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="font-serif font-black text-xl text-white border-b border-slate-800 pb-4">
              Envíanos un Mensaje Directo
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Teléfono o WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. 311 847 0860"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mensaje o Consulta *</label>
                <textarea
                  required
                  rows={3}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Escribe tus dudas sobre las fotos o videos..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl p-3 text-xs text-white focus:outline-none"
                ></textarea>
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold text-center ${
                    feedback.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl shadow-lg transition-all text-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Mensaje a la API'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
