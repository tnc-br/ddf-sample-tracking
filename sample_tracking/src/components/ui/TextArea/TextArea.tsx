import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export type TextAreaProps = {
  fill?: boolean;
  resize?: boolean;
  placeholder?: string;
  isErrored?: boolean;
  isValid?: boolean;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (props, ref) => {
    const {
      fill = true,
      isErrored = false,
      isValid = false,
      className,
      resize = true,
      ...inputProps
    } = props;

    const { disabled } = inputProps;

    const baseStyles =
      "p-2 border focus:outline-none text-xs transition duration-100 rounded-sm";

    const fillStyles = fill ? "bg-neutral-0" : "bg-transparent";

    const statusStyles = disabled
      ? "border-neutral-200 text-neutral-200"
      : isErrored
      ? "border-red-500 text-red-500"
      : isValid
      ? "border-green-500 text-green-500"
      : "border-neutral-300 text-neutral-600";

    const resizeStyles = resize ? "" : "resize-none";

    const combinedStyles = twMerge(
      baseStyles,
      fillStyles,
      statusStyles,
      resizeStyles,
      className
    );

    return <textarea {...inputProps} ref={ref} className={combinedStyles} />;
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
