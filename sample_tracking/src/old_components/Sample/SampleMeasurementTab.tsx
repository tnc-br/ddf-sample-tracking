import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import TextInput from '@components/TextInput'
import Select from '@components/Select'
import TextArea from '@components/TextArea'
import { zodResolver } from '@hookform/resolvers/zod'
import { ErrorMessage } from '@hookform/error-message'

interface SampleMeasurementsTabProps {
  handleAddMeasurementClick: any
  formData: any
  onCancelClick: () => void
  onSave: (data: any) => void
  nextTab: () => void
}

const FormSchema = z.object({
  measureing_height: z.string().optional(),
  sample_type: z.string().optional(),
  diameter: z.string().optional(),
  avp: z.string().optional(),
  mean_annual_temperature: z.string().optional(),
  mean_annual_precipitation: z.string().optional(),
  observations: z.string().optional(),
  info: z
    .array(
      z.object({
        d18O_cel: z.string().optional(),
        d18O_wood: z.string().optional(),
        d15N_wood: z.string().optional(),
        n_wood: z.string().optional(),
        d13C_wood: z.string().optional(),
        c_wood: z.string().optional(),
        c_cel: z.string().optional(),
        d13C_cel: z.string().optional(),
      }),
    )
    .refine(
      (infos) =>
        infos.some(
          (item) =>
            item.d18O_cel ||
            item.d18O_wood ||
            item.d15N_wood ||
            item.n_wood ||
            item.d13C_wood ||
            item.c_wood ||
            item.c_cel ||
            item.d13C_cel,
        ),
      {
        message:
          'Pelo menos um item dos Dados Isotópicos deve estar completamente preenchido.',
      },
    ),
})

type FormSchema = z.infer<typeof FormSchema>

function SampleMeasurementsTab({
  onCancelClick,
  nextTab,
  formData,
  onSave,
}: SampleMeasurementsTabProps) {
  const { t } = useTranslation()

  console.log(formData.d180_cel)
  console.log(formData)
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<FormSchema>({
    resolver: zodResolver(FormSchema),
    shouldUseNativeValidation: false,
    defaultValues: {
      ...formData,
      info: formData?.d180_cel
        ? formData?.d180_cel?.map((_: any, index: number) => {
            console.log('index', index)
            const obj = {
              d18O_cel: formData.d18O_cel[index] ?? '',
              d18O_wood: formData.d18O_wood[index] ?? '',
              d15N_wood: formData.d15N_wood[index] ?? '',
              n_wood: formData.n_wood[index] ?? '',
              d13C_wood: formData.d13C_wood[index] ?? '',
              c_wood: formData.c_wood[index] ?? '',
              c_cel: formData.c_cel[index] ?? '',
              d13C_cel: formData.d13C_cel[index] ?? '',
            }

            return obj
          })
        : [
            {
              d18O_cel: '',
              d18O_wood: '',
              d15N_wood: '',
              n_wood: '',
              d13C_wood: '',
              c_wood: '',
              c_cel: '',
              d13C_cel: '',
            },
          ],
    },
    mode: 'onSubmit',
  })

  console.log('formData', watch('info'))

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
      const { info, ...rest } = data

      const d18O_cel_arr: any[] = []
      const d18O_wood_arr: any[] = []
      const d15N_wood_arr: any[] = []
      const n_wood_arr: any[] = []
      const d13C_wood_arr: any[] = []
      const c_wood_arr: any[] = []
      const c_cel_arr: any[] = []
      const d13C_cel_arr: any[] = []

      info.map((d) => {
        const {
          d18O_cel,
          d18O_wood,
          d15N_wood,
          n_wood,
          d13C_wood,
          c_wood,
          c_cel,
          d13C_cel,
        } = d

        d18O_cel_arr.push(d18O_cel)
        d18O_wood_arr.push(d18O_wood)
        d15N_wood_arr.push(d15N_wood)
        n_wood_arr.push(n_wood)
        d13C_wood_arr.push(d13C_wood)
        c_wood_arr.push(c_wood)
        c_cel_arr.push(c_cel)
        d13C_cel_arr.push(d13C_cel)
      })

      onSave({
        ...rest,
        d18O_cel: d18O_cel_arr,
        d18O_wood: d18O_wood_arr,
        d15N_wood: d15N_wood_arr,
        n_wood: n_wood_arr,
        d13C_wood: d13C_wood_arr,
        c_wood: c_wood_arr,
        c_cel: c_cel_arr,
        d13C_cel: d13C_cel_arr,
      })

      nextTab()
    },
    (err) => {
      console.log(err)
      alert(err.info?.root?.message ?? 'Preencha todos os campos obrigatórios.')
      // notification.display('Preencha todos os campos obrigatórios.', 'error')
    },
  )

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'info',
  })

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
          {fields.map((item, index) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-lg shadow-md mb-6"
            >
              <h2 className="text-2xl font-semibold mb-4">
                Dados Isotópicos - Item {index + 1}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <input
                  {...register(`info.${index}.d18O_cel`)}
                  placeholder="d18O_cel"
                  className="p-2 border rounded w-full"
                />
                <input
                  {...register(`info.${index}.d18O_wood`)}
                  placeholder="d18O_wood"
                  className="p-2 border rounded w-full"
                />
                <input
                  {...register(`info.${index}.d15N_wood`)}
                  placeholder="d15N_wood"
                  className="p-2 border rounded w-full"
                />
                <input
                  {...register(`info.${index}.n_wood`)}
                  placeholder="n_wood"
                  className="p-2 border rounded w-full"
                />
                <input
                  {...register(`info.${index}.d13C_wood`)}
                  placeholder="d13C_wood"
                  className="p-2 border rounded w-full"
                />
                <input
                  {...register(`info.${index}.c_wood`)}
                  placeholder="c_wood"
                  className="p-2 border rounded w-full"
                />
                <input
                  {...register(`info.${index}.c_cel`)}
                  placeholder="c_cel"
                  className="p-2 border rounded w-full"
                />
                <input
                  {...register(`info.${index}.d13C_cel`)}
                  placeholder="d13C_cel"
                  className="p-2 border rounded w-full"
                />
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              >
                Remover Item
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              append({
                d18O_cel: '',
                d18O_wood: '',
                d15N_wood: '',
                n_wood: '',
                d13C_wood: '',
                c_wood: '',
                c_cel: '',
                d13C_cel: '',
              })
            }
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
