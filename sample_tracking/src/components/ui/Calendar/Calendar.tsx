import React from 'react'
import { Calendar as CalendarComponent } from 'react-date-range'

import ptLocale from 'date-fns/locale/pt-BR'
import CustomCalendarNavigator from './CustomCalendarNavigator'

import 'react-date-range/dist/styles.css' // main style file
import 'react-date-range/dist/theme/default.css' // theme css file

type CalendarProps = React.ComponentProps<typeof CalendarComponent>

const Calendar = (props: CalendarProps) => {
  return (
    <CalendarComponent
      editableDateInputs={true}
      locale={ptLocale}
      dateDisplayFormat="dd/MM/yyyy"
      dayDisplayFormat="dd"
      weekdayDisplayFormat="eeeee"
      maxDate={new Date()}
      navigatorRenderer={CustomCalendarNavigator}
      {...props}
    />
  )
}

export default Calendar
