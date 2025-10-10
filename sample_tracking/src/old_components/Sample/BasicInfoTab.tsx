import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { ErrorMessage } from '@hookform/error-message'

import { useTranslation } from 'react-i18next'
import TextInput from '@components/ui/TextInput'
import Select from '@components/ui/Select'
import { speciesList } from '../species_list'
import InfoDummy from '@components/ui/Tooltip'
import { states_list } from '../states_list'
import { municipalities_list } from '../municipalities_list'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DatePicker from '@components/ui/DatePicker'
import moment from 'moment'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sample } from '../utils'

interface BasicInfoTabProps {
  onSave: (data: any) => void
  formData: Partial<Sample>
  onChangeClickSupplier: (event: any) => void
  onChangeClickMyOrg: (event: any) => void
  nextTab: () => void
}

type Municipalitie = {
  ID: string
  Nome: string
  Estado: string
}

type State = {
  ID: string
  Nome: string
  Sigla: string
}

const FormSchema = z.object({
  sample_name: z
    .string({ required_error: '*Campo obrigatório' })
    .min(1, '*Campo obrigatório'),
  status: z.string(),
  species: z.string().optional(),
  trusted: z.string().optional(),
  site: z.string().optional(),
  lat: z.union([z.string(), z.number()]).optional(),
  lon: z.union([z.string(), z.number()]).optional(),
  state: z.string().optional(),
  municipality: z.string().optional(),
  date_collected: z.union([z.date(), z.string()]).optional().nullish(),
  collected_by: z.string().optional(),
  supplier: z.string().optional(),
  city: z.string().optional(),
  collection_site: z.string().optional(),
})

type FormSchema = z.infer<typeof FormSchema>

const STATUS_OPTIONS = [
  { label: 'In transit', value: 'in_transit' },
  { label: 'Not started', value: 'not_started' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Completed', value: 'concluded' },
]

const ORIGIN_OPTIONS = [
  { label: 'Unknown', value: 'unknown' },
  { label: 'Known', value: 'trusted' },
  { label: 'Uncertain', value: 'untrusted' },
]

function BasicInfoTab({
  onSave,
  formData,
  onChangeClickSupplier,
  onChangeClickMyOrg,
  nextTab,
}: BasicInfoTabProps) {
  const { t } = useTranslation()
  const router = useRouter()

  const [municipalitiesList, setMunicipalitiesList] =
    useState<{ label: string; value: string }[]>()

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
      date_collected: formData.date_collected ? formData.date_collected : null,
      ...formData,
    },
    mode: 'onSubmit',
  })

  const SPECIES_NAMES_OPTIONS = speciesList

  const STATES_OPTIONS = states_list.map((state: State) => ({
    value: state.Nome,
    label: state.Nome,
  }))

  const { state, trusted } = watch()

  useEffect(() => {
    if (!state) {
      setValue('municipality', '')
      return
    }

    const selectedState = states_list.find((s) => s.Nome === state)

    if (!selectedState) {
      return
    }

    const filteredMunicipalities = municipalities_list
      .filter(
        (municipality: Municipalitie) =>
          municipality.Estado === selectedState.ID,
      )
      .map((municipality: Municipalitie) => ({
        value: municipality.Nome,
        label: municipality.Nome,
      }))

    setMunicipalitiesList(filteredMunicipalities)
  }, [state])

  const handleSubmitForm = handleSubmit(
    (data) => {
      onSave(data)
      nextTab()
    },
    (err) => {
      console.log(err)
      // notification.display('Preencha todos os campos obrigatórios.', 'error')
    },
  )

  const onCancelClick = () => {
    router.push('samples')
  }

  const originIsKnownOrUncertain =
    trusted === 'trusted' || trusted === 'untrusted'

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Preencha abaixo os detalhes
          </h1>
          <p className="text-gray-600">
            Obs: os campos abaixo são todos obrigatórios
          </p>
        </div>

        {/* Tabs para Coletado por */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={onChangeClickSupplier}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              formData.collected_by === 'supplier'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('supplier')}
          </button>
          <button
            onClick={onChangeClickMyOrg}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              formData.collected_by === 'my_org'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('myOrg')}
          </button>
        </div>
      </div>

      <form className="" onSubmit={handleSubmitForm} noValidate>
        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Nome da amostra */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('sampleName')}:
            </label>
            <input
              type="text"
              placeholder="Digite aqui..."
              className="rounded-full w-full px-4 py-3 border border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              {...register('sample_name')}
            />
            <ErrorMessage
              errors={errors}
              name="sample_name"
              render={({ message }) => (
                <p className="text-red-500 text-sm mt-1">{message}</p>
              )}
            />
          </div>

          {/* Status */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('status')}:
            </label>
            <Controller
              control={control}
              name="status"
              rules={{
                required: '*Por favor, selecione uma opção',
              }}
              render={({ field: { onChange, value } }) => (
                <Select
                  fill
                  placeholder="Digite aqui..."
                  onChange={(c) => onChange(c)}
                  className="rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={value}
                  options={STATUS_OPTIONS}
                />
              )}
            />
            <ErrorMessage
              errors={errors}
              name="status"
              render={({ message }) => (
                <p className="text-red-500 text-sm mt-1">{message}</p>
              )}
            />
          </div>

          {/* Espécies */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('treeSpecies')}:
            </label>
            <Controller
              control={control}
              name="species"
              rules={{
                required: '*Por favor, selecione uma opção',
              }}
              render={({ field: { onChange, value } }) => (
                <Select
                  fill
                  placeholder="Digite aqui..."
                  onChange={(c) => onChange(c)}
                  className="rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={value}
                  isSearchable
                  options={SPECIES_NAMES_OPTIONS}
                />
              )}
            />
            <ErrorMessage
              errors={errors}
              name="species"
              render={({ message }) => (
                <p className="text-red-500 text-sm mt-1">{message}</p>
              )}
            />
          </div>

          {/* Origem */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('origin')}:
            </label>
            <Controller
              control={control}
              name="trusted"
              rules={{
                required: '*Por favor, selecione uma opção',
              }}
              render={({ field: { onChange, value } }) => (
                <Select
                  fill
                  placeholder="Digite aqui..."
                  onChange={(c) => onChange(c)}
                  className="rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={value}
                  options={ORIGIN_OPTIONS}
                />
              )}
            />
            <ErrorMessage
              errors={errors}
              name="trusted"
              render={({ message }) => (
                <p className="text-red-500 text-sm mt-1">{message}</p>
              )}
            />
          </div>

          {/* Local de Coleta */}
          {originIsKnownOrUncertain && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('collectionSite')}:
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className="rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('collection_site')}
              />
              <ErrorMessage
                errors={errors}
                name="collection_site"
                render={({ message }) => (
                  <p className="text-red-500 text-sm mt-1">{message}</p>
                )}
              />
            </div>
          )}

          {/* Latitude */}
          {originIsKnownOrUncertain && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('latitude')}:
              </label>
              <input
                type="number"
                placeholder="Digite aqui..."
                className="rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('lat')}
              />
              <ErrorMessage
                errors={errors}
                name="lat"
                render={({ message }) => (
                  <p className="text-red-500 text-sm mt-1">{message}</p>
                )}
              />
            </div>
          )}

          {/* Longitude */}
          {originIsKnownOrUncertain && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('longitude')}:
              </label>
              <input
                type="number"
                placeholder="Digite aqui..."
                className="rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('lon')}
              />
              <ErrorMessage
                errors={errors}
                name="lon"
                render={({ message }) => (
                  <p className="text-red-500 text-sm mt-1">{message}</p>
                )}
              />
            </div>
          )}

          {/* Estado */}
          {originIsKnownOrUncertain && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('state')}:
              </label>
              <Controller
                control={control}
                name="state"
                rules={{
                  required: '*Por favor, selecione uma opção',
                }}
                render={({ field: { onChange, value } }) => (
                  <Select
                    fill
                    placeholder="Digite aqui..."
                    onChange={(c) => onChange(c)}
                    className="rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={value}
                    isSearchable
                    options={STATES_OPTIONS}
                  />
                )}
              />
              <ErrorMessage
                errors={errors}
                name="state"
                render={({ message }) => (
                  <p className="text-red-500 text-sm mt-1">{message}</p>
                )}
              />
            </div>
          )}

          {/* Município */}
          {originIsKnownOrUncertain && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('municipality')}:
              </label>
              <Controller
                control={control}
                name="municipality"
                rules={{
                  required: '*Por favor, selecione uma opção',
                }}
                render={({ field: { onChange, value } }) => (
                  <Select
                    fill
                    placeholder="Digite aqui..."
                    onChange={(c) => onChange(c)}
                    className="rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={value}
                    isSearchable
                    options={municipalitiesList}
                  />
                )}
              />
              <ErrorMessage
                errors={errors}
                name="municipality"
                render={({ message }) => (
                  <p className="text-red-500 text-sm mt-1">{message}</p>
                )}
              />
            </div>
          )}

          {/* Data de Coleta */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('dateCollected')}:
            </label>
            <Controller
              control={control}
              name="date_collected"
              rules={{
                required: '*Por favor, selecione uma opção',
              }}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  className={`rounded-full w-full px-4 py-3 border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.date_collected ? 'border-red-300' : 'border-gray-300'
                  }`}
                  shape="square"
                  leftIcon
                  closeOnSelect
                  date={
                    moment(value).isValid() ? moment(value).toDate() : undefined
                  }
                  onChange={(date_collected) =>
                    onChange(moment(date_collected).toISOString())
                  }
                />
              )}
            />
            <ErrorMessage
              errors={errors}
              name="date_collected"
              render={({ message }) => (
                <p className="text-red-500 text-sm mt-1">{message}</p>
              )}
            />
          </div>

          {/* Fornecedor (se aplicável) */}
          {formData.collected_by === 'supplier' && (
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('supplier')}:
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className="rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('supplier')}
              />
              <ErrorMessage
                errors={errors}
                name="supplier"
                render={({ message }) => (
                  <p className="text-red-500 text-sm mt-1">{message}</p>
                )}
              />
            </div>
          )}

          {/* Cidade */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('city')}:
            </label>
            <input
              type="text"
              placeholder="Digite aqui..."
              className="rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              {...register('city')}
            />
            <ErrorMessage
              errors={errors}
              name="city"
              render={({ message }) => (
                <p className="text-red-500 text-sm mt-1">{message}</p>
              )}
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-12 flex justify-center">
          <button
            type="submit"
            className="px-6 py-3 bg-[#006E2C] rounded-full hover:bg-green-700 text-white font-medium transition-colors"
          >
            Próxima etapa
          </button>
        </div>
      </form>
    </div>
  )
}

export default BasicInfoTab
