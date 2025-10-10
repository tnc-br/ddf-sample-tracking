import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import TextInput from '@components/ui/TextInput'
import Select from '@components/ui/Select'
import TextArea from '@components/ui/TextArea'
import { zodResolver } from '@hookform/resolvers/zod'
import { ErrorMessage } from '@hookform/error-message'
import { MdArrowBack } from 'react-icons/md'

interface SampleMeasurementsTabProps {
  formData: any
  onCancelClick: () => void
  onSave: (data: any) => void
  nextTab: () => void
}

const FormSchema = z
  .object({
    measureing_height: z.string().optional(),
    sample_type: z.string().optional(),
    diameter: z.string().optional(),
    avp: z.string().optional(),
    mean_annual_temperature: z.string().optional(),
    mean_annual_precipitation: z.string().optional(),
    observations: z.string().optional(),
    d18O_cel: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default(['']),
    d18O_wood: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default(['']),
    d15N_wood: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default(['']),
    n_wood: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default(['']),
    d13C_wood: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default(['']),
    c_wood: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default(['']),
    c_cel: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default(['']),
    d13C_cel: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default(['']),
  })
  .refine(
    (item) => {
      const fieldsToCheck = [
        item.d18O_cel,
        item.d18O_wood,
        item.d15N_wood,
        item.n_wood,
        item.d13C_wood,
        item.c_wood,
        item.c_cel,
        item.d13C_cel,
      ]

      for (const arr of fieldsToCheck) {
        if (
          arr &&
          arr.some(
            (value) =>
              (typeof value === 'string' && value.trim() !== '') ||
              typeof value === 'number',
          )
        ) {
          return true // Pelo menos um item em um dos arrays está preenchido
        }
      }
      return false // Nenhum item preenchido em nenhum dos arrays
    },
    {
      message:
        'Pelo menos um item dos Dados Isotópicos deve estar completamente preenchido.',
    },
  )

type FormSchema = z.infer<typeof FormSchema>

type IsotopicArrayKey =
  | 'd18O_cel'
  | 'd18O_wood'
  | 'd15N_wood'
  | 'n_wood'
  | 'd13C_wood'
  | 'c_wood'
  | 'c_cel'
  | 'd13C_cel'

export function getLargestIndex(arrays: any[][]): any[] {
  let maxLength: any[] = []
  for (const arr of arrays) {
    if (arr && arr.length > maxLength.length) {
      maxLength = arr
    }
  }

  return maxLength.length > 0 ? maxLength : []
}

function SampleMeasurementsTab({
  onCancelClick,
  nextTab,
  formData,
  onSave,
}: SampleMeasurementsTabProps) {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm<FormSchema>({
    resolver: zodResolver(FormSchema),
    shouldUseNativeValidation: false,
    defaultValues: {
      d13C_cel: [''],
      d18O_cel: [''],
      d18O_wood: [''],
      d15N_wood: [''],
      d13C_wood: [''],
      c_cel: [''],
      c_wood: [''],
      n_wood: [''],
      ...formData,
    },
    mode: 'onSubmit',
  })

  const sampleTypeValues = [
    {
      value: 'disk',
      label: 'disk',
    },
    {
      value: 'triangular',
      label: 'triangular',
    },
    {
      value: 'chunk',
      label: 'chunk',
    },
    {
      value: 'fiber',
      label: 'fiber',
    },
  ]

  const handleSubmitForm = handleSubmit(
    (data) => {
      const { ...rest } = data

      onSave({
        ...rest,
      })

      nextTab()
    },
    (err) => {
      console.log(err)
      alert(err?.root?.message ?? 'Preencha todos os campos obrigatórios.')
    },
  )

  const {
    d13C_cel,
    d18O_cel,
    d18O_wood,
    d15N_wood,
    d13C_wood,
    c_cel,
    c_wood,
    n_wood,
  } = watch()

  const isotopicFieldNames: IsotopicArrayKey[] = [
    'd18O_cel',
    'd18O_wood',
    'd15N_wood',
    'n_wood',
    'd13C_wood',
    'c_wood',
    'c_cel',
    'd13C_cel',
  ]

  const largestArr = getLargestIndex([
    d18O_cel,
    d18O_wood,
    d15N_wood,
    n_wood,
    d13C_wood,
    c_wood,
    c_cel,
    d13C_cel,
  ])

  const handleAddItem = () => {
    isotopicFieldNames.forEach((fieldName) => {
      const currentArray = watch(fieldName) || []
      // Garantir que estamos trabalhando com um array
      const arrayToUpdate = Array.isArray(currentArray) ? currentArray : []
      setValue(fieldName, [...arrayToUpdate, ''], {
        shouldValidate: true,
        shouldDirty: true,
      })
    })
  }

  // Implementação da função handleRemoveItem
  const handleRemoveItem = (indexToRemove: number) => {
    isotopicFieldNames.forEach((fieldName) => {
      const currentArray = watch(fieldName) || []
      if (Array.isArray(currentArray)) {
        const newArray = currentArray.filter((_, idx) => idx !== indexToRemove)
        setValue(fieldName, newArray, {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
    })
  }

  return (
    <>
      {/* <div className="flex justify-between items-center">
        <div className="flex gap-2.5">
          <div className="bg-[#F7F7F7] size-6 rounded text-[#006E2C] flex items-center justify-center">
            <MdArrowBack className="text-base" />
          </div>
          <span className="bg-white">Voltar</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Medições da Amostra
        </h1>
        <div></div>
      </div> */}

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Adicione as medições da amostra
          </h1>
          <p className="text-gray-600">
            Preencha os dados de medição e isotópicos
          </p>
        </div>

        <form id="sample-measurements" onSubmit={handleSubmitForm} noValidate>
          {/* Campos principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Altura de medição */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('measuringHeight')}:
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className="rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('measureing_height')}
              />
              <ErrorMessage
                errors={errors}
                name="measureing_height"
                render={({ message }) => (
                  <p className="text-red-500 text-sm mt-1">{message}</p>
                )}
              />
            </div>

            {/* Tipo de amostra */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('sampleType')}:
              </label>
              <Controller
                control={control}
                name="sample_type"
                rules={{
                  required: '*Por favor, selecione uma opção',
                }}
                render={({ field: { onChange, value } }) => (
                  <Select
                    fill
                    placeholder="Selecione..."
                    onChange={(c) => onChange(c)}
                    className="rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={value}
                    options={sampleTypeValues}
                  />
                )}
              />
              <ErrorMessage
                errors={errors}
                name="sample_type"
                render={({ message }) => (
                  <p className="text-red-500 text-sm mt-1">{message}</p>
                )}
              />
            </div>

            {/* Diâmetro */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('diameter')}:
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className="rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('diameter')}
              />
              <ErrorMessage
                errors={errors}
                name="diameter"
                render={({ message }) => (
                  <p className="text-red-500 text-sm mt-1">{message}</p>
                )}
              />
            </div>

            {/* AVP */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('avp')}:
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className="rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('avp')}
              />
              <ErrorMessage
                errors={errors}
                name="avp"
                render={({ message }) => (
                  <p className="text-red-500 text-sm mt-1">{message}</p>
                )}
              />
            </div>

            {/* Temperatura média anual */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('meanAnnualTemperature')}:
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className="rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('mean_annual_temperature')}
              />
              <ErrorMessage
                errors={errors}
                name="mean_annual_temperature"
                render={({ message }) => (
                  <p className="text-red-500 text-sm mt-1">{message}</p>
                )}
              />
            </div>

            {/* Precipitação média anual */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('meanAnnualPrecipitation')}:
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className="rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('mean_annual_precipitation')}
              />
              <ErrorMessage
                errors={errors}
                name="mean_annual_precipitation"
                render={({ message }) => (
                  <p className="text-red-500 text-sm mt-1">{message}</p>
                )}
              />
            </div>

            {/* Observações */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('observations')}:
              </label>
              <textarea
                placeholder="Digite aqui..."
                className="rounded-lg w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                rows={4}
                {...register('observations')}
              />
              <ErrorMessage
                errors={errors}
                name="observations"
                render={({ message }) => (
                  <p className="text-red-500 text-sm mt-1">{message}</p>
                )}
              />
            </div>
          </div>

          {/* Seção de Dados Isotópicos */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Dados Isotópicos
            </h2>

            {largestArr.map((item, index) => (
              <div
                key={`isotopic-group-${index}`}
                className="bg-white border border-gray-200 rounded-lg p-6 mb-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Item {index + 1}
                  </h3>
                  {largestArr.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 font-medium transition-colors"
                    >
                      Remover Item
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {isotopicFieldNames.map((fieldName) => (
                    <div
                      key={`${fieldName}-${index}`}
                      className="md:col-span-1"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {fieldName}:
                      </label>
                      <input
                        type="text"
                        placeholder="Digite aqui..."
                        className="rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        {...register(`${fieldName}.${index}`)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Botão adicionar novo item */}
            <div className="flex justify-center mb-8">
              <button
                type="button"
                onClick={handleAddItem}
                className="px-6 py-3 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 font-medium transition-colors"
              >
                Adicionar Novo Item
              </button>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={onCancelClick}
              type="button"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 font-medium transition-colors"
            >
              {t('back')}
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#006E2C] rounded-full hover:bg-green-700 text-white font-medium transition-colors"
            >
              Próxima etapa
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default SampleMeasurementsTab
