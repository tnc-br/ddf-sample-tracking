'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Step from '../step'
import { MdArrowBack } from 'react-icons/md'
import BasicInfoTab from './BasicInfoTab'
import SampleMeasurementsTab from './SampleMeasurementTab'
import ReviewSample from './ReviewSample'
import { SampleCompleteSchema, type SampleFormData } from './sample-schema'
import { Sample } from '../utils'
import { useRouter } from 'next/router'

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

interface AddNewSampleProps {
  defaultValue?: Partial<Sample>
  onActionButtonClick: (id: string, data: Partial<Sample>) => void
  actionButtonTitle: string
  isNewSampleForm: boolean
  sampleId: string
}

export default function AddNewSample({
  defaultValue,
  onActionButtonClick,
  actionButtonTitle,
  isNewSampleForm,
  sampleId,
}: AddNewSampleProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  // Initialize form data with default values
  const [formData, setFormData] = useState<any>({
    collected_by: 'supplier',
    status: 'concluded',
    trusted: 'trusted',
    d18O_cel: [''],
    d18O_wood: [''],
    d15N_wood: [''],
    n_wood: [''],
    d13C_wood: [''],
    c_wood: [''],
    c_cel: [''],
    d13C_cel: [''],
    ...defaultValue,
  })

  const router = useRouter()

  // Handlers para navegação entre abas
  const handleNextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  // Handler para salvar dados de cada etapa
  const handleSaveStepData = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }))
  }

  // Handler para alternar entre Fornecedor/Organização
  const handleChangeCollectedBy = (type: 'supplier' | 'my_org') => {
    setFormData((prev: any) => ({ ...prev, collected_by: type }))
  }

  // Handler final de submissão
  const handleFinalSubmit = () => {
    // Validar dados finais com Zod
    try {
      const validatedData = SampleCompleteSchema.parse(formData)
      onActionButtonClick(sampleId, validatedData as Partial<Sample>)
    } catch (error) {
      console.error('Erro de validação:', error)
      alert('Por favor, preencha todos os campos obrigatórios corretamente.')
    }
  }

  // Renderização do conteúdo baseado na etapa atual
  const renderStepContent = () => {
    switch (currentStepIndex) {
      case 0:
        return (
          <BasicInfoTab
            formData={formData}
            onSave={handleSaveStepData}
            nextTab={handleNextStep}
            onChangeClickSupplier={() => handleChangeCollectedBy('supplier')}
            onChangeClickMyOrg={() => handleChangeCollectedBy('my_org')}
          />
        )
      case 1:
        return (
          <SampleMeasurementsTab
            formData={formData}
            onSave={handleSaveStepData}
            nextTab={handleNextStep}
            onCancelClick={handlePreviousStep}
          />
        )
      case 2:
        return (
          <ReviewSample
            formData={formData}
            onNextClick={handleFinalSubmit}
            onCancelClick={handlePreviousStep}
          />
        )
      default:
        return null
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      handlePreviousStep()
      return
    }

    router.push(`/samples`)
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2.5 cursor-pointer" onClick={handleBack}>
          <div className="bg-[#F7F7F7] size-6 rounded text-[#006E2C] flex items-center justify-center">
            <MdArrowBack className="text-base" />
          </div>
          <span className="bg-white">Voltar</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {STEPS[currentStepIndex].name}
        </h1>
        <div></div>
      </div>

      <div className="my-6">
        <Step steps={STEPS} currentStepIndex={currentStepIndex} />
      </div>

      <div className="mt-8">{renderStepContent()}</div>
    </>
  )
}
