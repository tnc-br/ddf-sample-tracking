import React, { useEffect, useLayoutEffect } from "react";
import { twMerge } from "tailwind-merge";
import { MdArrowDropDown } from "react-icons/md";

import List from "../List";
import Loader from "../Loader";
import Dropdown from "../Dropdown";
import TextInput from "../TextInput";

export type Option = {
  label: string;
  value: any;
  disabled?: boolean;
  icon?: React.ReactNode;
};

interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  fill?: boolean;
  shape?: "square" | "round" | "line" | "none";
  customTrigger?: React.ReactNode;
  isValid?: boolean;
  isErrored?: boolean;
  options?: Option[];
  value?: Option["value"];
  onChange?: (opt: Option["value"]) => void;
  onValueChange?: (opt: Option["value"]) => void;
  onOptionChange?: (opt: Option) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  contentClassName?: string;
  isSearchable?: boolean;
  customSearchFn?: (opt: Option, query: string) => boolean;
  modal?: boolean;
  dir?: "ltr" | "rtl";
}

const Select = (props: SelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [triggerWidth, setTriggerWidth] = React.useState(0);

  const triggerRef = React.createRef<HTMLDivElement>();
  const textInputRef = React.createRef<HTMLInputElement>();

  const {
    fill = false,
    shape = "square",
    customTrigger: CustomTrigger,
    isValid = false,
    isErrored = false,
    options = [],
    value,
    onChange,
    onValueChange,
    onOptionChange,
    placeholder = "Selecione...",
    disabled = false,
    loading = false,
    className,
    contentClassName,
    isSearchable = false,
    customSearchFn,
    modal = false,
    dir,
    ...rest
  } = props;

  useLayoutEffect(() => {
    const triggerDimensions = triggerRef.current?.getBoundingClientRect();
    setTriggerWidth(triggerDimensions?.width || 0);
  }, [triggerRef]);

  useEffect(() => {
    setSearchQuery("");
    if (!isOpen || !isSearchable) return;

    const handleKeyDown = () => {
      textInputRef.current?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSearchable]);

  const handleSelectOption = (opt: Option) => {
    onChange?.(opt.value);
    onValueChange?.(opt.value);
    onOptionChange?.(opt);
    setIsOpen(false);
  };

  const defaultSearchFn = (opt: Option, query: string) => {
    if (!query.trim()) return true;

    const parsedQuery = query
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

    const parsedLabel = opt.label
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    return parsedLabel.includes(parsedQuery);
  };

  const searchFn = customSearchFn ?? defaultSearchFn;

  const filteredOptions = options.filter((opt) => {
    if (!isSearchable) return true;
    return searchFn(opt, searchQuery);
  });

  const valueLabel = options?.find((opt) => opt.value === value)?.label;
  const iconLabel = options?.find((opt) => opt.value === value)?.icon ?? null;

  const emptyOptions = filteredOptions.length === 0;
  const showPlaceholder = !Boolean(valueLabel);
  const renderedValue = showPlaceholder ? placeholder : valueLabel;
  const renderedIcon = showPlaceholder ? null : iconLabel;

  const status = disabled
    ? "disabled"
    : isErrored
    ? "error"
    : isValid
    ? "valid"
    : "default";

  return (
    <Dropdown.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      modal={modal}
      dir={dir}
    >
      <Dropdown.Trigger asChild>
        {CustomTrigger ? (
          <div
            {...rest}
            ref={triggerRef}
            className={twMerge("w-fit", className)}
          >
            {CustomTrigger}
          </div>
        ) : (
          <div
            {...rest}
            ref={triggerRef}
            className={twMerge(
              SelectStyles({
                shape,
                fill,
                status,
              }),
              className
            )}
          >
            <div className="flex flex-row gap-1 items-center truncate">
              <div>{renderedIcon}</div>
              <span
                className={twMerge(
                  SelectTextStyles({
                    status,
                  }),
                  showPlaceholder && "text-neutral-300"
                )}
              >
                {renderedValue}
              </span>
            </div>

            <div className="flex items-center">
              {loading && <Loader size="XS" color="NEUTRAL_MID" />}
              <MdArrowDropDown
                className={twMerge(
                  SelectIconStyles({
                    status,
                    isOpen,
                  })
                )}
              />
            </div>
          </div>
        )}
      </Dropdown.Trigger>
      <Dropdown.Content
        sideOffset={8}
        collisionPadding={4}
        align="start"
        style={{ width: triggerWidth }}
      >
        <List.Container
          className={twMerge(
            "w-full",
            CustomTrigger && "min-w-48",
            contentClassName
          )}
        >
          {isSearchable && (
            <TextInput
              shape="none"
              ref={textInputRef}
              value={searchQuery}
              onKeyDown={(e) => e.stopPropagation()}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar..."
              className="w-full"
              leftIcon={<TextInput.SearchIcon />}
            />
          )}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.map((opt, i) => (
              <Dropdown.Item
                asChild
                key={`${i}_${opt.label}`}
                textValue={opt.label}
              >
                <List.Item
                  disabled={opt.disabled}
                  selected={opt.value === value}
                  onClick={() => handleSelectOption(opt)}
                  className="flex flex-row w-full gap-1 items-center"
                  size="xs"
                >
                  <div className="[&_*]:text-md">{opt.icon ?? null}</div>
                  <span>{opt.label}</span>
                </List.Item>
              </Dropdown.Item>
            ))}
            {emptyOptions && (
              <List.Item disabled>Nenhuma opção disponível</List.Item>
            )}
          </div>
        </List.Container>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

export default Select;
