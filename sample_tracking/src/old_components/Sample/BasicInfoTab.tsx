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
    <form className="" onSubmit={handleSubmitForm} noValidate>
      <div className="grid grid-cols-2 gap-5">
        <div className="flex flex-col gap-3">
          <div className="">
            <label
              className="text-xs text-neutral-400 font-medium"
              htmlFor="sampleName"
            >
              {t('sampleName')}
            </label>
            <TextInput
              required
              id="sampleName"
              placeholder="Digite..."
              {...register('sample_name')}
              isErrored={!!errors.sample_name}
            />
            <ErrorMessage
              errors={errors}
              name="sample_name"
              render={({ message }) => (
                <span className="text-xs text-red-500 text-left">
                  {message}
                </span>
              )}
            />
          </div>

          <div className="">
            <label className="text-xs text-neutral-400 font-medium">
              {t('status')}
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
                  placeholder="Selecione..."
                  onChange={(c) => onChange(c)}
                  className="border border-solid border-neutral-100 rounded-md h-7 text-sm"
                  value={value}
                  options={STATUS_OPTIONS}
                />
              )}
            />

            <ErrorMessage
              errors={errors}
              name="status"
              render={({ message }) => (
                <span className="text-xs text-red-500 text-left">
                  {message}
                </span>
              )}
            />
          </div>

          <div className="">
            <label className="text-xs text-neutral-400 font-medium">
              {t('treeSpecies')}
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
                  placeholder="Selecione..."
                  onChange={(c) => onChange(c)}
                  className="border border-solid border-neutral-100 rounded-md h-7 text-sm"
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
                <span className="text-xs text-red-500 text-left">
                  {message}
                </span>
              )}
            />
          </div>

          <div className="">
            <label className="text-xs text-neutral-400 font-medium">
              {t('origin')}
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
                  placeholder="Selecione..."
                  onChange={(c) => onChange(c)}
                  className="border border-solid border-neutral-100 rounded-md h-7 text-sm"
                  value={value}
                  options={ORIGIN_OPTIONS}
                />
              )}
            />

            <ErrorMessage
              errors={errors}
              name="trusted"
              render={({ message }) => (
                <span className="text-xs text-red-500 text-left">
                  {message}
                </span>
              )}
            />
          </div>

          {originIsKnownOrUncertain && (
            <div className="">
              <label
                className="text-xs text-neutral-400 font-medium"
                htmlFor="collectionSite"
              >
                {t('collectionSite')}
              </label>
              <TextInput
                required
                id="collectionSite"
                placeholder="Digite..."
                {...register('collection_site')}
              />
              <ErrorMessage
                errors={errors}
                name="collection_site"
                render={({ message }) => (
                  <span className="text-xs text-red-500 text-left">
                    {message}
                  </span>
                )}
              />
            </div>
          )}

          {originIsKnownOrUncertain && (
            <div className="flex gap-2 justify-between">
              <div className="w-full">
                <label
                  className="text-xs text-neutral-400 font-medium flex items-center gap-3"
                  htmlFor="inputLon"
                >
                  {t('latitude')}{' '}
                  <InfoDummy
                    children={
                      <>
                        📍 Formato esperado: decimal (WGS84) <br />
                        Ex: Latitude: -23.55052, Longitude: -46.63331 <br />
                        • Use ponto como separador decimal <br />• Sem símbolos
                        como °, N, S, E, W <br />• Latitude: -90 a 90 <br />•
                        Longitude: -180 a 180
                      </>
                    }
                  />
                </label>
                <TextInput
                  required
                  id="inputLat"
                  placeholder="Digite..."
                  type="number"
                  {...register('lat')}
                />

                <ErrorMessage
                  errors={errors}
                  name="lat"
                  render={({ message }) => (
                    <span className="text-xs text-red-500 text-left">
                      {message}
                    </span>
                  )}
                />
              </div>
              <div className="w-full">
                <label
                  className="text-xs text-neutral-400 font-medium flex items-center gap-3"
                  htmlFor="inputLon"
                >
                  {t('longitude')}{' '}
                  <InfoDummy
                    children={
                      <>
                        📍 Formato esperado: decimal (WGS84) <br />
                        Ex: Latitude: -23.55052, Longitude: -46.63331 <br />
                        • Use ponto como separador decimal <br />• Sem símbolos
                        como °, N, S, E, W <br />• Latitude: -90 a 90 <br />•
                        Longitude: -180 a 180
                      </>
                    }
                  />
                </label>
                <TextInput
                  required
                  id="inputLon"
                  placeholder="Digite..."
                  type="number"
                  {...register('lon')}
                />

                <ErrorMessage
                  errors={errors}
                  name="lon"
                  render={({ message }) => (
                    <span className="text-xs text-red-500 text-left">
                      {message}
                    </span>
                  )}
                />
              </div>
            </div>
          )}

          {originIsKnownOrUncertain && (
            <div className="">
              <label className="text-xs text-neutral-400 font-medium">
                {t('state')}
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
                    placeholder="Selecione..."
                    onChange={(c) => onChange(c)}
                    className="border border-solid border-neutral-100 rounded-md h-7 text-sm"
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
                  <span className="text-xs text-red-500 text-left">
                    {message}
                  </span>
                )}
              />
            </div>
          )}

          {originIsKnownOrUncertain && (
            <div className="">
              <label className="text-xs text-neutral-400 font-medium">
                {t('municipality')}
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
                    placeholder="Selecione..."
                    onChange={(c) => onChange(c)}
                    className="border border-solid border-neutral-100 rounded-md h-7 text-sm"
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
                  <span className="text-xs text-red-500 text-left">
                    {message}
                  </span>
                )}
              />
            </div>
          )}

          <div className="">
            <label className="text-xs text-neutral-400 font-medium">
              {t('dateCollected')}
            </label>

            <Controller
              control={control}
              name="date_collected"
              rules={{
                required: '*Por favor, selecione uma opção',
              }}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  className={`w-full ${
                    errors.date_collected ? 'border-red-300' : ''
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
                <span className="text-xs text-red-500 text-left">
                  {message}
                </span>
              )}
            />
          </div>
        </div>
        <div className="">
          <div className="collected-by-wrapper">
            <div className="collected-by-text-wrapper">
              <div className="collected-by-text">{t('collectedBy')}</div>
            </div>
            <div className="collected-by-button-wrapper">
              <div
                onClick={onChangeClickSupplier}
                className="supplier-button-wrapper"
              >
                <div
                  className={
                    formData.collected_by === 'supplier'
                      ? 'supplier-button-container collected-by-button-container selected'
                      : 'supplier-button-container collected-by-button-container'
                  }
                >
                  <div className="supplier-button-slate-layer">
                    <div className="supplier-button-text">{t('supplier')}</div>
                  </div>
                </div>
              </div>
              <div
                onClick={onChangeClickMyOrg}
                className="supplier-button-wrapper"
              >
                <div
                  className={
                    formData.collected_by === 'my_org'
                      ? 'org-button-container collected-by-button-container selected'
                      : 'org-button-container collected-by-button-container'
                  }
                >
                  <div className="supplier-button-slate-layer">
                    <div className="supplier-button-text">{t('myOrg')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {formData.collected_by === 'supplier' && (
            <div className="">
              <label
                className="text-xs text-neutral-400 font-medium"
                htmlFor="supplier"
              >
                {t('supplier')}
              </label>
              <TextInput
                required
                id="supplier"
                placeholder="Digite..."
                {...register('supplier')}
              />

              <ErrorMessage
                errors={errors}
                name="supplier"
                render={({ message }) => (
                  <span className="text-xs text-red-500 text-left">
                    {message}
                  </span>
                )}
              />
            </div>
          )}

          <div className="">
            <label
              className="text-xs text-neutral-400 font-medium"
              htmlFor="city"
            >
              {t('city')}
            </label>
            <TextInput
              required
              id="city"
              placeholder="Digite..."
              {...register('city')}
            />

            <ErrorMessage
              errors={errors}
              name="city"
              render={({ message }) => (
                <span className="text-xs text-red-500 text-left">
                  {message}
                </span>
              )}
            />
          </div>
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

export default BasicInfoTab
