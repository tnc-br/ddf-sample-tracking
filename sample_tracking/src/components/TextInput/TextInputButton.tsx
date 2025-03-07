import React from 'react'
import clsx from 'clsx'
import { Slot } from '@radix-ui/react-slot'

export type TextInputButtonProps = {
  isValid?: boolean
  isErrored?: boolean
  paint?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const TextInputButton = (props: TextInputButtonProps) => {
  const {
    children,
    onClick,
    isValid = false,
    isErrored = false,
    paint = false,
    ...inputProps
  } = props

  const { disabled } = inputProps

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx('w-4 h-4', {
        'cursor-pointer': onClick != undefined && !disabled,
        'pointer-events-none': disabled,
      })}
    >
      <Slot
        className={clsx('w-4 h-6 min-w-min', {
          '[&_*]:text-neutral-300':
            !paint || (!isValid && !isErrored && !disabled),
          '[&_*]:text-neutral-200': disabled,
          '[&_*]:text-nice-mid': paint && isValid && !isErrored && !disabled,
          '[&_*]:text-alert-mid': paint && isErrored && !disabled,
        })}
      >
        {children}
      </Slot>
    </button>
  )
}

export default TextInputButton
