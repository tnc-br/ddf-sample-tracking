import React from "react";
import { twMerge } from "tailwind-merge";

const ListContainer = React.forwardRef(
  (
    props: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    return (
      <div
        ref={ref}
        {...props}
        className={twMerge(
          "flex flex-col overflow-x-hidden bg-neutral-0 rounded border border-neutral-300 w-fit shadow-lg overflow-y-auto max-h-48",
          props.className
        )}
      />
    );
  }
);

ListContainer.displayName = "ListContainer";

export default ListContainer;
