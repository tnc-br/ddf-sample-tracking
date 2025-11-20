// Exemplo de como usar as configurações de cores do mapa no backend
// Este arquivo serve como documentação e exemplo de integração

import {
  getMapColorsForAPI,
  getColorByProbability,
} from '@utils/mapColorsConfig'

/**
 * Exemplo de uso para gerar dados do mapa com cores personalizadas
 */
export const generateMapData = (sampleData: any) => {
  // Obter configurações de cores atuais
  const colorConfig = getMapColorsForAPI()

  // Exemplo de como aplicar as cores baseado na probabilidade
  const mapPoints = sampleData.locations.map((location: any) => {
    const probability = location.probability // valor de 0 a 100
    const color = getColorByProbability(probability)

    return {
      ...location,
      color: color,
      probabilityCategory: getProbabilityCategory(probability),
    }
  })

  return {
    mapPoints,
    legend: {
      high: {
        color: colorConfig.highProbability.color,
        label: colorConfig.highProbability.label,
        threshold: `≥${colorConfig.highProbability.threshold}%`,
      },
      medium: {
        color: colorConfig.mediumProbability.color,
        label: colorConfig.mediumProbability.label,
        threshold: `${colorConfig.mediumProbability.threshold}-94%`,
      },
      low: {
        color: colorConfig.lowProbability.color,
        label: colorConfig.lowProbability.label,
        threshold: `<${colorConfig.mediumProbability.threshold}%`,
      },
    },
  }
}

const getProbabilityCategory = (
  probability: number,
): 'high' | 'medium' | 'low' => {
  if (probability >= 95) return 'high'
  if (probability >= 6) return 'medium'
  return 'low'
}

/**
 * Exemplo de integração com API do backend
 */
export const sendMapConfigToBackend = async () => {
  const colorConfig = getMapColorsForAPI()

  try {
    const response = await fetch('/api/update-map-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mapColors: colorConfig,
        updatedAt: new Date().toISOString(),
      }),
    })

    return response.json()
  } catch (error) {
    console.error('Erro ao enviar configurações para o backend:', error)
    throw error
  }
}
