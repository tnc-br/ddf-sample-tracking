'use client'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
// import { ErrorMessage } from '@hookform/error-message'

import Checkbox from '@components/Checkbox'
import TextInput from '@components/TextInput'
import Dialog from '@components/Dialog'
import { useState } from 'react'
import Dropdown from '@components/Dropdown'
import HoverIcon from '@components/HoverIcon'
import { Md18UpRating } from 'react-icons/md'
import Select from '@components/Select'
import Switch from '@components/Switch/Switch'
import Tooltip from '@components/Tooltip'
import TextArea from '@components/TextArea'

const FormSchema = z.object({
  checkbox: z.boolean(),
  switch: z.boolean(),
  inputText: z.string(),
  inputArea: z.string(),
  select: z.string(),
})

type FormSchema = z.infer<typeof FormSchema>

export default function LogInSignUpPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    control,
    setValue,
  } = useForm<FormSchema>()

  const submitForm = handleSubmit(
    async (data) => {
      console.log(data)
    },
    (errors) => {
      console.log(errors)
    },
  )

  const [showModal, setShowModal] = useState(false)

  return (
    <div className="absolute left-[304px] w-[1088px] top-[67px]">
      <form
        onSubmit={submitForm}
        className="w-full flex flex-col gap-4 max-w-sm "
      >
        <div>
          <TextInput
            placeholder="Enter your email"
            {...register('inputText')}
          />
        </div>

        <div>
          <TextArea
            placeholder="Digite sua observação"
            {...register('inputArea')}
          />
        </div>

        <div>
          <Controller
            name="checkbox"
            control={control}
            render={({ field: { value, onChange, onBlur, ref } }) => (
              <Checkbox
                checked={value}
                onCheckedChange={(e) => onChange(e)}
                onBlur={onBlur}
              />
            )}
          />
        </div>

        <div>
          <button
            className="bg-blue-400 text-white px-4 py-2"
            onClick={() => setShowModal(true)}
          >
            abrir modal
          </button>
          <Dialog.Root open={showModal} onOpenChange={setShowModal}>
            <Dialog.Overlay className="fixed top-0 left-0 z-40 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
              <Dialog.Content className="w-96 px-9 py-12 rounded-2xl shadow-md bg-neutral-0 overflow-y-auto max-h-[100vh] bg-white">
                <p>Oi Modal</p>

                <button
                  className="bg-blue-400 text-white px-4 py-2"
                  onClick={() => setShowModal(false)}
                >
                  fechar modal
                </button>
              </Dialog.Content>
            </Dialog.Overlay>
          </Dialog.Root>
        </div>

        <div>
          <Dropdown.Root>
            <Dropdown.Trigger className="bg-blue-400 text-white px-4 py-2">
              abrir dropdown
            </Dropdown.Trigger>
            <Dropdown.Content
              collisionPadding={8}
              sideOffset={8}
              className="flex bg-white shadow-xl rounded-lg border border-neutral-100 w-20 h-28"
            >
              {[1, 2, 3].map((item) => (
                <Dropdown.Item key={item}>{item}</Dropdown.Item>
              ))}
            </Dropdown.Content>
          </Dropdown.Root>
        </div>

        <div>
          <Controller
            control={control}
            name="select"
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
                options={[
                  { label: 'Opção 1', value: '1' },
                  { label: 'Opção 2', value: '2' },
                  { label: 'Opção 3', value: '3' },
                ]}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="switch"
            control={control}
            render={({ field: { value, onChange, onBlur, ref } }) => (
              <Switch
                checked={value}
                className=""
                onCheckedChange={(e) => onChange(e)}
                onBlur={onBlur}
              />
            )}
          />
        </div>

        <div>
          <Tooltip text="Oi TNC!" className="text-black" />
        </div>

        <div>
          <Tooltip
            children={<Md18UpRating className="inline-block text-black" />}
            className="text-black"
          />
        </div>

        <div className="w-fit">
          <HoverIcon
            customTrigger={'Passe o mouse em cima de mim'}
            message="TNC melhor do mundo"
          />
        </div>

        <button type="submit" className="bg-blue-400 text-white px-4 py-2">
          Salvar
        </button>
      </form>
    </div>
  )
}
