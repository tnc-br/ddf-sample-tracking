// Exemplo de uso da configuração de raio do mapa no backend
// Este arquivo demonstra como usar o raio personalizado para gerar mapas focalizados

import {
  getMapConfigFromFirestore,
  calculateMapBounds,
} from '@utils/mapColorsConfig'

/**
 * Gera dados do mapa focalizados baseado na posição da amostra e raio da organização
 * @param sampleData - Dados da amostra incluindo lat/lon
 * @param orgId - ID da organização
 * @returns Dados do mapa com área focada
 */
export const generateFocusedMapData = async (
  sampleData: any,
  orgId: string,
) => {
  // Obter configurações da organização
  const mapConfig = await getMapConfigFromFirestore(orgId)

  // Validar coordenadas da amostra
  if (!sampleData.lat || !sampleData.lon) {
    throw new Error('Sample coordinates are required')
  }

  const sampleLat = parseFloat(sampleData.lat)
  const sampleLon = parseFloat(sampleData.lon)

  if (isNaN(sampleLat) || isNaN(sampleLon)) {
    throw new Error('Invalid sample coordinates')
  }

  // Calcular limites do mapa baseado no raio
  const bounds = calculateMapBounds(sampleLat, sampleLon, mapConfig.radius)

  // Simular dados de probabilidade dentro da área
  const probabilityData = generateProbabilityDataInBounds(
    bounds,
    mapConfig.colors,
  )

  return {
    mapData: {
      center: bounds.center,
      bounds: bounds,
      radius: mapConfig.radius,
      probabilityPoints: probabilityData,
      samplePosition: { lat: sampleLat, lon: sampleLon },
    },
    legend: {
      high: {
        color: mapConfig.colors.high,
        label: 'Alta Probabilidade (≥95%)',
      },
      medium: {
        color: mapConfig.colors.medium,
        label: 'Média Probabilidade (6-94%)',
      },
      low: { color: mapConfig.colors.low, label: 'Baixa Probabilidade (<6%)' },
    },
    organizationId: orgId,
    sampleId: sampleData.id,
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Gera pontos de probabilidade dentro dos limites calculados
 * @param bounds - Limites do mapa
 * @param colors - Configuração de cores
 * @returns Array de pontos com probabilidade e cor
 */
const generateProbabilityDataInBounds = (bounds: any, colors: any) => {
  const points = []
  const gridSize = 0.01 // Resolução da grade (aprox. 1km)

  // Gerar grade de pontos dentro dos limites
  for (let lat = bounds.south; lat <= bounds.north; lat += gridSize) {
    for (let lon = bounds.west; lon <= bounds.east; lon += gridSize) {
      // Calcular distância do centro para simular probabilidade
      const distance = calculateDistance(
        bounds.center.lat,
        bounds.center.lon,
        lat,
        lon,
      )

      // Simular probabilidade baseada na distância (mais próximo = maior probabilidade)
      const maxDistance = bounds.radius
      const probability = Math.max(0, 100 - (distance / maxDistance) * 100)

      // Adicionar alguma variação aleatória
      const adjustedProbability = Math.max(
        0,
        Math.min(100, probability + (Math.random() - 0.5) * 40),
      )

      // Determinar cor baseada na probabilidade
      let color = colors.low
      if (adjustedProbability >= 95) {
        color = colors.high
      } else if (adjustedProbability >= 6) {
        color = colors.medium
      }

      points.push({
        lat,
        lon,
        probability: Math.round(adjustedProbability * 100) / 100,
        color,
        distanceFromSample: Math.round(distance * 100) / 100,
      })
    }
  }

  return points
}

/**
 * Calcula distância em km entre dois pontos usando fórmula de Haversine
 * @param lat1, lon1 - Primeiro ponto
 * @param lat2, lon2 - Segundo ponto
 * @returns Distância em quilômetros
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371 // Raio da Terra em km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const toRad = (deg: number): number => deg * (Math.PI / 180)

/**
 * Exemplo de integração com API de mapas (Google Maps, Leaflet, etc.)
 * @param mapData - Dados gerados do mapa
 * @returns Configuração pronta para biblioteca de mapas
 */
export const prepareMapForRendering = (mapData: any) => {
  return {
    // Configuração do centro e zoom
    center: mapData.mapData.center,
    zoom: calculateZoomLevel(mapData.mapData.radius),

    // Camadas de dados
    layers: [
      {
        type: 'heatmap',
        data: mapData.mapData.probabilityPoints,
        options: {
          radius: 5,
          maxZoom: 10,
          gradient: {
            0.0: mapData.legend.low.color,
            0.5: mapData.legend.medium.color,
            1.0: mapData.legend.high.color,
          },
        },
      },
      {
        type: 'marker',
        data: [mapData.mapData.samplePosition],
        options: {
          icon: 'sample-marker',
          size: 'large',
        },
      },
      {
        type: 'circle',
        data: [
          {
            center: mapData.mapData.center,
            radius: mapData.mapData.radius * 1000, // Converter para metros
          },
        ],
        options: {
          fillOpacity: 0.1,
          strokeColor: '#333',
          strokeWeight: 2,
        },
      },
    ],

    // Controles da interface
    controls: {
      legend: mapData.legend,
      radiusIndicator: `${mapData.mapData.radius}km`,
      sampleInfo: {
        id: mapData.sampleId,
        position: mapData.mapData.samplePosition,
      },
    },
  }
}

/**
 * Calcula nível de zoom apropriado baseado no raio
 * @param radiusKm - Raio em quilômetros
 * @returns Nível de zoom apropriado
 */
const calculateZoomLevel = (radiusKm: number): number => {
  // Fórmula aproximada para calcular zoom baseado no raio
  // Valores típicos: 10km=12, 50km=9, 100km=8, 500km=6, 1000km=5
  if (radiusKm <= 20) return 12
  if (radiusKm <= 50) return 10
  if (radiusKm <= 100) return 9
  if (radiusKm <= 200) return 8
  if (radiusKm <= 500) return 7
  return 6
}
