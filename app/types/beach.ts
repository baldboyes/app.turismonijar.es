export interface Beach {
  id: number | string
  title: string
  state: string
  lat: number
  lng: number
  url?: string
  src?: string
  bandera?: string
  iconUrl?: string
  description?: string
  localizacion?: string
  contacto?: string
  informacion?: string
  accesibilidad?: string
  caracteristicas?: string
  ocupacion?: {
    state: string
  }
}

