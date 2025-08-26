'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Step from '../step'
import { MdArrowBack } from 'react-icons/md'
import ReviewSample from './ReviewSample'
import SampleMeasurementsTab from './SampleMeasurementTab'

const sampleSchema = z.object({
  sampleName: z.string().min(1, 'Nome da amostra é obrigatório'),
  status: z.string().optional(),
  species: z.string().optional(),
  origin: z.string().optional(),
  collectionLocation: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  state: z.string().optional(),
  municipality: z.string().optional(),
  supplier: z.string().optional(),
  city: z.string().optional(),
})

type SampleFormData = z.infer<typeof sampleSchema>

const STEPS = [
  {
    id: '1',
    name: 'Adicionar Detalhe',
  },
  {
    id: '2',
    name: 'Adicionar Medições de Amostra',
  },
  {
    id: '3',
    name: 'Revise e Crie',
  },
]

export default function AddNewSample() {
  const [activeTab, setActiveTab] = useState('fornecedor')

  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SampleFormData>({
    resolver: zodResolver(sampleSchema),
    defaultValues: {
      sampleName: '',
      status: '',
      species: '',
      origin: '',
      collectionLocation: '',
      latitude: '',
      longitude: '',
      state: '',
      municipality: '',
      supplier: '',
      city: '',
    },
  })

  const onSubmit = (data: SampleFormData) => {
    console.log('Form data:', data)
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex gap-2.5">
          <div className="bg-[#F7F7F7] size-6 rounded text-[#006E2C] flex items-center justify-center">
            <MdArrowBack className="text-base" />
          </div>
          <span className="bg-white">Voltar</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Adicionar Medições de Amostra
        </h1>
        <div></div>
      </div>
      <div className="my-4">
        <Step steps={STEPS} currentStepIndex={1} />
      </div>

      <SampleMeasurementsTab
        formData={{}}
        onCancelClick={() => {}}
        nextTab={() => {}}
        onSave={() => {}}
      />
    </>
  )

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex gap-2.5">
          <div className="bg-[#F7F7F7] size-6 rounded text-[#006E2C] flex items-center justify-center">
            <MdArrowBack className="text-base" />
          </div>
          <span className="bg-white">Voltar</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Adicionar Nova Amostra
        </h1>
        <div></div>
      </div>
      <div className="max-w-6xl mx-auto p-6">
        <Step steps={STEPS} currentStepIndex={currentStepIndex} />

        <div className="flex justify-between items-center mt-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Preencha abaixo os detalhes
            </h1>
            <p className="text-gray-600">
              Obs: os campos abaixo são todos obrigatórios
            </p>
          </div>

          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setActiveTab('fornecedor')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'fornecedor'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Fornecedor
            </button>
            <button
              onClick={() => setActiveTab('minha-organizacao')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'minha-organizacao'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Minha Organização
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Nome da amostra */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da amostra:
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className=" rounded-full w-full px-4 py-3 border border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('sampleName')}
              />
              {errors.sampleName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.sampleName.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status:
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className=" rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('status')}
              />
            </div>

            {/* Espécies */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Espécies:
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className=" rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('species')}
              />
            </div>

            {/* Origem */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origem:
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className=" rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('origin')}
              />
            </div>

            {/* Local de Coleta */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Local de Coleta:
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className=" rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('collectionLocation')}
              />
            </div>

            {/* Latitude */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude:
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className=" rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('latitude')}
              />
            </div>

            {/* Longitude */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude:
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className=" rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('longitude')}
              />
            </div>

            {/* Estado */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado:
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className=" rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('state')}
              />
            </div>

            {/* Município */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Município:
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className=" rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('municipality')}
              />
            </div>

            {/* Fornecedor */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fornecedor:
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className=" rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('supplier')}
              />
            </div>

            {/* Cidade */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cidade:
              </label>
              <input
                type="text"
                placeholder="Digite aqui..."
                className=" rounded-full w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                {...register('city')}
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
    </>
  )
}
