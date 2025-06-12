import React from 'react'
import moment from 'moment'
import { CalendarProps } from 'react-date-range'
import { MdChevronLeft, MdChevronRight, MdExpandMore } from 'react-icons/md'

import Dropdown from '../Dropdown'

import List from '../List'

const CustomCalendarNavigator = (
  currentFocusedDate: Date,
  changeShownDate: (
    value: string | number | Date,
    mode?: 'set' | 'setYear' | 'setMonth' | 'monthOffset' | undefined,
  ) => void,
  props: CalendarProps,
) => {
  const { showMonthArrow, minDate, maxDate, showMonthAndYearPickers } = props

  const upperYearLimit =
    maxDate?.getFullYear() || moment().add(10, 'year').year()
  const lowerYearLimit = minDate?.getFullYear() || 1900

  const monthOptions = moment.months().map((month, index) => ({
    value: index,
    label: month,
  }))

  const yearOptions = Array.from(
    { length: upperYearLimit - lowerYearLimit + 1 },
    (_, i) => ({
      value: lowerYearLimit + i,
      label: lowerYearLimit + i,
    }),
  )

  return (
    <div className="flex flex-col items-center w-full border-b border-neutral-200">
      {showMonthAndYearPickers && (
        <Dropdown.Root>
          <Dropdown.Trigger
            type="button"
            className="flex items-center justify-between gap-1 focus:outline-none"
          >
            <span className="font-bold text-xl text-neutral-600">
              {moment(currentFocusedDate).format('YYYY')}
            </span>
            <MdExpandMore className="text-2xl [&_*]:text-neutral-600" />
          </Dropdown.Trigger>
          <Dropdown.Content asChild sideOffset={5}>
            <List.Container className="z-50 w-24">
              {yearOptions.map((year) => {
                const isSelected =
                  moment(currentFocusedDate).year() === year.value

                return (
                  <List.Item
                    key={year.value}
                    onClick={() => {
                      changeShownDate(year.value, 'setYear')
                    }}
                    selected={isSelected}
                  >
                    {year.label}
                  </List.Item>
                )
              })}
            </List.Container>
          </Dropdown.Content>
        </Dropdown.Root>
      )}
      <div className="flex justify-between items-center w-full">
        {showMonthArrow && (
          <button
            type="button"
            className="rounded-full p-2 hover:bg-neutral-100 transition disabled:hover:bg-transparent disabled:cursor-default [&_*]:text-neutral-600 [&_*]:disabled:text-neutral-200"
            onClick={() => changeShownDate(-1, 'monthOffset')}
            disabled={moment(currentFocusedDate).isSameOrBefore(
              minDate,
              'month',
            )}
          >
            <MdChevronLeft className="text-xl" />
          </button>
        )}
        {showMonthAndYearPickers && (
          <Dropdown.Root>
            <Dropdown.Trigger
              type="button"
              className="flex items-center justify-between gap-1 focus:outline-none"
            >
              <span className="font-bold text-sm text-neutral-600">
                {moment(currentFocusedDate).format('MMMM')}
              </span>
              <MdExpandMore
                type="button"
                className="text-lg [&_*]:text-neutral-600"
              />
            </Dropdown.Trigger>
            <Dropdown.Content asChild sideOffset={5}>
              <List.Container className="z-50 w-28">
                {monthOptions.map((month) => {
                  const isAboveMaxDate =
                    maxDate &&
                    moment(currentFocusedDate).year() >= upperYearLimit &&
                    month.value > maxDate?.getMonth()
                  const isBelowMinDate =
                    minDate &&
                    moment(currentFocusedDate).year() <= lowerYearLimit &&
                    month.value < minDate?.getMonth()

                  const isSelected =
                    moment(currentFocusedDate).month() === month.value

                  return (
                    <List.Item
                      key={month.value}
                      onClick={() => {
                        changeShownDate(month.value, 'setMonth')
                      }}
                      disabled={isAboveMaxDate || isBelowMinDate}
                      selected={isSelected}
                    >
                      {month.label}
                    </List.Item>
                  )
                })}
              </List.Container>
            </Dropdown.Content>
          </Dropdown.Root>
        )}
        {showMonthArrow && (
          <button
            type="button"
            className="rounded-full p-2 hover:bg-neutral-100 transition disabled:hover:bg-transparent disabled:cursor-default [&_*]:text-neutral-600 [&_*]:disabled:text-neutral-200"
            onClick={() => changeShownDate(1, 'monthOffset')}
            disabled={moment(currentFocusedDate).isSameOrAfter(
              maxDate,
              'month',
            )}
          >
            <MdChevronRight className="text-xl [&_*]:text-neutral-600" />
          </button>
        )}
      </div>
    </div>
  )
}

export default CustomCalendarNavigator
