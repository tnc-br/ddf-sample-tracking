import React, { forwardRef } from "react";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { MdHorizontalRule, MdOutlineCheck } from "react-icons/md";
import { twMerge } from "tailwind-merge";

type RootCheckboxProps = React.ComponentProps<typeof RadixCheckbox.Root>;
type CheckboxProps = {
  size?: "sm" | "md";
  isErrored?: boolean;
} & RootCheckboxProps;

const SIZE_DICT = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
};

const SIZE_DICT_TEXT = {
  sm: "text-2xs [&_*]:text-2xs",
  md: "text-xs [&_*]:text-xs",
};

const Checkbox = forwardRef(
  (
    { size = "md", isErrored = false, ...props }: CheckboxProps,
    ref: React.ForwardedRef<React.ElementRef<typeof RadixCheckbox.Root>>
  ) => {
    return (
      <RadixCheckbox.Root
        {...props}
        ref={ref}
        className={twMerge(
          "border-solid flex items-center justify-center transition aspect-square border-[0.5px] rounded-sm bg-neutral-0 border-neutral-300 min-w-fit hover:bg-neutral-100 duration transition-100 disabled:bg-neutral-100 disabled:border-neutral-100 disabled:pointer-events-none data-[state=checked]:disabled:bg-neutral-100 data-[state=checked]:disabled:border-neutral-100 data-[state=indeterminate]:disabled:bg-neutral-100 data-[state=indeterminate]:disabled:border-neutral-100",
          SIZE_DICT[size],
          props.className
        )}
      >
        <RadixCheckbox.Indicator
          className={twMerge(
            "flex items-center justify-center transition aspect-square [&_*]:text-neutral-0",
            SIZE_DICT_TEXT[size]
          )}
        >
          {props.checked === "indeterminate" && <MdHorizontalRule />}
          {props.checked === true && <MdOutlineCheck />}
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
