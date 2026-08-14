import React, { useState } from 'react'
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
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isVideo = file.type.startsWith('video/')
    setNewType(isVideo ? 'video' : 'photo')
    if (isVideo) setNewPrice(600)
    else setNewPrice(50)

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setNewUrl(dataUrl)
      setFilePreview(dataUrl)
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, ''))
      }
    }
    reader.readAsDataURL(file)
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
    if (!newTitle.trim() || !newUrl.trim()) {
      setUploadMessage({ type: 'error', text: 'El título y la URL / Archivo son obligatorios.' })
      return
    }

    setIsUploading(true)
    setUploadMessage(null)

    try {
      const res = await axios.post('/api/gallery/register', {
        title: newTitle,
        category: newCategory,
        date: newDate,
        type: newType,
        url: newUrl,
        videoUrl: newType === 'video' ? newUrl : undefined,
        description: newDescription,
        price: Number(newPrice),
        dorsal: newDorsal
      })

      if (res.data && res.data.success) {
        setUploadMessage({ type: 'success', text: '¡Fotografía/Video registrado en el catálogo con éxito!' })
        setNewTitle('')
        setNewUrl('')
        setFilePreview(null)
        setNewDescription('')
        setNewDorsal('')
        onRefreshData()
      } else {
        setUploadMessage({ type: 'error', text: 'Error al guardar elemento.' })
      }
    } catch (err: any) {
      console.error('Create item error:', err)
      setUploadMessage({ type: 'error', text: 'Error de servidor al guardar foto.' })
    } finally {
      setIsUploading(false)
    }
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
          <h2 className="font-serif font-black text-xl text-white">Solicitudes de Pedidos Registrados</h2>

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
                    <th className="p-3">Detalle</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.map((ord) => (
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
                        <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-bold text-[10px]">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: UPLOAD */}
      {activeSubTab === 'upload' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-black text-xl text-white">Registrar Nueva Foto o Video</h2>
              <span className="bg-amber-500/10 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-500/30">
                Soporte Celular & Web
              </span>
            </div>

            {/* DIRECT MOBILE FILE / CAMERA UPLOADER */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border-2 border-dashed border-amber-500/40 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-xl">
                <i className="fa-solid fa-camera"></i>
              </div>
              <div>
                <p className="text-white text-xs font-bold">Subir foto desde el celular o cámara</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Selecciona una imagen de tu galería o toma una foto directamente
                </p>
              </div>
              <label className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-lg transition-all">
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <span>Elegir Archivo / Tomar Foto</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {filePreview && (
                <div className="mt-4 p-3 bg-slate-900 rounded-xl border border-slate-800 text-left space-y-2">
                  <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <i className="fa-solid fa-circle-check"></i> Archivo cargado correctamente:
                  </div>
                  {newType === 'video' ? (
                    <video src={filePreview} controls className="max-h-40 rounded-lg mx-auto" />
                  ) : (
                    <img src={filePreview} alt="Preview" className="max-h-40 rounded-lg mx-auto object-contain" />
                  )}
                </div>
              )}
            </div>

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

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  URL o Datos de Imagen/Video *
                </label>
                <input
                  type="text"
                  required
                  value={newUrl.length > 80 && newUrl.startsWith('data:') ? `[Archivo cargado: ${newUrl.substring(0, 30)}...]` : newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="/static/photos/mifoto.webp o URL externa..."
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
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl shadow-lg transition-all text-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-plus-circle"></i>
                <span>{isUploading ? 'Guardando en catálogo...' : 'Agregar Elemento al Catálogo'}</span>
              </button>
            </form>
          </div>

          {/* REACT NATIVE INTEGRATION INFO CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center text-base">
                <i className="fa-brands fa-react"></i>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Integración con React Native (App Móvil)</h3>
                <p className="text-slate-400 text-xs">Sube fotos directamente desde la app en tu celular al servidor</p>
              </div>
            </div>
            <div className="bg-slate-950 rounded-xl p-4 font-mono text-[11px] text-slate-300 space-y-2 overflow-x-auto border border-slate-800">
              <div className="text-amber-400 font-bold">// Endpoint de la API REST para React Native:</div>
              <div><span className="text-emerald-400 font-bold">POST</span> /api/gallery/register</div>
              <div className="text-slate-500 mt-2">// Cuerpo del JSON (payload):</div>
              <div className="text-slate-300">
                {`{
  "title": "Foto Topadera Jinete #45",
  "category": "topaderas",
  "date": "16 de Septiembre",
  "type": "photo",
  "url": "https://mi-servidor.com/foto.jpg", // o base64
  "dorsal": "45",
  "price": 50
}`}
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Puedes usar <strong>expo-image-picker</strong> o <strong>react-native-image-picker</strong> para tomar fotos con la cámara nativa del celular y enviarlas mediante <strong>axios</strong> o <strong>fetch</strong> a este endpoint.
            </p>
          </div>
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
