import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { officialEvents, initialGallery, initialOrders } from '../data/initialData'
import type { GalleryItem, Order, ContactMessage } from '../types'

type Bindings = {
  serve?: any
  DB?: any
}

export const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// In-memory data fallback
let memoryGallery: GalleryItem[] = [...initialGallery]
let memoryOrders: Order[] = [...initialOrders]
let memoryContacts: ContactMessage[] = []

// D1 Helper utilities
function getD1(c: any) {
  return c.env?.serve || c.env?.DB || null
}

async function ensureTables(db: any) {
  if (!db) return
  try {
    await db.exec(`
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
      );

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
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        message TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
    `)

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

    const db = getD1(c)
    if (db) {
      try {
        await ensureTables(db)
        await db.prepare(`
          INSERT INTO orders (id, clientName, phone, videoPass, photoCount, selectedPhotoIds, selectedEvents, notes, total, status, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        ordersList = res.results.map((row: any) => ({
          id: row.id,
          clientName: row.clientName,
          phone: row.phone,
          videoPass: Boolean(row.videoPass),
          photoCount: Number(row.photoCount),
          selectedPhotoIds: JSON.parse(row.selectedPhotoIds || '[]'),
          selectedEvents: JSON.parse(row.selectedEvents || '[]'),
          notes: row.notes || '',
          total: Number(row.total),
          status: row.status || 'Pendiente',
          createdAt: row.createdAt
        }))
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

