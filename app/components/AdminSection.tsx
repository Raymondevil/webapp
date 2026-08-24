import React, { useRef, useState } from 'react'
import axios from 'axios'
import type { GalleryItem, Order } from '../types'

interface AdminSectionProps {
  galleryItems: GalleryItem[]
  orders: Order[]
  onRefreshData: () => void
}

export const AdminSection: React.FC<AdminSectionProps> = ({
  galleryItems,
  orders,
  onRefreshData
}) => {
  const [authToken, setAuthToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
  )
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'upload' | 'gallery'>('orders')

  // Upload Form State
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('topaderas')
  const [newDate, setNewDate] = useState('16 de Septiembre')
  const [newType, setNewType] = useState<'photo' | 'video'>('photo')
  const [newUrl, setNewUrl] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPrice, setNewPrice] = useState(50)
  const [newDorsal, setNewDorsal] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [downloadCode, setDownloadCode] = useState('')
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  const handleUpdateOrderStatus = async (orderId: string, status: string, code?: string) => {
    setUpdatingOrderId(orderId)
    try {
      await axios.post(
        `/api/admin/orders/${orderId}/status`,
        { status, downloadCode: code },
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
      onRefreshData()
    } catch (err) {
      console.error('Error updating order status:', err)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await axios.post('/api/admin/login', { password })
      if (res.data && res.data.success) {
        setAuthToken(res.data.token || 'admin-secret-token')
        if (typeof window !== 'undefined') {
          localStorage.setItem('adminToken', res.data.token || 'admin-secret-token')
        }
      } else {
        setLoginError('Contraseña incorrecta.')
      }
    } catch (err) {
      setLoginError('Error de autenticación o contraseña inválida.')
    }
  }

  const handleLogout = () => {
    setAuthToken(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken')
    }
  }

  const handleCreateGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || (!selectedFile && !newUrl.trim())) {
      setUploadMessage({ type: 'error', text: 'El título y un archivo o URL son obligatorios.' })
      return
    }

    setIsUploading(true)
    setUploadMessage(null)

    try {
      let mediaUrl = newUrl.trim()
      let mediaId: string | undefined
      if (selectedFile) {
        if (downloadCode.trim().length < 8) throw new Error('Genera o escribe un código de descarga de al menos 8 caracteres.')
        const fileData = new FormData()
        fileData.append('file', selectedFile)
        fileData.append('downloadCode', downloadCode.trim())
        if (selectedFile.type.startsWith('image/')) fileData.append('preview', await createPreview(selectedFile))
        const uploadRes = await axios.post('/api/media/upload', fileData, {
          headers: { Authorization: `Bearer ${authToken}` }
        })
        if (!uploadRes.data?.success || !uploadRes.data.url) {
          throw new Error(uploadRes.data?.error || 'No se pudo subir el archivo.')
        }
        mediaUrl = uploadRes.data.url
        mediaId = uploadRes.data.mediaId
      }

      const res = await axios.post(
        '/api/gallery/register',
        {
          title: newTitle,
          id: mediaId,
          category: newCategory,
          date: newDate,
          type: newType,
          url: mediaUrl,
          videoUrl: newType === 'video' ? mediaUrl : undefined,
          description: newDescription,
          price: Number(newPrice),
          dorsal: newDorsal
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      )

      if (res.data && res.data.success) {
        setUploadMessage({ type: 'success', text: selectedFile ? `¡Archivo protegido y registrado! Código: ${downloadCode}` : '¡Fotografía/Video registrado en el catálogo!' })
        setNewTitle('')
        setNewUrl('')
        setSelectedFile(null)
        setNewDescription('')
        setNewDorsal('')
        onRefreshData()
      } else {
        setUploadMessage({ type: 'error', text: 'Error al guardar elemento.' })
      }
    } catch (err: any) {
      console.error('Create item error:', err)
      setUploadMessage({ type: 'error', text: err.response?.data?.error || err.message || 'Error de servidor al guardar foto.' })
    } finally {
      setIsUploading(false)
    }
  }

  const selectFile = (file: File | undefined, type: 'photo' | 'video') => {
    if (!file) return
    setSelectedFile(file)
    setNewType(type)
    setNewUrl('')
    setUploadMessage(null)
  }

  const generateDownloadCode = () => {
    const bytes = new Uint32Array(2)
    crypto.getRandomValues(bytes)
    setDownloadCode(`TIGRE-${bytes[0].toString(36).toUpperCase()}${bytes[1].toString(36).toUpperCase()}`)
  }

  const createPreview = async (file: File): Promise<File> => {
    const source = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image(); const objectUrl = URL.createObjectURL(file)
      image.onload = () => { URL.revokeObjectURL(objectUrl); resolve(image) }
      image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('No se pudo leer la foto.')) }
      image.src = objectUrl
    })
    const scale = Math.min(1, 1400 / Math.max(source.naturalWidth, source.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(source.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(source.naturalHeight * scale))
    canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.8))
    if (!blob) throw new Error('No se pudo crear la vista previa.')
    return new File([blob], 'vista-previa.webp', { type: 'image/webp' })
  }

  if (!authToken) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-xl">
              <i className="fa-solid fa-lock"></i>
            </div>
            <h2 className="font-serif font-black text-2xl text-white">Panel de Administración</h2>
            <p className="text-slate-400 text-xs">Acceso exclusivo para el equipo de Fotografías El Tigre.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Contraseña Admin</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa clave de acceso..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl text-xs font-bold text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl shadow-lg transition-all text-xs cursor-pointer"
            >
              Iniciar Sesión Admin
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* HEADER BAR */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-lg">
            <i className="fa-solid fa-user-shield"></i>
          </div>
          <div>
            <h1 className="font-serif font-black text-xl text-white">Administrador El Tigre</h1>
            <span className="text-xs text-emerald-400 font-semibold">Sesión Activa</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            <i className="fa-solid fa-list-check mr-1"></i> Pedidos ({orders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'upload'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            <i className="fa-solid fa-cloud-arrow-up mr-1"></i> Cargar Foto
          </button>
          <button
            onClick={() => setActiveSubTab('gallery')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'gallery'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            <i className="fa-solid fa-images mr-1"></i> Catálogo ({galleryItems.length})
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Salir
          </button>
        </div>
      </div>

      {/* SUBTAB 1: ORDERS */}
      {activeSubTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-black text-xl text-white">Solicitudes de Pedidos y Comprobantes</h2>
            <button
              onClick={onRefreshData}
              className="bg-slate-950 hover:bg-slate-800 text-amber-300 border border-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-arrows-rotate"></i> Actualizar
            </button>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No hay pedidos registrados aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-amber-400 font-serif uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">ID / Fecha</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Contacto</th>
                    <th className="p-3">Comprobante</th>
                    <th className="p-3">Detalle</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Código Descarga</th>
                    <th className="p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.map((ord) => {
                    const code = ord.downloadCode || `TIGRE-${ord.id.replace('TIG-', '')}`
                    const isApproved = ord.status.toLowerCase().includes('aprob') || ord.status.toLowerCase().includes('paga')
                    const waMessage = `¡Hola ${ord.clientName}! Tu comprobante de pago para el pedido #${ord.id} ha sido validado con éxito. Tu código de descarga autorizado es: *${code}*. Ya puedes entrar a la web y descargar tus fotos en alta calidad.`

                    return (
                      <tr key={ord.id} className="hover:bg-slate-950/50">
                        <td className="p-3 font-mono font-bold text-amber-300">
                          {ord.id}
                          <span className="block text-[10px] text-slate-500 font-sans">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-white">{ord.clientName}</td>
                        <td className="p-3">
                          <a
                            href={`https://wa.me/52${ord.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:underline font-bold"
                          >
                            <i className="fa-brands fa-whatsapp"></i> {ord.phone}
                          </a>
                        </td>
                        <td className="p-3">
                          {ord.receiptUrl ? (
                            <button
                              type="button"
                              onClick={() => setViewingReceiptUrl(ord.receiptUrl || null)}
                              className="bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <i className="fa-solid fa-receipt"></i> Ver Ticket
                            </button>
                          ) : (
                            <span className="text-slate-600 text-[11px] italic">Sin comprobante</span>
                          )}
                        </td>
                        <td className="p-3 max-w-xs">
                          <div className="space-y-1">
                            {ord.videoPass && (
                              <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-bold mr-1">
                                Pase Video ($600)
                              </span>
                            )}
                            {ord.photoCount > 0 && (
                              <span className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {ord.photoCount} fotos
                              </span>
                            )}
                            {ord.notes && <p className="text-[11px] text-slate-400 italic">"{ord.notes}"</p>}
                          </div>
                        </td>
                        <td className="p-3 font-serif font-black text-amber-400 text-sm">${ord.total} MXN</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              isApproved
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : ord.receiptUrl
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-bold text-amber-400 text-xs bg-slate-950 px-2 py-1 rounded border border-slate-800">
                            {ord.downloadCode || 'Sin asignar'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {!isApproved && (
                              <button
                                type="button"
                                disabled={updatingOrderId === ord.id}
                                onClick={() => handleUpdateOrderStatus(ord.id, 'Pagado (Comprobante Aprobado)', code)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <i className="fa-solid fa-check-circle"></i> Aprobar Pago
                              </button>
                            )}

                            <a
                              href={`https://wa.me/52${ord.phone.replace(/\D/g, '')}?text=${encodeURIComponent(waMessage)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold px-2.5 py-1.5 rounded-lg text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <i className="fa-brands fa-whatsapp"></i> Enviar Código
                            </a>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL TO VIEW PAYMENT RECEIPT */}
      {viewingReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-serif font-black text-lg text-white flex items-center gap-2">
                <i className="fa-solid fa-receipt text-amber-400"></i> Comprobante de Pago
              </h3>
              <button
                onClick={() => setViewingReceiptUrl(null)}
                className="w-8 h-8 rounded-full bg-slate-950 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="bg-slate-950 rounded-2xl p-2 border border-slate-800 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={viewingReceiptUrl}
                alt="Comprobante de pago"
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setViewingReceiptUrl(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: UPLOAD */}
      {activeSubTab === 'upload' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-w-2xl mx-auto shadow-xl">
          <h2 className="font-serif font-black text-xl text-white">Registrar Nueva Foto o Video</h2>

          <form onSubmit={handleCreateGalleryItem} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Título / Descripción corta *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej. Jinete con Dorsal #12 en la Topadera"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Categoría</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white"
                >
                  <option value="topaderas">Topaderas y Jaripeos</option>
                  <option value="cabalgatas">Cabalgatas</option>
                  <option value="grito">Noche del Grito</option>
                  <option value="desfiles">Desfiles</option>
                  <option value="bailes">Bailes</option>
                  <option value="videos">Videos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Dorsal (#)</label>
                <input
                  type="text"
                  value={newDorsal}
                  onChange={(e) => setNewDorsal(e.target.value)}
                  placeholder="Ej. 12, 45, 101"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tipo de Archivo</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as 'photo' | 'video')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white"
                >
                  <option value="photo">Fotografía ($50)</option>
                  <option value="video">Video ($600)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Precio (MXN)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">Archivo desde celular o computadora</label>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => selectFile(e.target.files?.[0], 'photo')}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                className="hidden"
                onChange={(e) => selectFile(e.target.files?.[0], 'video')}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" onClick={() => photoInputRef.current?.click()} className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold py-3 rounded-xl text-xs transition-all">
                  <i className="fa-solid fa-image mr-2"></i>Explorar fotos
                </button>
                <button type="button" onClick={() => videoInputRef.current?.click()} className="bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold py-3 rounded-xl text-xs transition-all">
                  <i className="fa-solid fa-video mr-2"></i>Explorar videos
                </button>
              </div>
              {selectedFile && <p className="text-xs text-emerald-300 font-semibold truncate">Archivo seleccionado: {selectedFile.name}</p>}
            </div>

            {selectedFile && (
              <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <label className="block text-xs font-bold text-amber-200">Código individual para descargar *</label>
                <div className="flex gap-2">
                  <input value={downloadCode} onChange={(e) => setDownloadCode(e.target.value)} placeholder="Código que entregarás al cliente" className="min-w-0 flex-1 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2.5 text-xs text-white" />
                  <button type="button" onClick={generateDownloadCode} className="shrink-0 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 rounded-xl px-3 text-xs font-bold">Generar</button>
                </div>
                <p className="text-[11px] text-slate-400">Guárdalo y compártelo sólo tras el pago; el servidor guarda únicamente una huella segura.</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">URL de Imagen/Video (opcional)</label>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Úsala sólo si el archivo ya está publicado..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Descripción Larga</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                placeholder="Detalles sobre la captura..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl p-3 text-xs text-white"
              ></textarea>
            </div>

            {uploadMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-bold text-center ${
                  uploadMessage.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
              >
                {uploadMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl shadow-lg transition-all text-xs cursor-pointer disabled:opacity-50"
            >
              {isUploading ? 'Subiendo y guardando...' : 'Agregar Elemento al Catálogo'}
            </button>
          </form>
        </div>
      )}

      {/* SUBTAB 3: GALLERY LIST */}
      {activeSubTab === 'gallery' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <h2 className="font-serif font-black text-xl text-white">Catálogo Actual ({galleryItems.length})</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryItems.map((item) => (
              <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
                <img src={item.url} alt={item.title} className="w-full h-28 object-cover rounded-lg" />
                <h4 className="font-bold text-white line-clamp-1">{item.title}</h4>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Dorsal: #{item.dorsal || 'N/A'}</span>
                  <span className="text-amber-400 font-bold">${item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
