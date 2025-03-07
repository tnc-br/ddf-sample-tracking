import React from 'react'
import * as RadixSwitch from '@radix-ui/react-switch'
import { twMerge } from 'tailwind-merge'

type RootSwitchProps = React.ComponentProps<typeof RadixSwitch.Root>

type SwitchProps = {
  intent?: 'choice' | 'toggle'
  size?: 'SM' | 'MD'
} & RootSwitchProps

const Switch = ({
  intent = 'toggle',
  size = 'SM',
  className,
  ...props
}: SwitchProps) => {
  const containerBaseStyles =
    'relative focus:outline-none transition duration-100 rounded-full group'
  const thumbBaseStyles =
    'block aspect-square rounded-full transition duration-100 will-change-transform transform translate-x-0'

  const containerStyles = twMerge(
    containerBaseStyles,
    size === 'SM' ? 'w-[24px] h-[12px]' : 'w-[40px] h-[20px]',
    intent === 'choice' && 'disabled:bg-neutral-100 bg-green-400',
    intent === 'toggle' &&
      'bg-neutral-200 disabled:!bg-neutral-100 data-[state=checked]:bg-green-400',
    className,
  )

  const thumbStyles = twMerge(
    thumbBaseStyles,
    size === 'SM'
      ? 'border w-[11px] data-[state=checked]:translate-x-[13px]'
      : 'border-2 w-[18px] data-[state=checked]:translate-x-[22px]',
    intent === 'choice' &&
      'bg-neutral-0 border-green-400 group-disabled:border-neutral-100',
    intent === 'toggle' &&
      'bg-neutral-0 border-neutral-200 group-disabled:border-neutral-100 data-[state=checked]:border-green-400',
  )

  return (
    <RadixSwitch.Root {...props} className={containerStyles}>
      <RadixSwitch.Thumb className={thumbStyles} />
    </RadixSwitch.Root>
  )
}

export default Switch
