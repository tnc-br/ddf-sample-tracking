import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import MaskedInput from "react-text-mask";
import {
  MdOutlineSearch,
  MdOutlineClose,
  MdError,
  MdCheckCircle,
  MdPhone,
} from "react-icons/md";

import TextInputButton from "./TextInputButton";

export type TextInputProps = {
  fill?: boolean;
  shape?: "square" | "round" | "line" | "none";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftIconClick?: () => void;
  onRightIconClick?: () => void;
  isValid?: boolean;
  isErrored?: boolean;
  paintLeftIcon?: boolean;
  paintRightIcon?: boolean;
  inputClassName?: string;
  mask?: Array<string | RegExp>;
} & Omit<React.ComponentPropsWithoutRef<typeof MaskedInput>, "mask">;

const getContainerClasses = ({
  shape,
  fill,
  status,
}: {
  shape: "square" | "round" | "line" | "none";
  fill: boolean;
  status: "valid" | "error" | "disabled" | "default";
}) => {
  const baseClasses = "flex items-center gap-2 h-8 p-2 transition duration-100";
  const fillClasses = fill ? "bg-neutral-0" : "bg-transparent";

  const shapeClasses = {
    round: "border rounded-3xl",
    square: "border rounded-sm",
    line: "border-0 border-b",
    none: "",
  }[shape];

  const statusClasses = {
    valid: "border-green-500",
    error: "border-red-500",
    disabled: "border-neutral-200 pointer-events-none",
    default: "border-neutral-300",
  }[status];

  const focusClasses = {
    round: "focus-within:ring-2 ring-green-100",
    square: "focus-within:ring-2 ring-green-100",
    line: "focus-within:shadow-input-line-green-100",
    none: "focus-within:shadow-input-none-green-100",
  }[shape];

  return twMerge(
    baseClasses,
    fillClasses,
    shapeClasses,
    statusClasses,
    focusClasses
  );
};

const getTextInputClasses = ({
  status,
}: {
  status: "valid" | "error" | "disabled" | "default";
}) => {
  const baseClasses =
    "w-full text-xs whitespace-nowrap overflow-hidden overflow-ellipsis bg-transparent outline-none placeholder:text-neutral-300";

  const statusClasses = {
    valid: "text-green-500",
    error: "text-red-500",
    disabled: "text-neutral-200",
    default: "text-neutral-600",
  }[status];

  return twMerge(baseClasses, statusClasses);
};

const TextInput = forwardRef(
  (props: TextInputProps, ref: React.ForwardedRef<HTMLInputElement>) => {
    const {
      fill = true,
      leftIcon: LeftIcon,
      onLeftIconClick,
      rightIcon: RightIcon,
      onRightIconClick,
      shape = "square",
      isValid = false,
      isErrored = false,
      paintLeftIcon = false,
      paintRightIcon = false,
      className = "",
      inputClassName = "",
      ...inputProps
    } = props;

    const { disabled } = inputProps;

    const status = disabled
      ? "disabled"
      : isErrored
      ? "error"
      : isValid
      ? "valid"
      : "default";

    return (
      <div
        className={twMerge(
          getContainerClasses({ shape, fill, status }),
          className
        )}
      >
        {LeftIcon && (
          <TextInputButton
            onClick={onLeftIconClick}
            paint={paintLeftIcon}
            isValid={isValid}
            isErrored={isErrored}
          >
            {LeftIcon}
          </TextInputButton>
        )}

        <input
          ref={ref}
          {...inputProps}
          className={twMerge(getTextInputClasses({ status }), inputClassName)}
        />

        {RightIcon && (
          <TextInputButton
            onClick={onRightIconClick}
            paint={paintRightIcon}
            isValid={isValid}
            isErrored={isErrored}
          >
            {RightIcon}
          </TextInputButton>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

Object.defineProperties(TextInput, {
  SearchIcon: { value: MdOutlineSearch },
  ClearIcon: { value: MdOutlineClose },
  ErrorIcon: { value: MdError },
  SuccessIcon: { value: MdCheckCircle },
  PhoneIcon: { value: MdPhone },
});

export default TextInput as typeof TextInput & {
  SearchIcon: typeof MdOutlineSearch;
  ClearIcon: typeof MdOutlineClose;
  ErrorIcon: typeof MdError;
  SuccessIcon: typeof MdCheckCircle;
  PhoneIcon: typeof MdPhone;
};
