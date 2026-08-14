export interface GalleryItem {
  id: string
  title: string
  category: string
  date: string
  type: 'photo' | 'video'
  url: string
  videoUrl?: string
  description: string
  price: number
  dorsal?: string
  highResUrl?: string
}

export interface EventItem {
  id: string
  date: string
  title: string
  description: string
  badge: string
  tag: string
}

export interface Order {
  id: string
  clientName: string
  phone: string
  videoPass: boolean
  photoCount: number
  selectedPhotoIds?: string[]
  selectedEvents: string[]
  notes: string
  total: number
  status: 'pending' | 'paid' | 'delivered' | 'completed' | string
  paymentMethod?: string
  paymentStatus?: string
  createdAt: string
}

export interface ContactMessage {
  id: string
  name: string
  phone: string
  message: string
  createdAt: string
}

export interface SelectedPhotoFormat {
  photoId: string
  format: 'digital' | 'fisica' | 'marco'
}
