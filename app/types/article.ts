export interface MediaFormat {
  ext: string
  url: string
  hash: string
  mime: string
  name: string
  path: string | null
  size: number
  width: number
  height: number
  sizeInBytes: number
}

export interface Media {
  id: number
  documentId: string
  name: string
  alternativeText: string | null
  caption: string | null
  width: number | null
  height: number | null
  formats: {
    large?: MediaFormat
    medium?: MediaFormat
    small?: MediaFormat
    thumbnail?: MediaFormat
  } | null
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl: string | null
  provider: string
  provider_metadata: any | null
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface Category {
  id: number
  documentId: string
  name: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface Article {
  id: number
  documentId: string
  title: string
  slug: string
  description: string | null
  content: string
  date: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  cover: Media | null
  categories: Category[] | null
  gallery: Media[] | null
  videos: Media[] | null
  audios: Media[] | null
}
