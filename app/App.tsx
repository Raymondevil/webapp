import React, { useState, useEffect } from 'react'
import axios from 'axios'

import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { VideoBanner } from './components/VideoBanner'
import { PricingSection } from './components/PricingSection'
import { EventsProgram } from './components/EventsProgram'
import { GallerySection } from './components/GallerySection'
import { OrderCalculator } from './components/OrderCalculator'
import { CheckboxSelectionPage } from './components/CheckboxSelectionPage'
import { LightboxModal } from './components/LightboxModal'
import { AdminSection } from './components/AdminSection'
import { ContactSection } from './components/ContactSection'
import { Footer } from './components/Footer'

import type { GalleryItem, EventItem, Order } from './types'
import { officialEvents, initialGallery, initialOrders } from './data/initialData'

export function App() {
  const [activeTab, setActiveTab] = useState<'main' | 'seleccionar' | 'admin'>('main')
  const [events, setEvents] = useState<EventItem[]>(officialEvents)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialGallery)
  const [orders, setOrders] = useState<Order[]>(initialOrders)

  // Order & Cart State
  const [selectedPhotos, setSelectedPhotos] = useState<GalleryItem[]>([])
  const [selectedPhotoMap, setSelectedPhotoMap] = useState<Map<string, 'digital' | 'fisica' | 'marco'>>(new Map())
  const [videoPass, setVideoPass] = useState<boolean>(false)

  // Modal State
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryItem | null>(null)

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Load API data on mount
  const loadData = async () => {
    try {
      const [eventsRes, galleryRes, ordersRes] = await Promise.all([
        axios.get('/api/events').catch((err) => {
          console.error('Error loading events:', err.message)
          return null
        }),
        axios.get('/api/gallery').catch((err) => {
          console.error('Error loading gallery:', err.message)
          return null
        }),
        axios.get('/api/orders').catch((err) => {
          console.error('Error loading orders:', err.message)
          return null
        })
      ])

      if (eventsRes?.data?.events) {
        setEvents(eventsRes.data.events)
      }
      if (galleryRes?.data?.gallery) {
        setGalleryItems(galleryRes.data.gallery)
      }
      if (ordersRes?.data?.orders) {
        setOrders(ordersRes.data.orders)
      }
    } catch (err) {
      console.error('Critical error loading data:', err)
      showToast('⚠️ Error cargando datos. Usando datos almacenados.')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Sync selectedPhotos whenever selectedPhotoMap changes
  useEffect(() => {
    const keys = Array.from(selectedPhotoMap.keys())
    const items = galleryItems.filter((item) => keys.includes(item.id))
    setSelectedPhotos(items)
  }, [selectedPhotoMap, galleryItems])

  // Handlers
  const handleAddPhotoToOrder = (photo: GalleryItem) => {
    if (!selectedPhotoMap.has(photo.id)) {
      const nextMap = new Map(selectedPhotoMap)
      nextMap.set(photo.id, 'digital')
      setSelectedPhotoMap(nextMap)
      showToast(`¡Foto "${photo.title}" agregada a tu pedido!`)
    } else {
      showToast(`La foto "${photo.title}" ya está en tu pedido.`)
    }
  }

  const handleSelectEventInForm = (eventTitle: string) => {
    setActiveTab('main')
    const cotizador = document.getElementById('cotizador')
    if (cotizador) {
      cotizador.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleOrderSubmitted = (orderId: string) => {
    showToast(`¡Pedido #${orderId} registrado correctamente!`)
    loadData()
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-950/20 text-slate-100 font-sans antialiased">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 bg-amber-500 text-slate-950 font-extrabold px-5 py-3 rounded-2xl shadow-2xl border border-amber-300 animate-bounce flex items-center gap-2 text-xs">
          <i className="fa-solid fa-circle-check text-base"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedPhotoCount={selectedPhotoMap.size}
      />

      {/* MAIN CONTENT BASED ON ACTIVE TAB */}
      <main className="flex-grow">
        {activeTab === 'main' && (
          <>
            <Hero
              onOpenCotizador={() => {
                const el = document.getElementById('cotizador')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              onOpenGaleria={() => {
                const el = document.getElementById('galeria')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              onOpenSeleccionar={() => setActiveTab('seleccionar')}
              onOpenVideo={() => {
                const el = document.getElementById('video-trailer')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
            />

            {/* DEDICATED VIDEO BANNER & PLAYER */}
            <VideoBanner
              onSelectVideoPass={() => setVideoPass(true)}
              onOpenCotizador={() => {
                const el = document.getElementById('cotizador')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
            />

            <PricingSection
              onOpenCotizador={() => {
                const el = document.getElementById('cotizador')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              onOpenSeleccionar={() => setActiveTab('seleccionar')}
            />

            <EventsProgram events={events} onSelectEvent={handleSelectEventInForm} />

            <GallerySection
              galleryItems={galleryItems}
              onOpenLightbox={(item) => setLightboxPhoto(item)}
              onAddPhotoToOrder={handleAddPhotoToOrder}
              onOpenSeleccionar={() => setActiveTab('seleccionar')}
            />

            <OrderCalculator
              events={events}
              selectedPhotos={selectedPhotos}
              videoPass={videoPass}
              setVideoPass={setVideoPass}
              onOrderSubmitted={handleOrderSubmitted}
            />

            <ContactSection />
          </>
        )}

        {activeTab === 'seleccionar' && (
          <CheckboxSelectionPage
            galleryItems={galleryItems}
            selectedPhotoMap={selectedPhotoMap}
            setSelectedPhotoMap={setSelectedPhotoMap}
            videoPass={videoPass}
            setVideoPass={setVideoPass}
            onGoToOrder={() => setActiveTab('main')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminSection
            galleryItems={galleryItems}
            orders={orders}
            onRefreshData={loadData}
          />
        )}
      </main>

      {/* LIGHTBOX MODAL */}
      <LightboxModal
        photo={lightboxPhoto}
        onClose={() => setLightboxPhoto(null)}
        onAddPhotoToOrder={handleAddPhotoToOrder}
      />

      {/* FOOTER */}
      <Footer />
    </div>
  )
}

export default App
