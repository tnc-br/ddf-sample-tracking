import React, { useEffect } from "react";
import { twMerge } from "tailwind-merge";

export interface ListItemProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  selected?: boolean;
  disabled?: boolean;
  size?: "xs" | "sm";
}

const ListItem = React.forwardRef(
  (
    {
      selected = false,
      size = "xs",
      disabled = false,
      className,
      ...props
    }: ListItemProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    const itemRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (selected && itemRef?.current)
        itemRef.current.scrollIntoView({
          block: "nearest",
        });
    }, [selected]);

    return (
      <div
        {...props}
        ref={(el) => {
          Object.assign(itemRef, { current: el });
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        className={twMerge(
          "outline-none break-words w-full p-2 text-left cursor-pointer transition",
          className
        )}
      />
    );
  }
);

ListItem.displayName = "ListItem";

export default ListItem;
