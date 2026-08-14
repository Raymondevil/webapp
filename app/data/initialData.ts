import type { GalleryItem, EventItem, Order } from '../types'

export const officialEvents: EventItem[] = [
  {
    id: 'e1',
    date: '10 de Septiembre',
    title: 'Entrada de la Música y Desfile de Antorchas',
    description: 'Gran arranque festivo por las principales calles de San Pedro Lagunillas con bandas en vivo y desfile nocturno.',
    tag: 'Apertura',
    badge: 'Cobertura en Foto y Video'
  },
  {
    id: 'e2',
    date: '11 de Septiembre',
    title: 'Inauguración Oficial y Primer Baile',
    description: 'Corte de listón, ambientación folclórica y baile popular en la plaza principal.',
    tag: 'Tradición',
    badge: 'Cobertura Completa'
  },
  {
    id: 'e3',
    date: '12 de Septiembre',
    title: 'Regatas y Eventos en la Laguna de San Pedro',
    description: 'Espectáculo acuático, deportistas locales, puestos gastronómicos e itinerario familiar.',
    tag: 'Laguna',
    badge: 'Fotos HD Disponibles'
  },
  {
    id: 'e4',
    date: '13 de Septiembre',
    title: 'Homenaje a los Niños Héroes y Cabalgata',
    description: 'Acto cívico con autoridades y la tradicional cabalgata de jinetes por el pueblo.',
    tag: 'Cabalgata',
    badge: 'Video y Fotos Personalizadas'
  },
  {
    id: 'e5',
    date: '14 de Septiembre',
    title: 'Día del Charro y Coleadero Tradicional',
    description: 'Destreza charra en el Lienzo Charro, suertes de soga y ambiente 100% Nayarita.',
    tag: 'Charrería',
    badge: 'Captura de Acción HD'
  },
  {
    id: 'e6',
    date: '15 de Septiembre',
    title: 'Coronación de la Reina, Noche Mexicana y Grito',
    description: 'Magna fiesta mexicana, fuegos artificiales, castillo, música de mariachi y la emoción del Grito de Independencia.',
    tag: 'Noche Gala',
    badge: 'Imperdible - Video $600'
  },
  {
    id: 'e7',
    date: '16 de Septiembre',
    title: 'Desfile Cívico y Primera Gran Topadera',
    description: 'Desfile escolar y charro por la mañana; por la tarde, la esperada y brava Topadera con toros de renombre.',
    tag: 'Topadera',
    badge: 'Tomas Clave e Impactantes'
  },
  {
    id: 'e8',
    date: '17 de Septiembre',
    title: 'Jaripeo de Gala y Baile Estelar',
    description: 'Montas de alto riesgo, cuadrillas de jineteo y gran baile nocturno con agrupación estelar.',
    tag: 'Jaripeo',
    badge: 'Acción Lenta y Foto $50'
  },
  {
    id: 'e9',
    date: 'Última Topadera',
    title: 'La Tradicional Gran Topadera de Cierre',
    description: 'El broche de oro de las Fiestas Patrias. Valentía en la maza, torazos y la despedida del pueblo unido.',
    tag: 'Cierre',
    badge: 'Incluido en Paquete $600'
  }
]

export const initialGallery: GalleryItem[] = [
  {
    id: 'g-test-2',
    title: 'Desfile y Abanderado con la Bandera del Tigre (Dorsal #15)',
    category: 'desfiles',
    date: '15 de Septiembre',
    type: 'photo',
    url: '/static/photos/sample_foto_2.webp',
    description: 'Jóvenes y participantes ondeando con orgullo la bandera de "El Tigre" durante el recorrido por San Pedro Lagunillas.',
    price: 30,
    dorsal: '15'
  },
  {
    id: 'g-test-3',
    title: 'Contingente con Bandera Roja de El Tigre (Dorsal #22)',
    category: 'desfiles',
    date: '15 de Septiembre',
    type: 'photo',
    url: '/static/photos/sample_foto_3.webp',
    description: 'Entusiasmo y tradición mexicana en el desfile de las Fiestas Patrias con los colores de El Tigre.',
    price: 30,
    dorsal: '22'
  },
  {
    id: 'g-test-4',
    title: 'Fotografía Nocturna - Asistente en Chamarra Negra (Dorsal #50)',
    category: 'bailes',
    date: '16 de Septiembre',
    type: 'photo',
    url: '/static/photos/sample_foto_4.webp',
    description: 'Retrato nocturno capturado durante la ambientación de los eventos y bailes de las Fiestas Patrias.',
    price: 30,
    dorsal: '50'
  },
  {
    id: 'g1',
    title: 'La Gran Topadera - Toro de Remnombre (Dorsal #12)',
    category: 'topaderas',
    date: '16 de Septiembre',
    type: 'photo',
    url: '/static/photos/h17final25.webp',
    description: 'Captura congelada a alta velocidad en el momento de mayor adrenalina en el ruedo. Jinete con dorsal #12.',
    price: 30,
    dorsal: '12'
  },
  {
    id: 'g-test-1',
    title: 'Fotografía de Prueba / Asistente Fiestas Patrias (Dorsal #88)',
    category: 'desfiles',
    date: '15 de Septiembre',
    type: 'photo',
    url: '/static/photos/sample_foto_1.webp',
    description: 'Retrato de prueba capturado durante la cobertura de las Fiestas Patrias en San Pedro Lagunillas, Nayarit.',
    price: 30,
    dorsal: '88'
  },
  {
    id: 'g2',
    title: 'Cabalgata Charra en las Calles (Dorsal #45)',
    category: 'cabalgatas',
    date: '14 de Septiembre',
    type: 'photo',
    url: '/static/photos/h18final249.webp',
    description: 'Jinetes con atuendo tradicional saludando al pueblo de San Pedro Lagunillas. Participante #45.',
    price: 30,
    dorsal: '45'
  },
  {
    id: 'g3',
    title: 'Castillo y Fuegos Artificiales - Noche del Grito',
    category: 'grito',
    date: '15 de Septiembre',
    type: 'photo',
    url: '/static/photos/h18final249.webp',
    description: 'Luces multicolores iluminando el cielo y la plaza cívica en la noche patria.',
    price: 50,
    dorsal: 'Grito2026'
  },
  {
    id: 'g4',
    title: 'Monta Estelar en Jaripeo Ranchero (Dorsal #08)',
    category: 'topaderas',
    date: '17 de Septiembre',
    type: 'photo',
    url: '/static/photos/h18final266.webp',
    description: 'El coraje del jinete cara a cara contra el toro en la plaza de San Pedro. Jinete #08.',
    price: 50,
    dorsal: '08'
  },
  {
    id: 'g5',
    title: 'Desfile de Antorchas Nocturno (Dorsal #101)',
    category: 'desfiles',
    date: '10 de Septiembre',
    type: 'photo',
    url: '/static/photos/v18final194.webp',
    description: 'El brillo del fuego y la algarabía en la noche de apertura de festejos. Contingente #101.',
    price: 50,
    dorsal: '101'
  },
  {
    id: 'g6',
    title: 'Vestidos Típicos y Reinas de la Fiesta',
    category: 'grito',
    date: '15 de Septiembre',
    type: 'photo',
    url: '/static/photos/grito25final616.webp',
    description: 'Elegancia, bordados tradicionales y sonrisas en la velada patria.',
    price: 50,
    dorsal: 'Reinas'
  },
  {
    id: 'g7',
    title: 'Banda en Vivo y Gran Baile Popular',
    category: 'bailes',
    date: '17 de Septiembre',
    type: 'photo',
    url: '/static/photos/grito25final759.webp',
    description: 'La música retumbando en el baile popular con ambiente festivo inolvidable.',
    price: 50,
    dorsal: 'Baile'
  },
  {
    id: 'v1',
    title: 'Video Vista Previa: Gran Topadera de Cierre',
    category: 'videos',
    date: 'Última Topadera',
    type: 'video',
    url: '/static/video/vueno.mp4',
    videoUrl: '/static/video/vueno.mp4',
    description: 'Fragmento de la toma de acción en el ruedo. Incluido en el Paquete Completo de $600 MXN.',
    price: 600,
    dorsal: 'VideoPass'
  },
  {
    id: 'v2',
    title: 'Video Vista Previa: Noche del Grito y Pirotecnia',
    category: 'videos',
    date: '15 de Septiembre',
    type: 'video',
    url: '/static/photos/h18final249.webp',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fireworks-in-the-sky-4144-large.mp4',
    description: 'Captura aérea en video del castillo y fuegos de la noche mexicana. Incluido en Paquete $600.',
    price: 600,
    dorsal: 'VideoPass'
  },
  {
    id: 'v3',
    title: 'Video Vista Previa: Baile Popular y Celebración',
    category: 'videos',
    date: '17 de Septiembre',
    type: 'video',
    url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    videoUrl: '/static/video/vueno.mp4',
    description: 'Ambiente en vivo del baile popular en la plaza. Incluido en Paquete $600.',
    price: 600,
    dorsal: 'VideoPass'
  }
]

export const initialOrders: Order[] = [
  {
    id: 'TIG-1001',
    clientName: 'Don José Ramos',
    phone: '3111234567',
    videoPass: true,
    photoCount: 4,
    selectedEvents: ['Topaderas y Jaripeos', 'Noche del Grito'],
    notes: 'Busco las fotos de la cabalgata del 14 a caballo bayo (Dorsal #45)',
    total: 800,
    status: 'Pagado (Mercado Pago)',
    paymentMethod: 'Mercado Pago',
    paymentStatus: 'Aprobado',
    createdAt: new Date().toISOString()
  }
]
