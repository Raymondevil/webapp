import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { officialEvents, initialGallery, initialOrders } from '../data/initialData'
import type { GalleryItem, Order, ContactMessage } from '../types'

type Bindings = {
  DB?: any
}

export const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// In-memory data fallback
let memoryGallery: GalleryItem[] = [...initialGallery]
let memoryOrders: Order[] = [...initialOrders]
let memoryContacts: ContactMessage[] = []

// GET /api/events
app.get('/api/events', (c) => {
  return c.json({ success: true, events: officialEvents })
})

// GET /api/gallery
app.get('/api/gallery', (c) => {
  const category = c.req.query('category') || 'all'
  const search = c.req.query('search') || ''
  const dorsal = c.req.query('dorsal') || ''

  let result = memoryGallery

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
app.get('/api/gallery/:id', (c) => {
  const id = c.req.param('id')
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
    // Default password check
    if (password === 'eltigre2026' || password === 'admin' || password === 'admin123') {
      return c.json({ success: true, token: 'admin-secret-token-eltigre' })
    }
    return c.json({ success: false, error: 'Contraseña incorrecta' }, 401)
  } catch {
    return c.json({ success: false, error: 'Datos inválidos' }, 400)
  }
})

// POST /api/gallery/register
app.post('/api/gallery/register', async (c) => {
  try {
    const body = await c.req.json()
    const newItem: GalleryItem = {
      id: 'g-' + Date.now(),
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

    memoryGallery.unshift(newItem)
    return c.json({ success: true, item: newItem })
  } catch (err: any) {
    return c.json({ success: false, error: 'Error guardando imagen' }, 500)
  }
})

// POST /api/orders
app.post('/api/orders', async (c) => {
  try {
    const body = await c.req.json()
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
      status: 'Pendiente',
      createdAt: new Date().toISOString()
    }

    memoryOrders.unshift(newOrder)
    return c.json({ success: true, order: newOrder })
  } catch (err: any) {
    return c.json({ success: false, error: 'Error al registrar pedido' }, 500)
  }
})

// GET /api/orders
app.get('/api/orders', (c) => {
  return c.json({ success: true, count: memoryOrders.length, orders: memoryOrders })
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
    memoryContacts.push(msg)
    return c.json({ success: true, message: msg })
  } catch {
    return c.json({ success: false, error: 'Error enviando mensaje' }, 500)
  }
})

export default app
