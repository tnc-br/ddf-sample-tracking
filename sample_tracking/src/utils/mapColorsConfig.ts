// Utilitário para gerenciar as configurações de cores do mapa
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@services/firebase/config'

export const DEFAULT_MAP_COLORS = {
  high: '#22c55e', // Verde (≥95%)
  medium: '#eab308', // Amarelo (6-94%)
  low: '#ef4444', // Vermelho (<6%)
}

export const DEFAULT_MAP_RADIUS = 100 // km

export interface MapColorsConfig {
  high: string // ≥95%
  medium: string // 6-94%
  low: string // <6%
}

export interface MapConfig {
  colors: MapColorsConfig
  radius: number // Raio em km
}

/**
 * Obtém as cores do mapa salvas no localStorage
 * @returns MapColorsConfig com as cores personalizadas ou padrão
 */
export const getMapColorsFromStorage = (): MapColorsConfig => {
  if (typeof window === 'undefined') {
    return DEFAULT_MAP_COLORS
  }

  try {
    const savedColors = localStorage.getItem('timberid-map-colors')
    if (savedColors) {
      return JSON.parse(savedColors)
    }
  } catch (error) {
    console.error('Erro ao carregar cores do mapa:', error)
  }

  return DEFAULT_MAP_COLORS
}

/**
 * Salva as cores do mapa no localStorage
 * @param colors - Configuração de cores para salvar
 */
export const saveMapColorsToStorage = (colors: MapColorsConfig): void => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem('timberid-map-colors', JSON.stringify(colors))
  } catch (error) {
    console.error('Erro ao salvar cores do mapa:', error)
  }
}

/**
 * Obtém a cor baseada na probabilidade
 * @param probability - Valor da probabilidade (0-100)
 * @returns string - Cor hex correspondente à probabilidade
 */
export const getColorByProbability = (probability: number): string => {
  const colors = getMapColorsFromStorage()

  if (probability >= 95) {
    return colors.high
  } else if (probability >= 6) {
    return colors.medium
  } else {
    return colors.low
  }
}

/**
 * Carrega as cores do mapa do Firestore (organização do usuário)
 * @param orgId - ID da organização
 * @returns MapColorsConfig das configurações da organização ou padrão
 */
export const getMapColorsFromFirestore = async (
  orgId: string,
): Promise<MapColorsConfig> => {
  if (!orgId) {
    return DEFAULT_MAP_COLORS
  }

  try {
    const orgDoc = await getDoc(doc(db, 'organizations', orgId))

    if (orgDoc.exists()) {
      const orgData = orgDoc.data()
      const mapColors = orgData.mapColors

      if (mapColors && mapColors.high && mapColors.medium && mapColors.low) {
        return mapColors
      }
    }
  } catch (error) {
    console.error('Erro ao carregar cores do Firestore:', error)
  }

  return DEFAULT_MAP_COLORS
}

/**
 * Salva as cores do mapa no Firestore (organização do usuário)
 * @param orgId - ID da organização
 * @param colors - Configuração de cores para salvar
 */
export const saveMapColorsToFirestore = async (
  orgId: string,
  colors: MapColorsConfig,
): Promise<void> => {
  if (!orgId) {
    throw new Error('Organization ID is required to save map colors')
  }

  try {
    const orgRef = doc(db, 'organizations', orgId)
    await updateDoc(orgRef, {
      mapColors: colors,
      mapColorsUpdatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erro ao salvar cores no Firestore:', error)
    throw error
  }
}

/**
 * Carrega a configuração completa do mapa do Firestore (organização do usuário)
 * @param orgId - ID da organização
 * @returns MapConfig das configurações da organização ou padrão
 */
export const getMapConfigFromFirestore = async (
  orgId: string,
): Promise<MapConfig> => {
  if (!orgId) {
    return {
      colors: DEFAULT_MAP_COLORS,
      radius: DEFAULT_MAP_RADIUS,
    }
  }

  try {
    const orgDoc = await getDoc(doc(db, 'organizations', orgId))

    if (orgDoc.exists()) {
      const orgData = orgDoc.data()
      const mapColors = orgData.mapColors
      const mapRadius = orgData.mapRadius

      return {
        colors:
          mapColors && mapColors.high && mapColors.medium && mapColors.low
            ? mapColors
            : DEFAULT_MAP_COLORS,
        radius:
          typeof mapRadius === 'number' && mapRadius >= 10 && mapRadius <= 1000
            ? mapRadius
            : DEFAULT_MAP_RADIUS,
      }
    }
  } catch (error) {
    console.error('Erro ao carregar configuração do mapa do Firestore:', error)
  }

  return {
    colors: DEFAULT_MAP_COLORS,
    radius: DEFAULT_MAP_RADIUS,
  }
}

/**
 * Salva a configuração completa do mapa no Firestore (organização do usuário)
 * @param orgId - ID da organização
 * @param config - Configuração completa do mapa para salvar
 */
export const saveMapConfigToFirestore = async (
  orgId: string,
  config: MapConfig,
): Promise<void> => {
  if (!orgId) {
    throw new Error('Organization ID is required to save map config')
  }

  // Validar raio
  if (config.radius < 10 || config.radius > 1000) {
    throw new Error('Map radius must be between 10 and 1000 km')
  }

  try {
    const orgRef = doc(db, 'organizations', orgId)
    await updateDoc(orgRef, {
      mapColors: config.colors,
      mapRadius: config.radius,
      mapConfigUpdatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erro ao salvar configuração do mapa no Firestore:', error)
    throw error
  }
}

/**
 * Obtém as configurações de cores formatadas para APIs
 * @returns Objeto com configurações prontas para envio ao backend
 */
export const getMapColorsForAPI = () => {
  const colors = getMapColorsFromStorage()

  return {
    highProbability: {
      color: colors.high,
      threshold: 95,
      label: 'Alta Probabilidade (≥95%)',
    },
    mediumProbability: {
      color: colors.medium,
      threshold: 6,
      label: 'Média Probabilidade (6-94%)',
    },
    lowProbability: {
      color: colors.low,
      threshold: 0,
      label: 'Baixa Probabilidade (<6%)',
    },
  }
}

/**
 * Calcula os limites do mapa baseado na posição central e raio
 * @param centerLat - Latitude central
 * @param centerLon - Longitude central
 * @param radiusKm - Raio em quilômetros
 * @returns Objeto com limites norte, sul, leste, oeste
 */
export const calculateMapBounds = (
  centerLat: number,
  centerLon: number,
  radiusKm: number,
) => {
  // Aproximação: 1 grau de latitude ≈ 111 km
  // 1 grau de longitude varia com a latitude
  const latDegreeKm = 111
  const lonDegreeKm = 111 * Math.cos((centerLat * Math.PI) / 180)

  const latOffset = radiusKm / latDegreeKm
  const lonOffset = radiusKm / lonDegreeKm

  return {
    north: centerLat + latOffset,
    south: centerLat - latOffset,
    east: centerLon + lonOffset,
    west: centerLon - lonOffset,
    center: { lat: centerLat, lon: centerLon },
    radius: radiusKm,
  }
}
