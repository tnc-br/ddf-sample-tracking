import React, { forwardRef } from "react";

import Checkbox from "../Checkbox";
import { twMerge } from "tailwind-merge";

export interface ListCheckboxItemProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  > {
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const ListCheckboxItem = forwardRef(
  (
    {
      selected = false,
      disabled = false,
      children,
      onClick,
      ...props
    }: ListCheckboxItemProps,
    ref: React.ForwardedRef<HTMLLabelElement>
  ) => {
    return (
      <label
        {...props}
        ref={ref}
        className={twMerge(
          "group flex gap-1 items-center outline-none break-words w-full p-2 text-left text-xs cursor-pointer transition",
          props.className
        )}
      >
        <Checkbox
          checked={selected}
          disabled={disabled}
          onClick={onClick}
          size="sm"
        />{" "}
        <span className="text-xs">{children}</span>
      </label>
    );
  }
);

ListCheckboxItem.displayName = "ListCheckboxItem";

export default ListCheckboxItem;
