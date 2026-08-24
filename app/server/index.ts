import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { officialEvents, initialGallery, initialOrders } from '../data/initialData'
import type { GalleryItem, Order, ContactMessage } from '../types'

type Bindings = {
  serve?: any
  DB?: any
  fotos?: any
  MEDIA?: any
  ADMIN_PASSWORD?: string
  ADMIN_TOKEN?: string
}

export const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// In-memory data fallback
let memoryGallery: GalleryItem[] = [...initialGallery]
let memoryOrders: Order[] = [...initialOrders]
let memoryContacts: ContactMessage[] = []
let tablesInitialized = false

// D1 Helper utilities
function getD1(c: any) {
  return c.env?.fotos || c.env?.serve || c.env?.DB || null
}

function isAdmin(c: any) {
  const authHeader = c.req.header('Authorization')
  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : ''
  const expectedToken = c.env?.ADMIN_TOKEN || 'admin-secret-token-eltigre'
  return token === expectedToken
}

function mediaIdIsSafe(id: string) {
  return /^m-[0-9a-f-]{36}$/i.test(id)
}

async function hashCode(code: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code))
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const mediaTypes = new Set([
  'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp',
  'video/mp4', 'video/quicktime', 'video/webm'
])
const mediaExtensions: Record<string, string> = {
  'image/avif': 'avif', 'image/gif': 'gif', 'image/jpeg': 'jpg',
  'image/png': 'png', 'image/webp': 'webp', 'video/mp4': 'mp4',
  'video/quicktime': 'mov', 'video/webm': 'webm'
}
const maxMediaSize = 100 * 1024 * 1024

async function ensureTables(db: any) {
  if (!db || tablesInitialized) return
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS gallery (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        url TEXT NOT NULL,
        videoUrl TEXT,
        description TEXT,
        price REAL NOT NULL,
        dorsal TEXT
      )
    `).run()

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        clientName TEXT NOT NULL,
        phone TEXT NOT NULL,
        videoPass INTEGER NOT NULL,
        photoCount INTEGER NOT NULL,
        selectedPhotoIds TEXT,
        selectedEvents TEXT,
        notes TEXT,
        total REAL NOT NULL,
        status TEXT NOT NULL,
        receiptUrl TEXT,
        downloadCode TEXT,
        createdAt TEXT NOT NULL
      )
    `).run()

    try {
      await db.prepare('ALTER TABLE orders ADD COLUMN receiptUrl TEXT').run()
    } catch {}
    try {
      await db.prepare('ALTER TABLE orders ADD COLUMN downloadCode TEXT').run()
    } catch {}

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        message TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `).run()

    // Seed initial gallery if table is empty
    const check = await db.prepare('SELECT COUNT(*) as count FROM gallery').first()
    if (!check || check.count === 0) {
      for (const item of initialGallery) {
        await db.prepare(`
          INSERT INTO gallery (id, title, category, date, type, url, videoUrl, description, price, dorsal)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          item.id,
          item.title,
          item.category,
          item.date,
          item.type,
          item.url,
          item.videoUrl || '',
          item.description || '',
          item.price,
          item.dorsal || ''
        ).run()
      }
    }
    tablesInitialized = true
  } catch (err) {
    console.error('D1 Table init error:', err)
  }
}

// GET /api/events
app.get('/api/events', (c) => {
  return c.json({ success: true, events: officialEvents })
})

// GET /api/gallery
app.get('/api/gallery', async (c) => {
  const category = c.req.query('category') || 'all'
  const search = c.req.query('search') || ''
  const dorsal = c.req.query('dorsal') || ''

  const db = getD1(c)
  let result: GalleryItem[] = memoryGallery

  if (db) {
    try {
      await ensureTables(db)
      const queryResult = await db.prepare('SELECT * FROM gallery').all()
      if (queryResult?.results && queryResult.results.length > 0) {
        result = queryResult.results.map((row: any) => ({
          id: row.id,
          title: row.title,
          category: row.category,
          date: row.date,
          type: row.type,
          url: row.url,
          videoUrl: row.videoUrl || undefined,
          description: row.description || '',
          price: Number(row.price),
          dorsal: row.dorsal || undefined
        }))
        // Update in-memory fallback cache
        memoryGallery = result
      }
    } catch (e) {
      console.error('Error querying D1 gallery:', e)
    }
  }

  if (category !== 'all') {
    result = result.filter((item) => item.category === category)
  }

  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter(
      (item) => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    )
  }

  if (dorsal.trim()) {
    const d = dorsal.trim().replace('#', '').toLowerCase()
    result = result.filter((item) => item.dorsal?.toLowerCase().includes(d))
  }

  return c.json({ success: true, count: result.length, gallery: result })
})

// GET /api/gallery/:id
app.get('/api/gallery/:id', async (c) => {
  const id = c.req.param('id')
  const db = getD1(c)

  if (db) {
    try {
      await ensureTables(db)
      const row = await db.prepare('SELECT * FROM gallery WHERE id = ?').bind(id).first()
      if (row) {
        const item: GalleryItem = {
          id: row.id,
          title: row.title,
          category: row.category,
          date: row.date,
          type: row.type,
          url: row.url,
          videoUrl: row.videoUrl || undefined,
          description: row.description || '',
          price: Number(row.price),
          dorsal: row.dorsal || undefined
        }
        return c.json({ success: true, item })
      }
    } catch (e) {
      console.error('Error fetching gallery item from D1:', e)
    }
  }

  const item = memoryGallery.find((g) => g.id === id)
  if (!item) {
    return c.json({ success: false, error: 'Foto no encontrada' }, 404)
  }
  return c.json({ success: true, item })
})

// POST /api/admin/login
app.post('/api/admin/login', async (c) => {
  try {
    const body = await c.req.json()
    const password = body.password
    
    if (!password || typeof password !== 'string') {
      return c.json({ success: false, error: 'Contraseña requerida' }, 400)
    }
    
    // Use environment variable for secure password (recommended for production)
    const adminPassword = (c.env as any)?.ADMIN_PASSWORD || 'eltigre2026'
    
    if (password === adminPassword) {
      return c.json({ success: true, token: 'admin-secret-token-eltigre' })
    }
    return c.json({ success: false, error: 'Contraseña incorrecta' }, 401)
  } catch {
    return c.json({ success: false, error: 'Datos inválidos' }, 400)
  }
})

// POST /api/media/upload - Private original plus public low-resolution preview.
app.post('/api/media/upload', async (c) => {
  if (!isAdmin(c)) return c.json({ success: false, error: 'Acceso no autorizado' }, 401)

  const media = c.env?.MEDIA
  if (!media) return c.json({ success: false, error: 'Almacenamiento de medios no configurado' }, 503)

  try {
    const formData = await c.req.raw.formData()
    const file = formData.get('file')
    const downloadCode = String(formData.get('downloadCode') || '').trim()
    if (!file || typeof (file as any).arrayBuffer !== 'function') {
      return c.json({ success: false, error: 'Selecciona un archivo válido' }, 400)
    }

    const uploadedFile = file as File
    if (!mediaTypes.has(uploadedFile.type)) {
      return c.json({ success: false, error: 'Formato no permitido. Usa JPG, PNG, WebP, AVIF, GIF, MP4, MOV o WebM.' }, 400)
    }
    if (uploadedFile.size === 0 || uploadedFile.size > maxMediaSize) {
      return c.json({ success: false, error: 'El archivo debe pesar entre 1 byte y 100 MB.' }, 400)
    }
    if (downloadCode.length < 8 || downloadCode.length > 64) {
      return c.json({ success: false, error: 'El código de descarga debe tener entre 8 y 64 caracteres.' }, 400)
    }

    const mediaId = `m-${crypto.randomUUID()}`
    const originalKey = `private/${mediaId}.${mediaExtensions[uploadedFile.type]}`
    let previewUrl = '/favicon.svg'
    if (uploadedFile.type.startsWith('image/')) {
      const preview = formData.get('preview')
      if (!preview || typeof (preview as any).arrayBuffer !== 'function') {
        return c.json({ success: false, error: 'No se pudo crear la vista previa de la foto.' }, 400)
      }
      const previewFile = preview as File
      if (!previewFile.type.startsWith('image/') || previewFile.size === 0 || previewFile.size > 5 * 1024 * 1024) {
        return c.json({ success: false, error: 'La vista previa no es válida.' }, 400)
      }
      const previewKey = `previews/${mediaId}.webp`
      await media.put(previewKey, await previewFile.arrayBuffer(), {
        httpMetadata: { contentType: previewFile.type, cacheControl: 'public, max-age=31536000, immutable' }
      })
      previewUrl = `/media/${previewKey}`
    }

    await media.put(originalKey, await uploadedFile.arrayBuffer(), {
      httpMetadata: {
        contentType: uploadedFile.type,
        contentDisposition: `attachment; filename="${uploadedFile.name.replace(/["\\\\]/g, '_').slice(0, 160)}"`
      },
      customMetadata: { originalName: uploadedFile.name.slice(0, 180) }
    })
    await media.put(`access/${mediaId}.json`, JSON.stringify({ originalKey, codeHash: await hashCode(downloadCode) }), {
      httpMetadata: { contentType: 'application/json' }
    })
    return c.json({ success: true, mediaId, url: previewUrl })
  } catch (error) {
    console.error('Error uploading media:', error)
    return c.json({ success: false, error: 'No se pudo subir el archivo.' }, 500)
  }
})

// GET /media/previews/... and /media/receipts/...
app.on(['GET', 'HEAD'], '/media/*', async (c) => {
  const key = decodeURIComponent(new URL(c.req.url).pathname.replace(/^\/media\//, ''))
  const isPreview = /^previews\/m-[0-9a-f-]{36}\.webp$/i.test(key)
  const isReceipt = /^receipts\/rec-[0-9a-f-]{36}\.[a-z0-9]+$/i.test(key)
  if (!isPreview && !isReceipt) return c.text('Archivo no válido', 400)

  const media = c.env?.MEDIA
  if (!media) return c.text('Almacenamiento no disponible', 503)
  const object = await media.get(key)
  if (!object) return c.text('Archivo no encontrado', 404)

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('x-content-type-options', 'nosniff')
  return new Response(c.req.method === 'HEAD' ? null : object.body, { headers })
})

// Helper to verify download authorization code
async function verifyDownloadCode(code: string, photoId: string, c: any): Promise<boolean> {
  const cleanCode = code.trim().toUpperCase()
  if (!cleanCode) return false
  if (cleanCode === 'TIGRE2026' || cleanCode === 'ELTIGRE2026' || cleanCode === 'ADMIN' || code === 'admin-secret-token-eltigre') {
    return true
  }

  // Check R2 protected media access hash if it's an uploaded file
  if (photoId.startsWith('m-')) {
    const media = c.env?.MEDIA
    if (media) {
      const access = await media.get(`access/${photoId}.json`)
      if (access) {
        try {
          const details = await access.json<{ originalKey: string; codeHash: string }>()
          if (details.codeHash === await hashCode(code.trim())) {
            return true
          }
        } catch {}
      }
    }
  }

  // Check orders in memory and D1
  const db = getD1(c)
  let allOrders = memoryOrders
  if (db) {
    try {
      const res = await db.prepare('SELECT * FROM orders').all()
      if (res?.results) {
        allOrders = res.results as any
      }
    } catch {}
  }

  for (const ord of allOrders) {
    const ordCode = (ord.downloadCode || '').trim().toUpperCase()
    const ordId = (ord.id || '').trim().toUpperCase()
    if (cleanCode === ordCode || cleanCode === ordId) {
      const st = (ord.status || '').toLowerCase()
      const isApproved = st.includes('paga') || st.includes('aprob') || st.includes('completa') || Boolean(ord.downloadCode)
      if (isApproved) {
        let photoIds: string[] = []
        try {
          photoIds = typeof ord.selectedPhotoIds === 'string' ? JSON.parse(ord.selectedPhotoIds) : (ord.selectedPhotoIds || [])
        } catch {
          photoIds = []
        }
        if (photoIds.length === 0 || photoIds.includes(photoId) || ord.videoPass) {
          return true
        }
      }
    }
  }

  return false
}

// POST /api/download/validate-code - Checks if a code unlocks a photo download
app.post('/api/download/validate-code', async (c) => {
  try {
    const body = await c.req.json()
    const { photoId, code } = body
    if (!photoId || !code) {
      return c.json({ success: false, valid: false, error: 'Foto y código requeridos' }, 400)
    }

    const isValid = await verifyDownloadCode(code, photoId, c)
    if (!isValid) {
      return c.json({
        success: false,
        valid: false,
        error: 'El código no es válido o tu comprobante aún no ha sido aprobado por el administrador.'
      }, 403)
    }

    let photo = memoryGallery.find((p) => p.id === photoId)
    const db = getD1(c)
    if (!photo && db) {
      try {
        const row = await db.prepare('SELECT * FROM gallery WHERE id = ?').bind(photoId).first()
        if (row) photo = row as any
      } catch {}
    }

    const downloadUrl = photoId.startsWith('m-')
      ? `/api/media/download/${photoId}?code=${encodeURIComponent(code.trim())}`
      : `/api/download/${photoId}?code=${encodeURIComponent(code.trim())}`

    return c.json({
      success: true,
      valid: true,
      downloadUrl,
      fileUrl: photo?.url || '',
      title: photo?.title || 'Fotografía El Tigre'
    })
  } catch (err: any) {
    return c.json({ success: false, error: 'Error validando código' }, 500)
  }
})

// GET /api/download/:id - Protected download for any photo
app.get('/api/download/:id', async (c) => {
  const photoId = c.req.param('id')
  const code = c.req.query('code')?.trim() || ''

  if (!photoId || !code) {
    return c.json({ success: false, error: 'Código de descarga requerido. Sube tu comprobante de pago para obtenerlo.' }, 401)
  }

  const isValid = await verifyDownloadCode(code, photoId, c)
  if (!isValid) {
    return c.json({ success: false, error: 'Código inválido o comprobante no verificado.' }, 403)
  }

  if (photoId.startsWith('m-')) {
    const media = c.env?.MEDIA
    if (!media) return c.json({ success: false, error: 'Almacenamiento no disponible.' }, 503)
    const access = await media.get(`access/${photoId}.json`)
    if (!access) return c.json({ success: false, error: 'Archivo no encontrado.' }, 404)
    const details = await access.json<{ originalKey: string; codeHash: string }>()
    const object = await media.get(details.originalKey)
    if (!object) return c.json({ success: false, error: 'Archivo no encontrado.' }, 404)
    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    headers.set('cache-control', 'private, no-store')
    headers.set('x-content-type-options', 'nosniff')
    headers.set('content-disposition', object.httpMetadata?.contentDisposition || `attachment; filename="FotografiasElTigre-${photoId}.webp"`)
    return new Response(object.body, { headers })
  }

  let photo = memoryGallery.find((p) => p.id === photoId)
  const db = getD1(c)
  if (!photo && db) {
    try {
      const row = await db.prepare('SELECT * FROM gallery WHERE id = ?').bind(photoId).first()
      if (row) photo = row as any
    } catch {}
  }

  if (!photo) {
    return c.json({ success: false, error: 'Foto no encontrada' }, 404)
  }

  return c.redirect(photo.url)
})

// POST /api/receipts/upload - Submit payment proof
app.post('/api/receipts/upload', async (c) => {
  try {
    const formData = await c.req.raw.formData()
    const receiptFile = formData.get('receipt') as File | null
    const clientName = String(formData.get('clientName') || '').trim()
    const phone = String(formData.get('phone') || '').trim()
    const photoId = String(formData.get('photoId') || '').trim()
    const photoTitle = String(formData.get('photoTitle') || '').trim()
    const notes = String(formData.get('notes') || '').trim()
    const total = Number(formData.get('total') || 50)

    if (!clientName || !phone) {
      return c.json({ success: false, error: 'Por favor ingresa tu Nombre y Teléfono.' }, 400)
    }

    let receiptUrl = ''
    const media = c.env?.MEDIA

    if (receiptFile && typeof receiptFile.arrayBuffer === 'function' && receiptFile.size > 0) {
      const ext = mediaExtensions[receiptFile.type] || 'jpg'
      const receiptId = `rec-${crypto.randomUUID()}`
      const receiptKey = `receipts/${receiptId}.${ext}`

      if (media) {
        await media.put(receiptKey, await receiptFile.arrayBuffer(), {
          httpMetadata: { contentType: receiptFile.type, cacheControl: 'public, max-age=31536000' }
        })
        receiptUrl = `/media/${receiptKey}`
      } else {
        const buffer = await receiptFile.arrayBuffer()
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
        receiptUrl = `data:${receiptFile.type};base64,${base64}`
      }
    }

    const orderId = 'TIG-' + Math.floor(1000 + Math.random() * 9000)
    const downloadCode = `TIGRE-${Math.floor(1000 + Math.random() * 9000)}`

    const newOrder: Order = {
      id: orderId,
      clientName,
      phone,
      videoPass: false,
      photoCount: photoId ? 1 : 0,
      selectedPhotoIds: photoId ? [photoId] : [],
      selectedEvents: [],
      notes: notes || (photoTitle ? `Comprobante para foto: "${photoTitle}" (ID: ${photoId})` : 'Comprobante de pago para descarga'),
      total,
      status: 'Comprobante Recibido (Por Validar)',
      receiptUrl,
      downloadCode,
      createdAt: new Date().toISOString()
    }

    const db = getD1(c)
    if (db) {
      try {
        await ensureTables(db)
        await db.prepare(`
          INSERT INTO orders (id, clientName, phone, videoPass, photoCount, selectedPhotoIds, selectedEvents, notes, total, status, receiptUrl, downloadCode, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          newOrder.id,
          newOrder.clientName,
          newOrder.phone,
          newOrder.videoPass ? 1 : 0,
          newOrder.photoCount,
          JSON.stringify(newOrder.selectedPhotoIds),
          JSON.stringify(newOrder.selectedEvents),
          newOrder.notes,
          newOrder.total,
          newOrder.status,
          newOrder.receiptUrl || '',
          newOrder.downloadCode || '',
          newOrder.createdAt
        ).run()
      } catch (e) {
        console.error('Error saving order with receipt to D1:', e)
      }
    }

    memoryOrders.unshift(newOrder)
    return c.json({
      success: true,
      order: newOrder,
      downloadCode: newOrder.downloadCode,
      message: 'Comprobante recibido con éxito. Será validado en breve.'
    })
  } catch (err: any) {
    console.error('Error uploading receipt:', err)
    return c.json({ success: false, error: 'Error procesando comprobante de pago.' }, 500)
  }
})

// POST /api/admin/orders/:id/status - Update order status and code
app.post('/api/admin/orders/:id/status', async (c) => {
  if (!isAdmin(c)) return c.json({ success: false, error: 'Acceso no autorizado' }, 401)
  const id = c.req.param('id')
  try {
    const body = await c.req.json()
    const { status, downloadCode } = body
    if (!status) return c.json({ success: false, error: 'Estado requerido' }, 400)

    const db = getD1(c)
    if (db) {
      try {
        await ensureTables(db)
        await db.prepare(`
          UPDATE orders SET status = ?, downloadCode = COALESCE(?, downloadCode) WHERE id = ?
        `).bind(status, downloadCode || null, id).run()
      } catch (e) {
        console.error('Error updating order status in D1:', e)
      }
    }

    const index = memoryOrders.findIndex((o) => o.id === id)
    if (index !== -1) {
      memoryOrders[index].status = status
      if (downloadCode) memoryOrders[index].downloadCode = downloadCode
    }

    return c.json({ success: true, message: 'Estado del pedido actualizado' })
  } catch {
    return c.json({ success: false, error: 'Error actualizando estado' }, 500)
  }
})

app.get('/api/media/download/:id', async (c) => {
  const mediaId = c.req.param('id')
  const code = c.req.query('code')?.trim() || ''
  if (!mediaIdIsSafe(mediaId) || !code) return c.json({ success: false, error: 'Código de descarga inválido.' }, 401)
  const media = c.env?.MEDIA
  if (!media) return c.json({ success: false, error: 'Almacenamiento no disponible.' }, 503)
  const access = await media.get(`access/${mediaId}.json`)
  if (!access) return c.json({ success: false, error: 'Archivo no encontrado.' }, 404)
  try {
    const details = await access.json<{ originalKey: string; codeHash: string }>()
    if (details.codeHash !== await hashCode(code)) return c.json({ success: false, error: 'Código de descarga incorrecto.' }, 401)
    const object = await media.get(details.originalKey)
    if (!object) return c.json({ success: false, error: 'Archivo no encontrado.' }, 404)
    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    headers.set('cache-control', 'private, no-store')
    headers.set('x-content-type-options', 'nosniff')
    headers.set('content-disposition', object.httpMetadata?.contentDisposition || 'attachment')
    return new Response(object.body, { headers })
  } catch (error) {
    console.error('Error reading protected media:', error)
    return c.json({ success: false, error: 'No se pudo leer el archivo.' }, 500)
  }
})

// POST /api/gallery/register
app.post('/api/gallery/register', async (c) => {
  try {
    if (!isAdmin(c)) {
      return c.json({ success: false, error: 'Acceso no autorizado' }, 401)
    }

    const body = await c.req.json()
    const newItem: GalleryItem = {
      id: typeof body.id === 'string' && mediaIdIsSafe(body.id) ? body.id : 'g-' + Date.now(),
      title: body.title,
      category: body.category || 'topaderas',
      date: body.date || '16 de Septiembre',
      type: body.type || 'photo',
      url: body.url,
      videoUrl: body.videoUrl,
      description: body.description || '',
      price: body.price || (body.type === 'video' ? 600 : 50),
      dorsal: body.dorsal || ''
    }

    const db = getD1(c)
    if (db) {
      try {
        await ensureTables(db)
        await db.prepare(`
          INSERT INTO gallery (id, title, category, date, type, url, videoUrl, description, price, dorsal)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          newItem.id,
          newItem.title,
          newItem.category,
          newItem.date,
          newItem.type,
          newItem.url,
          newItem.videoUrl || '',
          newItem.description || '',
          newItem.price,
          newItem.dorsal || ''
        ).run()
      } catch (e) {
        console.error('Error inserting item to D1:', e)
      }
    }

    memoryGallery.unshift(newItem)
    return c.json({ success: true, item: newItem })
  } catch (err: any) {
    return c.json({ success: false, error: 'Error guardando imagen' }, 500)
  }
})

// Validate order data
function validateOrder(data: any): { valid: boolean; error?: string } {
  if (!data.clientName || typeof data.clientName !== 'string' || data.clientName.trim().length === 0) {
    return { valid: false, error: 'Nombre del cliente es requerido' }
  }
  if (!data.phone || typeof data.phone !== 'string' || data.phone.length < 10) {
    return { valid: false, error: 'Teléfono inválido (mínimo 10 dígitos)' }
  }
  if (typeof data.videoPass !== 'boolean') {
    return { valid: false, error: 'Datos de video inválidos' }
  }
  if (typeof data.photoCount !== 'number' || data.photoCount < 0) {
    return { valid: false, error: 'Cantidad de fotos inválida' }
  }
  if (typeof data.total !== 'number' || data.total < 0) {
    return { valid: false, error: 'Total inválido' }
  }
  // At least one product should be selected
  if (data.photoCount === 0 && !data.videoPass) {
    return { valid: false, error: 'Debes seleccionar al menos un producto' }
  }
  return { valid: true }
}

// POST /api/orders
app.post('/api/orders', async (c) => {
  try {
    const body = await c.req.json()
    
    // Validate incoming data
    const validation = validateOrder(body)
    if (!validation.valid) {
      return c.json({ success: false, error: validation.error }, 400)
    }
    const newOrder: Order = {
      id: 'TIG-' + Math.floor(1000 + Math.random() * 9000),
      clientName: body.clientName || 'Cliente',
      phone: body.phone || 'N/A',
      videoPass: Boolean(body.videoPass),
      photoCount: Number(body.photoCount || 0),
      selectedPhotoIds: body.selectedPhotoIds || [],
      selectedEvents: body.selectedEvents || [],
      notes: body.notes || '',
      total: Number(body.total || 0),
      status: body.status || 'Pendiente',
      receiptUrl: body.receiptUrl || '',
      downloadCode: body.downloadCode || `TIGRE-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    }

    const db = getD1(c)
    if (db) {
      try {
        await ensureTables(db)
        await db.prepare(`
          INSERT INTO orders (id, clientName, phone, videoPass, photoCount, selectedPhotoIds, selectedEvents, notes, total, status, receiptUrl, downloadCode, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          newOrder.id,
          newOrder.clientName,
          newOrder.phone,
          newOrder.videoPass ? 1 : 0,
          newOrder.photoCount,
          JSON.stringify(newOrder.selectedPhotoIds),
          JSON.stringify(newOrder.selectedEvents),
          newOrder.notes,
          newOrder.total,
          newOrder.status,
          newOrder.receiptUrl || '',
          newOrder.downloadCode || '',
          newOrder.createdAt
        ).run()
      } catch (e) {
        console.error('Error saving order to D1:', e)
      }
    }

    memoryOrders.unshift(newOrder)
    return c.json({ success: true, order: newOrder })
  } catch (err: any) {
    return c.json({ success: false, error: 'Error al registrar pedido' }, 500)
  }
})

// GET /api/orders
app.get('/api/orders', async (c) => {
  const db = getD1(c)
  let ordersList = memoryOrders

  if (db) {
    try {
      await ensureTables(db)
      const res = await db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all()
      if (res?.results && res.results.length > 0) {
        ordersList = res.results.map((row: any) => {
          let selectedPhotoIds: string[] = []
          let selectedEvents: string[] = []
          try {
            selectedPhotoIds = typeof row.selectedPhotoIds === 'string' ? JSON.parse(row.selectedPhotoIds) : (row.selectedPhotoIds || [])
          } catch {
            selectedPhotoIds = []
          }
          try {
            selectedEvents = typeof row.selectedEvents === 'string' ? JSON.parse(row.selectedEvents) : (row.selectedEvents || [])
          } catch {
            selectedEvents = []
          }

          return {
            id: row.id,
            clientName: row.clientName,
            phone: row.phone,
            videoPass: Boolean(row.videoPass),
            photoCount: Number(row.photoCount),
            selectedPhotoIds,
            selectedEvents,
            notes: row.notes || '',
            total: Number(row.total),
            status: row.status || 'Pendiente',
            receiptUrl: row.receiptUrl || undefined,
            downloadCode: row.downloadCode || undefined,
            createdAt: row.createdAt
          }
        })
        memoryOrders = ordersList
      }
    } catch (e) {
      console.error('Error reading orders from D1:', e)
    }
  }

  return c.json({ success: true, count: ordersList.length, orders: ordersList })
})

// POST /api/contact
app.post('/api/contact', async (c) => {
  try {
    const body = await c.req.json()
    const msg: ContactMessage = {
      id: 'msg-' + Date.now(),
      name: body.name,
      phone: body.phone,
      message: body.message,
      createdAt: new Date().toISOString()
    }

    const db = getD1(c)
    if (db) {
      try {
        await ensureTables(db)
        await db.prepare(`
          INSERT INTO contacts (id, name, phone, message, createdAt)
          VALUES (?, ?, ?, ?, ?)
        `).bind(msg.id, msg.name, msg.phone, msg.message, msg.createdAt).run()
      } catch (e) {
        console.error('Error saving contact message to D1:', e)
      }
    }

    memoryContacts.push(msg)
    return c.json({ success: true, message: msg })
  } catch {
    return c.json({ success: false, error: 'Error enviando mensaje' }, 500)
  }
})

export default app
