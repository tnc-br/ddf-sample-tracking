// Exemplo de como acessar as configurações de cores da organização no backend
// Este arquivo demonstra como o backend pode recuperar as configurações personalizadas

import { doc, getDoc } from 'firebase/firestore'
import { db } from '@services/firebase/config'
import {
  DEFAULT_MAP_COLORS,
  type MapColorsConfig,
} from '@utils/mapColorsConfig'

/**
 * Recupera as configurações de cores da organização para uso no backend
 * @param orgId - ID da organização
 * @returns Configurações de cores da organização ou padrão
 */
export const getOrganizationMapColors = async (
  orgId: string,
): Promise<MapColorsConfig> => {
  if (!orgId) {
    console.warn('Organization ID is required to get map colors')
    return DEFAULT_MAP_COLORS
  }

  try {
    const orgRef = doc(db, 'organizations', orgId)
    const orgDoc = await getDoc(orgRef)

    if (orgDoc.exists()) {
      const orgData = orgDoc.data()
      const mapColors = orgData.mapColors

      // Validar se as cores existem e são válidas
      if (
        mapColors &&
        mapColors.high &&
        mapColors.medium &&
        mapColors.low &&
        isValidHexColor(mapColors.high) &&
        isValidHexColor(mapColors.medium) &&
        isValidHexColor(mapColors.low)
      ) {
        console.log(
          `Cores personalizadas carregadas para organização ${orgId}:`,
          mapColors,
        )
        return mapColors
      }
    }

    console.log(`Usando cores padrão para organização ${orgId}`)
    return DEFAULT_MAP_COLORS
  } catch (error) {
    console.error('Erro ao recuperar cores da organização:', error)
    return DEFAULT_MAP_COLORS
  }
}

/**
 * Valida se uma string é uma cor hexadecimal válida
 * @param color - String da cor para validar
 * @returns boolean indicando se é válida
 */
const isValidHexColor = (color: string): boolean => {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexColorRegex.test(color)
}

/**
 * Exemplo de uso no processo de geração de mapa
 * @param orgId - ID da organização
 * @param probabilityData - Dados de probabilidade das amostras
 */
export const generateMapWithOrgColors = async (
  orgId: string,
  probabilityData: any[],
) => {
  // Obter cores personalizadas da organização
  const orgColors = await getOrganizationMapColors(orgId)

  // Aplicar cores baseado na probabilidade
  const coloredData = probabilityData.map((point) => {
    const probability = point.probability
    let color: string
    let category: string

    if (probability >= 95) {
      color = orgColors.high
      category = 'high'
    } else if (probability >= 6) {
      color = orgColors.medium
      category = 'medium'
    } else {
      color = orgColors.low
      category = 'low'
    }

    return {
      ...point,
      color,
      category,
      probabilityRange: getProbabilityRange(probability),
    }
  })

  return {
    mapData: coloredData,
    legend: {
      high: {
        color: orgColors.high,
        label: 'Alta Probabilidade (≥95%)',
        count: coloredData.filter((p) => p.category === 'high').length,
      },
      medium: {
        color: orgColors.medium,
        label: 'Média Probabilidade (6-94%)',
        count: coloredData.filter((p) => p.category === 'medium').length,
      },
      low: {
        color: orgColors.low,
        label: 'Baixa Probabilidade (<6%)',
        count: coloredData.filter((p) => p.category === 'low').length,
      },
    },
    organizationId: orgId,
    generatedAt: new Date().toISOString(),
  }
}

const getProbabilityRange = (probability: number): string => {
  if (probability >= 95) return '≥95%'
  if (probability >= 6) return '6-94%'
  return '<6%'
}

/**
 * Função para ser usada em Cloud Functions quando uma amostra é processada
 * @param sampleData - Dados da amostra
 * @param orgId - ID da organização
 */
export const processSampleWithOrgColors = async (
  sampleData: any,
  orgId: string,
) => {
  const orgColors = await getOrganizationMapColors(orgId)

  // Aqui você processaria a amostra e geraria o mapa com as cores da organização
  // Este é apenas um exemplo da estrutura

  return {
    sampleId: sampleData.id,
    organizationId: orgId,
    mapColors: orgColors,
    processed: true,
    processedAt: new Date().toISOString(),
  }
}
