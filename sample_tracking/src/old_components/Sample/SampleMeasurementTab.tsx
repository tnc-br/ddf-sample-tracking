import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import TextInput from '@components/ui/TextInput'
import Select from '@components/ui/Select'
import TextArea from '@components/ui/TextArea'
import { zodResolver } from '@hookform/resolvers/zod'
import { ErrorMessage } from '@hookform/error-message'

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
    <form id="sample-measurements" onSubmit={handleSubmitForm} noValidate>
      <div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-4">
            <div className="w-full">
              <label
                className="text-xs text-neutral-400 font-medium"
                htmlFor="measureing_height"
              >
                {t('measuringHeight')}
              </label>
              <TextInput
                required
                id="measureing_height"
                placeholder=""
                {...register('measureing_height')}
              />
              <ErrorMessage
                errors={errors}
                name="measureing_height"
                render={({ message }) => (
                  <span className="text-xs text-red-500 text-left">
                    {message}
                  </span>
                )}
              />
            </div>

            <div className="w-full">
              <label
                className="text-xs text-neutral-400 font-medium"
                htmlFor="sample_type"
              >
                {t('sampleType')}
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
                    className="border border-solid border-neutral-100 rounded-md h-7 text-sm"
                    value={value}
                    options={sampleTypeValues}
                  />
                )}
              />

              <ErrorMessage
                errors={errors}
                name="sample_type"
                render={({ message }) => (
                  <span className="text-xs text-red-500 text-left">
                    {message}
                  </span>
                )}
              />
            </div>
          </div>
          <div className="flex flex-row gap-4">
            <div className="w-full">
              <label
                className="text-xs text-neutral-400 font-medium"
                htmlFor="diameter"
              >
                {t('diameter')}
              </label>
              <TextInput
                required
                id="diameter"
                placeholder=""
                {...register('diameter')}
              />

              <ErrorMessage
                errors={errors}
                name="diameter"
                render={({ message }) => (
                  <span className="text-xs text-red-500 text-left">
                    {message}
                  </span>
                )}
              />
            </div>

            <div className="w-full">
              <label
                className="text-xs text-neutral-400 font-medium"
                htmlFor="avp"
              >
                {t('avp')}
              </label>
              <TextInput
                required
                id="avp"
                placeholder=""
                {...register('avp')}
              />

              <ErrorMessage
                errors={errors}
                name="avp"
                render={({ message }) => (
                  <span className="text-xs text-red-500 text-left">
                    {message}
                  </span>
                )}
              />
            </div>
          </div>
          <div className="flex flex-row gap-4">
            <div className="w-full">
              <label
                className="text-xs text-neutral-400 font-medium"
                htmlFor="mean_annual_temperature"
              >
                {t('meanAnnualTemperature')}
              </label>
              <TextInput
                required
                id="mean_annual_temperature"
                placeholder=""
                {...register('mean_annual_temperature')}
              />

              <ErrorMessage
                errors={errors}
                name="mean_annual_temperature"
                render={({ message }) => (
                  <span className="text-xs text-red-500 text-left">
                    {message}
                  </span>
                )}
              />
            </div>
            <div className="w-full">
              <label
                className="text-xs text-neutral-400 font-medium"
                htmlFor="mean_annual_precipitation"
              >
                {t('meanAnnualPrecipitation')}
              </label>
              <TextInput
                required
                id="mean_annual_precipitation"
                placeholder=""
                {...register('mean_annual_precipitation')}
              />

              <ErrorMessage
                errors={errors}
                name="mean_annual_precipitation"
                render={({ message }) => (
                  <span className="text-xs text-red-500 text-left">
                    {message}
                  </span>
                )}
              />
            </div>
          </div>
          <div className="">
            <div className="w-full flex flex-col gap-1">
              <label
                className="text-xs text-neutral-400 font-medium"
                htmlFor="observations"
              >
                {t('observations')}
              </label>
              <TextArea
                required
                id="observations"
                placeholder=""
                {...register('observations')}
              />

              <ErrorMessage
                errors={errors}
                name="observations"
                render={({ message }) => (
                  <span className="text-xs text-red-500 text-left">
                    {message}
                  </span>
                )}
              />
            </div>
          </div>
        </div>
        <div className="mt-6 ">
          {largestArr.map((item, index) => (
            <div
              key={`isotopic-group-${index}`}
              className="bg-white p-6 rounded-lg shadow-md mb-6"
            >
              <h2 className="text-2xl font-semibold mb-4">
                Dados Isotópicos - Item {index + 1}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {isotopicFieldNames.map((fieldName) => {
                  return (
                    <input
                      key={`${fieldName}-${index}`}
                      {...register(`${fieldName}.${index}`)}
                      placeholder={fieldName}
                      className="p-2 border rounded w-full"
                    />
                  )
                })}
              </div>
              {largestArr.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
                >
                  Remover Item
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddItem}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Adicionar Novo Item
          </button>
        </div>
      </div>
      <div className="flex justify-between my-10">
        <button
          onClick={onCancelClick}
          type="button"
          className="rounded border border-green-300 px-4 py-2 text-green-300 text-sm"
        >
          {t('back')}
        </button>
        <button
          id="next-button-wrapper"
          type="submit"
          className="rounded border bg-green-800 px-4 py-2 text-white text-sm"
        >
          {t('next')}
        </button>
      </div>
    </form>
  )
}

export default SampleMeasurementsTab
