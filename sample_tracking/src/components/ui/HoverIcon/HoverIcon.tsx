import React from 'react'
import { motion } from 'framer-motion'
import { IconType } from 'react-icons'
import { MdHelp } from 'react-icons/md'
import * as HoverCard from '@radix-ui/react-hover-card'

type HoverIconProps = {
  message?: string
  children?: React.ReactNode
  icon?: IconType
  customTrigger?: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
  className?: string
}

const HoverIcon = ({
  message,
  children,
  icon: Icon = MdHelp,
  customTrigger: CustomTrigger,
  onClick,
  className,
}: HoverIconProps) => {
  return (
    <HoverCard.Root openDelay={300} closeDelay={150}>
      <HoverCard.Trigger
        className={CustomTrigger ? 'w-fit' : 'text-neutral-600'}
      >
        {CustomTrigger ? CustomTrigger : <Icon className={className} />}
      </HoverCard.Trigger>
      <HoverCard.Content
        sideOffset={4}
        collisionPadding={8}
        className="z-10 cursor-default"
        onClick={onClick}
      >
        <motion.div
          className="whitespace-pre-wrap text-left text-xs bg-white bg-opacity-90 p-2.5 rounded-md shadow-md max-w-sm cursor-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.1 }}
        >
          <HoverCard.Arrow className="mx-4 fill-white" />
          {children}
          {message && (
            <span className="text-neutral-0 text-xs font-normal bg-white">
              {message}
            </span>
          )}
        </motion.div>
      </HoverCard.Content>
    </HoverCard.Root>
  )
}

export default HoverIcon
