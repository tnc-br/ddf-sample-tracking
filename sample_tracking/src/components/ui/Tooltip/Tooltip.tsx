import React from 'react'
import { MdHelpOutline } from 'react-icons/md'

import HoverIcon from '../HoverIcon'
import { twMerge } from 'tailwind-merge'

type Props = {
  text?: string
  children?: React.ReactNode
  className?: string
}

const InfoDummy = ({ text, children, className }: Props) => {
  return (
    <HoverIcon
      icon={() => (
        <MdHelpOutline className="inline-block [&_*]:!text-neutral-400 w-4 h-4" />
      )}
    >
      {text && (
        <p className={twMerge(className, 'flex flex-col gap-4 text-xs')}>
          {text}
        </p>
      )}
      {children && children}
    </HoverIcon>
  )
}

export default InfoDummy
