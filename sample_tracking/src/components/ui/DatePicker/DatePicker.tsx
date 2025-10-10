import React from 'react'
import moment from 'moment'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { MdCalendarToday, MdClose } from 'react-icons/md'

import DropdownMenu from '../Dropdown'
import Calendar from '../Calendar'

interface DatePickerProps extends React.ComponentProps<typeof Calendar> {
  fill?: boolean
  shape?: 'square' | 'round' | 'line' | 'none'
  leftIcon?: boolean | React.ReactNode
  disabled?: boolean
  isErrored?: boolean
  closeOnSelect?: boolean
  showClear?: boolean
  placeholder?: string
  date?: Date | undefined
  onChange?: (date: Date | undefined) => void
  className?: string
  align?: 'start' | 'center' | 'end'
  minDate?: Date
  maxDate?: Date
  side?: 'top' | 'right' | 'bottom' | 'left'
  modal?: boolean
  dir?: 'ltr' | 'rtl'
  'data-testid'?: string
  'data-test-id'?: string
}

const DatePicker = (props: DatePickerProps) => {
  const {
    fill,
    leftIcon,
    shape,
    isErrored,
    disabled = false,
    onChange,
    date: value,
    closeOnSelect = true,
    className,
    showClear,
    placeholder = 'dd/mm/yyyy',
    align = 'start',
    side = 'bottom',
    modal = false,
    dir,
    'data-testid': dataTestId,
    'data-test-id': dataTestIdAlias,
    ...calendarProps
  } = props
  const [isOpen, setIsOpen] = React.useState(false)

  const formattedDate = value ? moment(value).format('DD/MM/YYYY') : placeholder

  const handleDateChange = (date: Date) => {
    onChange?.(date)
    if (closeOnSelect) setIsOpen(false)
  }

  const handleClear = () => {
    onChange?.(undefined)
  }

  return (
    <DropdownMenu.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      modal={modal}
      dir={dir}
    >
      <div
        data-testid={dataTestId}
        data-test-id={dataTestIdAlias}
        className={twMerge(
          clsx(
            'flex items-center gap-2',
            isOpen && 'ring-2 ring-orange-50',
            {
              'border rounded-3xl focus-within:ring-2 ring-orange-50':
                shape === 'round',
              'border rounded-sm focus-within:ring-2 ring-orange-50':
                shape === 'square',
              'border-0 border-b ring-transparent focus-within:shadow-orange-50':
                shape === 'line',
              'border-0 ring-transparent focus-within:shadow-orange-50':
                shape === 'none',
            },
            { 'bg-neutral-0': fill === true },
            {
              'border-neutral-300': !isErrored && !disabled,
              'border-neutral-200': disabled,
              'border-red-500': isErrored && !disabled,
            },
          ),
          className,
        )}
      >
        <DropdownMenu.Trigger className="flex items-center gap-2 focus:outline-none h-full w-full py-1 pl-2 cursor-pointer overflow-hidden">
          {leftIcon && (
            <MdCalendarToday
              className={clsx('w-4 h-4 min-w-min transition', {
                'text-neutral-200': disabled,
                'text-neutral-300': !isErrored && !disabled,
                'text-red-500': isErrored && !disabled,
              })}
            />
          )}
          <span
            className={clsx(
              'bg-transparent text-xs outline-none text-left w-full truncate',
              {
                'text-neutral-200': disabled,
                'text-neutral-300': !isErrored && !disabled && !value,
                'text-neutral-600': !isErrored && !disabled && value,
                'text-red-500': isErrored,
              },
              !showClear && 'pr-2',
            )}
          >
            {formattedDate}
          </span>
        </DropdownMenu.Trigger>
        {showClear && (
          <button
            onClick={handleClear}
            type="button"
            className={clsx('pr-2 hover:text-red-500', {
              'text-neutral-300': disabled,
              'text-neutral-400': !isErrored && !disabled,
            })}
          >
            <MdClose className="w-4 h-4 min-w-min cursor-pointer" />
          </button>
        )}
      </div>
      <DropdownMenu.Content
        sideOffset={8}
        collisionPadding={4}
        align={align}
        side={side}
        className="p-2 bg-white rounded-md shadow-md border"
      >
        <Calendar {...calendarProps} date={value} onChange={handleDateChange} />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export default DatePicker
