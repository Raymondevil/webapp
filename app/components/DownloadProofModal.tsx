import React, { useState } from 'react'
import axios from 'axios'
import type { GalleryItem } from '../types'

interface DownloadProofModalProps {
  photo: GalleryItem | null
  isOpen: boolean
  onClose: () => void
}

export const DownloadProofModal: React.FC<DownloadProofModalProps> = ({ photo, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'code'>('upload')
  const [clientName, setClientName] = useState('')
  const [phone, setPhone] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [downloadCode, setDownloadCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ orderId: string; downloadCode: string } | null>(null)

  if (!isOpen || !photo) return null

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setReceiptFile(file)
    const reader = new FileReader()
    reader.onload = () => setReceiptPreview(reader.result as string)
    reader.readAsDataURL(file)
    setErrorMessage(null)
  }

  const handleSubmitReceipt = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!clientName.trim() || !phone.trim() || !receiptFile) {
      setErrorMessage('Completa tu nombre, teléfono y adjunta el comprobante.')
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
      formData.append('notes', `Comprobante para foto: ${photo.title}`)
      const response = await axios.post('/api/receipts/upload', formData)
      if (!response.data?.success) {
        setErrorMessage(response.data?.error || 'No se pudo enviar el comprobante.')
        return
      }
      setSuccessData({
        orderId: response.data.order?.id || 'TIG-REC',
        downloadCode: response.data.downloadCode || ''
      })
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Error al conectar con el servidor.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!downloadCode.trim()) {
      setErrorMessage('Ingresa tu código de descarga.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const response = await axios.post('/api/download/validate-code', { photoId: photo.id, code: downloadCode.trim() })
      if (!response.data?.valid) {
        setErrorMessage(response.data?.error || 'El código es inválido o aún no fue aprobado.')
        return
      }
      const link = document.createElement('a')
      link.href = response.data.downloadUrl || photo.url
      link.download = `FotografiasElTigre-${photo.id}.webp`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.setTimeout(onClose, 1500)
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'No se pudo validar el código.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-serif font-black text-xl text-white">Comprobante de Pago</h2>
            <p className="text-slate-400 text-xs">{photo.title} · ${photo.price} MXN</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white cursor-pointer">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="flex border-b border-slate-800 bg-slate-950/40">
          <button onClick={() => { setActiveTab('upload'); setErrorMessage(null) }} className={`flex-1 py-3 text-xs font-bold cursor-pointer ${activeTab === 'upload' ? 'text-amber-300 border-b-2 border-amber-400' : 'text-slate-400'}`}>
            <i className="fa-solid fa-cloud-arrow-up mr-2"></i>Subir Comprobante
          </button>
          <button onClick={() => { setActiveTab('code'); setErrorMessage(null) }} className={`flex-1 py-3 text-xs font-bold cursor-pointer ${activeTab === 'code' ? 'text-amber-300 border-b-2 border-amber-400' : 'text-slate-400'}`}>
            <i className="fa-solid fa-key mr-2"></i>Ya tengo Código
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'upload' && !successData && (
            <form onSubmit={handleSubmitReceipt} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-xs font-bold text-slate-300">Nombre completo *
                  <input required value={clientName} onChange={(event) => setClientName(event.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none" />
                </label>
                <label className="text-xs font-bold text-slate-300">WhatsApp / Teléfono *
                  <input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none" />
                </label>
              </div>
              <label className="block border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-2xl p-5 text-center cursor-pointer bg-slate-950/40">
                <input type="file" required accept="image/jpeg,image/png,image/webp,image/avif" onChange={handleFileChange} className="hidden" />
                {receiptPreview ? <img src={receiptPreview} alt="Comprobante adjuntado" className="max-h-36 mx-auto rounded-lg object-contain" /> : <><i className="fa-solid fa-cloud-arrow-up text-3xl text-amber-400"></i><p className="mt-2 text-xs font-bold text-slate-200">Adjuntar comprobante de pago</p><p className="text-[10px] text-slate-500">JPG, PNG, WebP o AVIF</p></>}
              </label>
              {errorMessage && <p className="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl text-xs font-bold text-center">{errorMessage}</p>}
              <button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl text-xs disabled:opacity-50 cursor-pointer">
                {isSubmitting ? 'Enviando comprobante...' : 'Enviar Comprobante'}
              </button>
            </form>
          )}

          {activeTab === 'upload' && successData && <div className="text-center space-y-4 py-5"><i className="fa-solid fa-circle-check text-5xl text-emerald-400"></i><h3 className="font-serif font-black text-2xl text-white">¡Comprobante recibido!</h3><p className="text-xs text-slate-300">Folio: <span className="font-mono text-amber-300">{successData.orderId}</span></p><button onClick={() => { setActiveTab('code'); setDownloadCode(successData.downloadCode) }} className="text-xs font-bold text-amber-300 cursor-pointer">Usar mi código de descarga</button></div>}

          {activeTab === 'code' && <form onSubmit={handleVerifyCode} className="space-y-4"><h3 className="font-serif font-bold text-lg text-white">Ingresa tu Código de Descarga</h3><input required value={downloadCode} onChange={(event) => setDownloadCode(event.target.value.toUpperCase())} placeholder="Ej. TIGRE-1234" className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-3 text-sm font-mono font-bold text-amber-400 uppercase focus:outline-none" />{errorMessage && <p className="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl text-xs font-bold text-center">{errorMessage}</p>}<button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl text-xs disabled:opacity-50 cursor-pointer">{isSubmitting ? 'Verificando código...' : 'Desbloquear y Descargar'}</button></form>}
        </div>
      </div>
    </div>
  )
}
