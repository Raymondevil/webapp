import React, { useState } from 'react'
import axios from 'axios'
import type { GalleryItem } from '../types'

interface DownloadProofModalProps {
  photo: GalleryItem | null
  isOpen: boolean
  onClose: () => void
}

export const DownloadProofModal: React.FC<DownloadProofModalProps> = ({
  photo,
  isOpen,
  onClose
}) => {
  if (!isOpen || !photo) return null

  const [activeTab, setActiveTab] = useState<'upload' | 'code'>('upload')
  const [clientName, setClientName] = useState('')
  const [phone, setPhone] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [downloadCode, setDownloadCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ orderId: string; downloadCode: string } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceiptFile(file)
      const reader = new FileReader()
      reader.onload = () => setReceiptPreview(reader.result as string)
      reader.readAsDataURL(file)
      setErrorMessage(null)
    }
  }

  // Handle uploading payment receipt
  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim() || !phone.trim()) {
      setErrorMessage('Por favor escribe tu Nombre y Teléfono.')
      return
    }
    if (!receiptFile) {
      setErrorMessage('Por favor adjunta la foto o captura de tu comprobante de pago.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const formData = new FormData()
      formData.append('receipt', receiptFile)
      formData.append('clientName', clientName.trim())
      formData.append('phone', phone.trim())
      formData.append('photoId', photo.id)
      formData.append('photoTitle', photo.title)
      formData.append('total', String(photo.price))
      formData.append('notes', `Comprobante de pago para foto: ${photo.title} (Dorsal: ${photo.dorsal || 'N/A'})`)

      const res = await axios.post('/api/receipts/upload', formData)
      if (res.data && res.data.success) {
        setSuccessData({
          orderId: res.data.order?.id || 'TIG-REC',
          downloadCode: res.data.downloadCode || ''
        })
      } else {
        setErrorMessage(res.data?.error || 'No se pudo enviar el comprobante. Intenta nuevamente.')
      }
    } catch (err: any) {
      console.error('Error uploading receipt:', err)
      setErrorMessage(err.response?.data?.error || 'Error al conectar con el servidor. Intenta enviarlo por WhatsApp.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle verifying and triggering download with code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!downloadCode.trim()) {
      setErrorMessage('Ingresa el código de descarga que te proporcionamos.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await axios.post('/api/download/validate-code', {
        photoId: photo.id,
        code: downloadCode.trim()
      })

      if (res.data && res.data.valid) {
        // Trigger download
        const downloadUrl = res.data.downloadUrl || photo.url
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `FotografiasElTigre-${photo.dorsal ? 'Dorsal' + photo.dorsal + '-' : ''}${photo.id}.webp`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Close modal after successful trigger
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setErrorMessage(res.data?.error || 'El código es inválido o tu comprobante aún no ha sido aprobado.')
      }
    } catch (err: any) {
      console.error('Error validating code:', err)
      setErrorMessage(err.response?.data?.error || 'Código incorrecto o no autorizado para esta foto.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateWhatsAppReceiptMessage = () => {
    const text = `*COMPROBANTE DE PAGO ENVIADO - FOTOGRAFÍAS EL TIGRE*\n\n` +
      `*Cliente:* ${clientName || 'Cliente'}\n` +
      `*Teléfono:* ${phone || 'N/A'}\n` +
      `*Foto:* ${photo.title} (ID: ${photo.id}, Dorsal: ${photo.dorsal || 'N/A'})\n` +
      `*Total Pagado:* $${photo.price} MXN\n` +
      (successData ? `*Folio:* #${successData.orderId}\n` : '') +
      `\nAcabo de subir mi comprobante de pago en la web. ¿Podrían por favor autorizar mi descarga? ¡Muchas gracias!`
    return `https://wa.me/523118470860?text=${encodeURIComponent(text)}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
        {/* HEADER */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-lg">
              <i className="fa-solid fa-file-invoice-dollar"></i>
            </div>
            <div>
              <h2 className="font-serif font-black text-xl text-white">Comprobante de Pago</h2>
              <p className="text-slate-400 text-xs">Descarga de foto en alta calidad sin marcas de agua</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-all"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* PHOTO MINI BANNER */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={photo.url}
              alt={photo.title}
              className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0"
            />
            <div className="min-w-0">
              <h4 className="font-serif font-bold text-sm text-white truncate">{photo.title}</h4>
              <p className="text-xs text-slate-400">
                {photo.dorsal ? `Dorsal #${photo.dorsal} • ` : ''}{photo.date}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">A Pagar</span>
            <span className="font-serif font-black text-xl text-amber-400">${photo.price} MXN</span>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => { setActiveTab('upload'); setErrorMessage(null); }}
            className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-cloud-arrow-up"></i> 1. Subir Comprobante
          </button>
          <button
            onClick={() => { setActiveTab('code'); setErrorMessage(null); }}
            className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'code'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-key"></i> 2. Ya tengo Código
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="p-6 space-y-6 flex-grow">
          {/* TAB 1: UPLOAD RECEIPT */}
          {activeTab === 'upload' && !successData && (
            <div className="space-y-6">
              {/* BANK PAYMENT INFO */}
              <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-amber-300 font-bold border-b border-slate-800 pb-2">
                  <span><i className="fa-solid fa-building-columns mr-1.5"></i> Datos de Transferencia / Depósito</span>
                  <span className="bg-amber-500/20 px-2 py-0.5 rounded text-[10px]">SPEI / OXXO</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500 block">Banco:</span>
                    <span className="font-bold text-white">BBVA Bancomer</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Beneficiario:</span>
                    <span className="font-bold text-white">Fotografías El Tigre</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">CLABE Interbancaria:</span>
                    <span className="font-mono font-bold text-amber-300">012 560 015849204821</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Concepto:</span>
                    <span className="font-bold text-white">Foto {photo.dorsal ? '#' + photo.dorsal : photo.id}</span>
                  </div>
                </div>
              </div>

              {/* UPLOAD FORM */}
              <form onSubmit={handleSubmitReceipt} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Tu Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ej. Martín González"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp / Teléfono *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ej. 311 123 4567"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* FILE INPUT */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Foto o Captura del Comprobante de Pago *
                  </label>
                  <div className="border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-2xl p-4 text-center cursor-pointer transition-all bg-slate-950/40 relative">
                    <input
                      type="file"
                      required
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {receiptPreview ? (
                      <div className="space-y-2 flex flex-col items-center">
                        <img
                          src={receiptPreview}
                          alt="Comprobante"
                          className="max-h-36 rounded-lg object-contain border border-slate-700"
                        />
                        <span className="text-xs text-emerald-400 font-bold">
                          <i className="fa-solid fa-check-circle mr-1"></i> Comprobante adjuntado ({receiptFile?.name})
                        </span>
                        <span className="text-[10px] text-slate-400">Haz clic para cambiar archivo</span>
                      </div>
                    ) : (
                      <div className="space-y-2 py-4">
                        <i className="fa-solid fa-cloud-arrow-up text-3xl text-amber-400"></i>
                        <p className="text-xs font-bold text-slate-200">
                          Haz clic para adjuntar comprobante (SPEI / Ticket OXXO)
                        </p>
                        <p className="text-[10px] text-slate-500">Formatos JPG, PNG o WebP</p>
                      </div>
                    )}
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl text-xs font-bold text-center">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Enviando comprobante...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i> Enviar Comprobante y Solicitar Descarga
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 1 SUCCESS STATE */}
          {activeTab === 'upload' && successData && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl animate-bounce">
                <i className="fa-solid fa-circle-check"></i>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif font-black text-2xl text-white">¡Comprobante Recibido con Éxito!</h3>
                <p className="text-slate-300 text-xs max-w-md mx-auto">
                  Tu solicitud ha sido registrada bajo el Folio <span className="font-mono font-bold text-amber-300">#{successData.orderId}</span>.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-left text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Tu Código de Descarga generado:</span>
                  <span className="font-mono font-black text-amber-400 text-sm">{successData.downloadCode}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  En cuanto el fotógrafo valide tu pago, este código se activará automáticamente para descargar la foto en calidad HD.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href={generateWhatsAppReceiptMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <i className="fa-brands fa-whatsapp text-lg"></i> Notificar al Fotógrafo por WhatsApp para Aprobación Rápida
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('code')
                    setDownloadCode(successData.downloadCode)
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold py-3 rounded-xl border border-slate-700 text-xs transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-key mr-1.5"></i> Probar descarga con este código
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DOWNLOAD WITH CODE */}
          {activeTab === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-lg text-white">Ingresa tu Código de Descarga</h3>
                <p className="text-slate-400 text-xs">
                  Si ya realizaste tu pago y el equipo de Fotografías El Tigre te entregó tu código autorizado, escríbelo aquí para desbloquear la descarga en alta resolución.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">Código Autorizado (PIN / Ticket)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={downloadCode}
                    onChange={(e) => setDownloadCode(e.target.value.toUpperCase())}
                    placeholder="Ej. TIGRE-1234"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-3 pl-11 text-sm font-mono font-bold text-amber-400 uppercase focus:outline-none"
                  />
                  <i className="fa-solid fa-key absolute left-4 top-3.5 text-amber-500/70 text-sm"></i>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl text-xs font-bold text-center">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Verificando código...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-download"></i> Desbloquear y Descargar Foto HD
                    </>
                  )}
                </button>

                <a
                  href={`https://wa.me/523118470860?text=${encodeURIComponent(`Hola! Deseo obtener el código de descarga para la foto "${photo.title}" (ID: ${photo.id}, Dorsal: ${photo.dorsal || 'N/A'}). ¿A qué cuenta puedo depositar?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border border-emerald-500/30 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <i className="fa-brands fa-whatsapp text-sm"></i> Solicitar Código por WhatsApp (3118470860)
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
