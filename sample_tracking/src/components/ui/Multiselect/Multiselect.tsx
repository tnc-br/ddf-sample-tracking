/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useLayoutEffect } from "react";
import { MdArrowDropDown } from "react-icons/md";
import { twMerge } from "tailwind-merge";

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

const MultiSelectBaseClasses =
  "flex items-center justify-between gap-2 h-8 p-2 cursor-pointer transition duration-100";

const MultiSelectShapeClasses = {
  round: "border rounded-3xl",
  square: "border rounded-sm",
  line: "border-0 border-b",
  none: "",
};

const MultiSelectFillClasses = {
  true: "bg-neutral-0",
  false: "bg-transparent",
};

const MultiSelectStatusClasses = {
  valid: "border-green-500",
  error: "border-red-500",
  disabled: "border-neutral-200 pointer-events-none",
  default: "border-neutral-300",
};

const MultiSelectTextBaseClasses = "text-xs truncate";
const MultiSelectTextStatusClasses = {
  valid: "text-green-500",
  error: "text-red-500",
  disabled: "text-neutral-200",
  default: "text-neutral-600",
};

const MultiSelectIconBaseClasses = "text-lg transition duration-100 transform";
const MultiSelectIconStatusClasses = {
  valid: "[&_*]:text-green-500",
  error: "[&_*]:text-red-500",
  disabled: "[&_*]:text-neutral-200",
  default: "[&_*]:text-neutral-300",
};
const MultiSelectIconOpenClasses = {
  true: "rotate-180",
  false: "rotate-0",
};

interface MultiSelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  fill?: boolean;
  shape?: "square" | "round" | "line" | "none";
  customTrigger?: React.ReactNode;
  isValid?: boolean;
  isErrored?: boolean;
  options?: Option[];
  value: Option[];
  onChange?: (opts: Option[]) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  contentClassName?: string;
  isSearchable?: boolean;
  hasSelectAll?: boolean;
  renderSelectedNumber?: boolean;
  modal?: boolean;
  dir?: "ltr" | "rtl";
  customSearchFn?: (opt: Option, query: string) => boolean;
  customValueRender?: (opts: Option[]) => React.ReactNode;
}

const MultiSelect = (props: MultiSelectProps) => {
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
    placeholder = "Selecione...",
    disabled = false,
    loading = false,
    className,
    contentClassName,
    isSearchable = false,
    hasSelectAll = false,
    renderSelectedNumber = false,
    modal = false,
    dir,
    customSearchFn,
    customValueRender,
    ...rest
  } = props;

  if (!Array.isArray(value)) {
    throw new Error(
      "The value prop on MultiSelect must be an array of options"
    );
  }

  if (!Array.isArray(options)) {
    throw new Error(
      "The options prop on MultiSelect must be an array of options"
    );
  }

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
    if (opt.disabled) return;

    const isSelected = value.some((v) => v.value === opt.value);

    if (isSelected) {
      const newValue = value.filter((v) => v.value !== opt.value);
      onChange?.(newValue);
    } else {
      onChange?.([...value, opt]);
    }
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

  const searchFn = customSearchFn || defaultSearchFn;

  const filteredOptions = options.filter((opt) => {
    if (!isSearchable) return true;
    return searchFn(opt, searchQuery);
  });

  const emptyOptions = filteredOptions.length === 0;

  const getSelectedNumberText = () => {
    if (value.length === 0) return placeholder;

    const values = value.map((v) => v.value);
    const optionsValues = options.map((o) => o.value);
    if (optionsValues.every((v) => values.includes(v))) return "Todos";

    if (value.length === 1) return "1 selecionado";
    return `${value.length} selecionados`;
  };

  const valueLabel = renderSelectedNumber
    ? getSelectedNumberText()
    : value.map((opt) => opt.label).join(", ");

  const showPlaceholder = !Boolean(valueLabel);
  const renderedValue = showPlaceholder ? placeholder : valueLabel;

  const handleSelectAll = () => {
    const isAllSelected = filteredOptions.every((opt) =>
      value.some((v) => v.value === opt.value)
    );

    if (isAllSelected) {
      const valuesToSelect = value.filter(
        (v) => !filteredOptions.some((opt) => opt.value === v.value)
      );
      onChange?.(valuesToSelect);
    } else {
      const valuesToSelect = filteredOptions.filter(
        (opt) => !value.some((v) => v.value === opt.value)
      );
      onChange?.([...value, ...valuesToSelect]);
    }
  };

  const status = disabled
    ? "disabled"
    : isErrored
    ? "error"
    : isValid
    ? "valid"
    : "default";

  const multiSelectClasses = twMerge(
    MultiSelectBaseClasses,
    MultiSelectShapeClasses[shape],
    MultiSelectFillClasses[String(fill) as keyof typeof MultiSelectFillClasses],
    MultiSelectStatusClasses[status],
    className
  );

  const textClasses = twMerge(
    MultiSelectTextBaseClasses,
    MultiSelectTextStatusClasses[status],
    showPlaceholder && "text-neutral-300"
  );

  const iconClasses = twMerge(
    MultiSelectIconBaseClasses,
    MultiSelectIconStatusClasses[status],
    MultiSelectIconOpenClasses[
      String(isOpen) as keyof typeof MultiSelectIconOpenClasses
    ]
  );

  const showSelectAll = hasSelectAll && !emptyOptions;

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
            className={twMerge(multiSelectClasses, className)}
          >
            <span
              className={twMerge(
                textClasses,

                showPlaceholder && "text-neutral-300"
              )}
            >
              {customValueRender ? customValueRender(value) : renderedValue}
            </span>
            <div className="flex items-center">
              {loading && <Loader size="LG" color="NEUTRAL_HIGH" />}
              <MdArrowDropDown className={iconClasses} />
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
              isErrored={isErrored}
              isValid={isValid}
              shape="none"
              ref={textInputRef}
              value={searchQuery}
              onKeyDown={(e) => e.stopPropagation()}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar..."
              leftIcon={<TextInput.SearchIcon />}
            />
          )}
          {showSelectAll && (
            <>
              <List.CheckboxItem
                selected={value.length === options.length}
                onClick={handleSelectAll}
              >
                Selecionar todos
              </List.CheckboxItem>
              <div className="h-[2px] bg-neutral-100" />
            </>
          )}

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.map((opt, i) => {
              const isSelected = value.some((v) => v.value === opt.value);

              return (
                <Dropdown.Item
                  asChild
                  key={`${i}_${opt.label}`}
                  onSelect={(e) => e.preventDefault()}
                  textValue={opt.label}
                >
                  <List.CheckboxItem
                    disabled={opt.disabled}
                    selected={isSelected}
                    onClick={() => handleSelectOption(opt)}
                  >
                    <div className="flex items-center gap-1">
                      <div className="[&_*]:text-md">{opt.icon ?? null}</div>
                      <span>{opt.label}</span>
                    </div>
                  </List.CheckboxItem>
                </Dropdown.Item>
              );
            })}
            {emptyOptions && (
              <List.Item disabled>Nenhuma opção disponível</List.Item>
            )}
          </div>
        </List.Container>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

export default MultiSelect;
