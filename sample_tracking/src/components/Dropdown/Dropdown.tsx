import React from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

import * as RadixDropdown from "@radix-ui/react-dropdown-menu";

const DropdownRoot = (
  props: React.ComponentProps<typeof RadixDropdown.Root>
) => <RadixDropdown.Root modal={false} {...props} />;

type DropdownTriggerProps = React.ComponentProps<typeof RadixDropdown.Trigger>;
const DropdownTrigger = (props: DropdownTriggerProps) => {
  return <RadixDropdown.Trigger {...props} />;
};

type DropdownContentProps = React.ComponentProps<typeof motion.div> &
  React.ComponentProps<typeof RadixDropdown.Content>;
const DropdownContent = ({
  children,
  className,
  initial,
  animate,
  exit,
  transition,
  ...props
}: DropdownContentProps) => {
  const motionProps = {
    initial,
    animate,
    exit,
    transition,
    className,
  };

  return (
    <RadixDropdown.Content asChild {...props}>
      <motion.div
        initial={motionProps.initial ?? { opacity: 0, y: -10 }}
        animate={
          motionProps.animate ?? {
            opacity: 1,
            y: 0,
          }
        }
        exit={
          motionProps.exit ?? {
            opacity: 0,
            y: -10,
          }
        }
        transition={
          motionProps.transition ?? { duration: 0.2, ease: "easeInOut" }
        }
        className={twMerge("z-10", className)}
      >
        {children}
      </motion.div>
    </RadixDropdown.Content>
  );
};

type DropdownPortalProps = React.ComponentProps<typeof RadixDropdown.Portal>;
const DropdownPortal = (props: DropdownPortalProps) => {
  return <RadixDropdown.Portal forceMount {...props} />;
};

const Dropdown = {
  Root: DropdownRoot,
  Trigger: DropdownTrigger,
  Portal: DropdownPortal,
  Content: DropdownContent,
  Item: RadixDropdown.Item,
  Group: RadixDropdown.Group,
  Label: RadixDropdown.Label,
  CheckboxItem: RadixDropdown.CheckboxItem,
  RadioGroup: RadixDropdown.RadioGroup,
  RadioItem: RadixDropdown.RadioItem,
  ItemIndicator: RadixDropdown.ItemIndicator,
  Separator: RadixDropdown.Separator,
  Arrow: RadixDropdown.Arrow,
  Sub: RadixDropdown.Sub,
  SubTrigger: RadixDropdown.SubTrigger,
  SubContent: RadixDropdown.SubContent,
};

export default Dropdown;
