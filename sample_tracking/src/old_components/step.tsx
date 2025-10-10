import React from 'react'
import clsx from 'clsx'

type Step = {
  id: string
  name: string
}

type Props = {
  steps: Step[]
  currentStepIndex: number
  onStepClick?: (step: Step) => void
}

const Step = ({ steps, currentStepIndex }: Props) => {
  return (
    <div className="md:flex flex-col gap-2 max-md:hidden">
      <div className="relative flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center w-32">
            <span
              className={clsx('text-sm font-bold', {
                'text-[#006E2C]': currentStepIndex >= index,
                'text-[#9496A1]': currentStepIndex < index,
              })}
            >
              Passo {index + 1}
            </span>
            <span
              className={clsx('text-xs font-bold text-center', {
                'text-[#1E1E1E]': currentStepIndex >= index,
                'text-[#757575]': currentStepIndex < index,
              })}
            >
              {step.name}
            </span>
          </div>
        ))}
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center w-full absolute px-16">
          <div
            className="h-1 bg-[#006E2C]"
            style={{
              width: `${(currentStepIndex * 100) / (steps.length - 1)}%`,
            }}
          />
          <div
            className="h-1 bg-[#D9D9D9]"
            style={{
              width: `${100 - (currentStepIndex * 100) / (steps.length - 1)}%`,
            }}
          />
        </div>
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="w-32 overflow-hidden flex items-center justify-center"
            style={{
              zIndex: 1,
            }}
          >
            <span
              className={clsx(
                'aspect-square w-9 h-9 rounded-full text-neutral-0 flex items-center justify-center font-semibold',
                {
                  'bg-[#006E2C] text-white': currentStepIndex >= index,
                  'bg-[#D9D9D9] text-[#006E2C]': currentStepIndex < index,
                },
              )}
            >
              {index + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Step
