import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

import MaskedInput from "react-text-mask";
import {
  MdOutlineSearch,
  MdOutlineClose,
  MdError,
  MdCheckCircle,
  MdPhone,
} from "react-icons/md";

import { Slot } from "@radix-ui/react-slot";

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

export type TextInputButtonProps = {
  isValid?: boolean;
  isErrored?: boolean;
  paint?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const TextInputButton = (props: TextInputButtonProps) => {
  const {
    children,
    onClick,
    isValid = false,
    isErrored = false,
    paint = false,
    ...inputProps
  } = props;

  const { disabled } = inputProps;

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx("w-4 h-4", {
        "cursor-pointer": onClick != undefined && !disabled,
        "pointer-events-none": disabled,
      })}
    >
      <Slot
        className={clsx("w-4 h-4 min-w-min", {
          "[&_*]:text-neutral-300":
            !paint || (!isValid && !isErrored && !disabled),
          "[&_*]:text-neutral-200": disabled,
          "[&_*]:text-nice-mid": paint && isValid && !isErrored && !disabled,
          "[&_*]:text-alert-mid": paint && isErrored && !disabled,
        })}
      >
        {children}
      </Slot>
    </button>
  );
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
        className={clsx(
          "flex items-center gap-2 h-8 p-2 transition duration-100",
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
          className={clsx(
            "w-full text-xs whitespace-nowrap overflow-hidden overflow-ellipsis bg-transparent outline-none placeholder:text-neutral-300",
            inputClassName
          )}
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
