import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { ErrorMessage } from '@hookform/error-message'

import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import TextInput from '@components/TextInput'
import Select from '@components/Select'
import { speciesList } from '../species_list'
import InfoDummy from '@components/Tooltip'
import { statesList } from '../states_list'
import { municipalitiesList } from '../municipalities_list'

interface BasicInfoTabProps {
  onChangeClick: (event: any) => void
  formData: any
  onChangeClickSupplier: (event: any) => void
  originIsKnownOrUncertain: boolean
  errorText: any
  onChangeClickMyOrg: (event: any) => void
}

const FormSchema = z.object({
  sample_name: z.string(),
  status: z.string(),
  species: z.string(),
  trusted: z.string(),
  site: z.string(),
  lat: z.string(),
  lon: z.string(),
  state: z.string(),
  municipality: z.string(),
  date_collected: z.string(),
  collected_by: z.string(),
  supplier: z.string(),
  city: z.string(),
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
  onChangeClick,
  formData,
  onChangeClickSupplier,
  originIsKnownOrUncertain,
  errorText,
  onChangeClickMyOrg,
}: BasicInfoTabProps) {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    control,
    setValue,
  } = useForm<FormSchema>()

  const SPECIES_NAMES_OPTIONS = speciesList.split('\n').map((species) => ({
    value: species.trim().toLowerCase(),
    label: species.trim(),
  }))

  const STATES_OPTIONS = statesList.split('\n').map((state) => ({
    value: state.trim().toLowerCase(),
    label: state.trim(),
  }))

  const MUNICIPALITIES_OPTIONS = municipalitiesList
    .split('\n')
    .map((municipality) => ({
      value: municipality.trim().toLowerCase(),
      label: municipality.trim(),
    }))

  return (
    <form
      className="grid grid-cols-2 gap-5"
      onSubmit={handleSubmit(onChangeClick)}
    >
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
            placeholder="Amostra 123"
            {...register('sample_name')}
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
              placeholder="Amostra 123"
              {...register('sample_name')}
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
                <InfoDummy text={'Texto informativo da latitude'} />
              </label>
              <TextInput
                required
                id="inputLat"
                placeholder="Amostra 123"
                {...register('lat')}
              />
            </div>
            <div className="w-full">
              <label
                className="text-xs text-neutral-400 font-medium flex items-center gap-3"
                htmlFor="inputLon"
              >
                {t('longitude')}{' '}
                <InfoDummy text={'Texto informativo da longitude'} />
              </label>
              <TextInput
                required
                id="inputLon"
                placeholder="Amostra 123"
                {...register('lon')}
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
                  options={MUNICIPALITIES_OPTIONS}
                />
              )}
            />
          </div>
        )}

        {/* <div className="input-text-field-wrapper">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={t('dateCollected')}
              sx={style}
              slotProps={{ textField: { size: 'small' } }}
              {...register('date_collected')}
            />
          </LocalizationProvider>
        </div> */}
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
              placeholder="Amostra 123"
              {...register('supplier')}
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
            placeholder="Amostra 123"
            {...register('city')}
          />
        </div>
      </div>
    </form>
  )
}

export default BasicInfoTab
