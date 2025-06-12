import clsx from 'clsx'
import Link from 'next/link'
import { MdOutlineArrowForward } from 'react-icons/md'

type CardProps = {
  qtty: number
  subtext: string
  variant?: 'inProgress' | 'completed'
  onClick: () => void
}

const Card = ({ qtty, subtext, variant, onClick }: CardProps) => {
  return (
    <div className="border border-[#DADADA] shadow-md rounded-2xl px-6 pb-2 w-96 h-40 flex items-end">
      <div className="text-[#1E1E1E] flex flex-col w-full gap-2">
        <h2 className="text-sm font-semibold">
          <span className="text-4xl">{qtty}</span> amostras
        </h2>
        <div className="flex justify-between items-center">
          <p
            className={clsx('rounded px-2.5 py-2', {
              'bg-[#F2F7F4] text-[#006E2C]': variant === 'inProgress',
              'bg-[#006E2C] text-white': variant === 'completed',
            })}
          >
            {subtext}
          </p>
          <button
            onClick={onClick}
            className="bg-[#006E2C] text-white rounded-full size-8 flex items-center justify-center"
          >
            <MdOutlineArrowForward />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Card
