import { z } from 'zod'

// Schema para validação completa do formulário de Sample
export const SampleCompleteSchema = z
  .object({
    // ===== BASIC INFO TAB =====

    // Campos obrigatórios básicos
    sample_name: z
      .string({ required_error: 'Nome da amostra é obrigatório' })
      .min(1, 'Nome da amostra é obrigatório')
      .trim(),

    // Campos de seleção
    status: z
      .string({ required_error: 'Status é obrigatório' })
      .min(1, 'Selecione um status'),

    species: z
      .string({ required_error: 'Espécie é obrigatória' })
      .min(1, 'Selecione uma espécie'),

    trusted: z
      .string({ required_error: 'Origem é obrigatória' })
      .min(1, 'Selecione a origem'),

    // Campos condicionais (origem conhecida/incerta)
    collection_site: z.string().optional().nullable(),

    lat: z
      .union([
        z.string().transform((val) => (val === '' ? null : parseFloat(val))),
        z.number(),
      ])
      .refine((val) => val === null || (val >= -90 && val <= 90), {
        message: 'Latitude deve estar entre -90 e 90',
      })
      .optional()
      .nullable(),

    lon: z
      .union([
        z.string().transform((val) => (val === '' ? null : parseFloat(val))),
        z.number(),
      ])
      .refine((val) => val === null || (val >= -180 && val <= 180), {
        message: 'Longitude deve estar entre -180 e 180',
      })
      .optional()
      .nullable(),

    state: z.string().optional().nullable(),

    municipality: z.string().optional().nullable(),

    // Data de coleta
    date_collected: z
      .union([z.date(), z.string().datetime(), z.string().date()])
      .optional()
      .nullable(),

    // Campos de coleta
    collected_by: z.enum(['supplier', 'my_org'], {
      required_error: 'Selecione quem coletou',
    }),

    supplier: z.string().optional().nullable(),

    city: z
      .string({ required_error: 'Cidade é obrigatória' })
      .min(1, 'Digite a cidade')
      .trim(),

    // ===== MEASUREMENT TAB =====

    // Campos de medição básicos
    measureing_height: z.string().optional().nullable(),

    sample_type: z
      .enum(['disk', 'triangular', 'chunk', 'fiber'], {
        required_error: 'Selecione o tipo de amostra',
      })
      .optional()
      .nullable(),

    diameter: z.string().optional().nullable(),

    avp: z.string().optional().nullable(),

    mean_annual_temperature: z
      .union([
        z.string().transform((val) => (val === '' ? null : parseFloat(val))),
        z.number(),
      ])
      .optional()
      .nullable(),

    mean_annual_precipitation: z
      .union([
        z.string().transform((val) => (val === '' ? null : parseFloat(val))),
        z.number(),
      ])
      .optional()
      .nullable(),

    observations: z.string().optional().nullable(),

    // ===== DADOS ISOTÓPICOS =====

    // Arrays de dados isotópicos
    d18O_cel: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default([]),

    d18O_wood: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default([]),

    d15N_wood: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default([]),

    n_wood: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default([]),

    d13C_wood: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default([]),

    c_wood: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default([]),

    c_cel: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default([]),

    d13C_cel: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default([]),
  })
  .refine(
    // Validação condicional: se origem é conhecida/incerta, campos de localização são obrigatórios
    (data) => {
      if (data.trusted === 'trusted' || data.trusted === 'untrusted') {
        return (
          data.collection_site &&
          data.lat !== null &&
          data.lon !== null &&
          data.state &&
          data.municipality
        )
      }
      return true
    },
    {
      message:
        'Campos de localização são obrigatórios quando origem é conhecida ou incerta',
      path: ['collection_site'],
    },
  )
  .refine(
    // Validação condicional: se coletado por fornecedor, campo supplier é obrigatório
    (data) => {
      if (data.collected_by === 'supplier') {
        return data.supplier && data.supplier.trim().length > 0
      }
      return true
    },
    {
      message: 'Nome do fornecedor é obrigatório',
      path: ['supplier'],
    },
  )
  .refine(
    // Validação dos dados isotópicos: pelo menos um array deve ter dados
    (data) => {
      const isotopicFields = [
        data.d18O_cel,
        data.d18O_wood,
        data.d15N_wood,
        data.n_wood,
        data.d13C_wood,
        data.c_wood,
        data.c_cel,
        data.d13C_cel,
      ]

      return isotopicFields.some(
        (arr) =>
          arr &&
          arr.some(
            (value) =>
              (typeof value === 'string' && value.trim() !== '') ||
              (typeof value === 'number' && !isNaN(value)),
          ),
      )
    },
    {
      message: 'Pelo menos um dado isotópico deve ser preenchido',
      path: ['d18O_cel'],
    },
  )

// Tipo TypeScript inferido do schema
export type SampleFormData = z.infer<typeof SampleCompleteSchema>

// Opções para os selects
export const STATUS_OPTIONS = [
  { label: 'In transit', value: 'in_transit' },
  { label: 'Not started', value: 'not_started' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Completed', value: 'concluded' },
] as const

export const ORIGIN_OPTIONS = [
  { label: 'Unknown', value: 'unknown' },
  { label: 'Known', value: 'trusted' },
  { label: 'Uncertain', value: 'untrusted' },
] as const

export const SAMPLE_TYPE_OPTIONS = [
  { label: 'Disk', value: 'disk' },
  { label: 'Triangular', value: 'triangular' },
  { label: 'Chunk', value: 'chunk' },
  { label: 'Fiber', value: 'fiber' },
] as const

export const COLLECTED_BY_OPTIONS = [
  { label: 'Supplier', value: 'supplier' },
  { label: 'My Organization', value: 'my_org' },
] as const
