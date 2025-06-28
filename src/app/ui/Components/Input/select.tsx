import React, { forwardRef } from "react";
import clsx from "clsx";
import { FiChevronDown } from "react-icons/fi";

interface SelectOptions {
  /**
   * Select display variants
   * @default "solid"
   * @type SelectVariant
   */
  variant?: SelectVariant;
  /**
   * Placeholder text for the select
   */
  placeholder?: string;
  label?: string;
}

type Ref = HTMLSelectElement;

export type SelectProps = React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
> &
  SelectOptions;

type SelectVariant = "solid" | "danger" | "warning" | "confirm";

const getVariant = (variant: SelectVariant) => {
  switch (variant) {
    case "danger":
      return "border-fluency-red-500 hover:border-fluency-red-600 bg-fluency-red-500 text-fluency-text-dark hover:bg-fluency-red-600 focus:bg-fluency-red-700 dark:bg-transparent dark:text-fluency-red-500 dark:hover:text-white dark:hover:bg-fluency-red-500 hover:dark:border-fluency-red-500";
    case "warning":
      return "border-fluency-orange-500 hover:border-fluency-orange-600 bg-fluency-orange-500 text-fluency-text-dark hover:bg-fluency-orange-600 focus:bg-fluency-orange-700 dark:bg-transparent dark:text-fluency-orange-500 dark:hover:text-white dark:hover:bg-fluency-orange-500 hover:dark:border-fluency-orange-500";
    case "confirm":
      return "border-fluency-green-500 hover:border-fluency-green-600 bg-fluency-green-500 text-fluency-text-dark hover:bg-fluency-green-600 focus:bg-fluency-green-700 dark:bg-transparent dark:text-fluency-green-500 dark:hover:text-white dark:hover:bg-fluency-green-500 hover:dark:border-fluency-green-500"
    default:
      return "border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800";
  }
};

const FluencySelect = forwardRef<Ref, SelectProps>((props, ref) => {
  const {
    label,
    variant = "solid",
    placeholder,
    className,
    children,
    ...rest
  } = props;

  const merged = clsx(
    "ease-in-out duration-300 w-full pl-3 pr-10 py-2 rounded-lg border-2 font-medium appearance-none",
    getVariant(variant),
    "transition-all ease-in-out duration-100",
    className
  );

  return (
    <div className="relative">
      {label && (
        <label htmlFor={rest.id} className="block text-sm font-medium text-fluency-text-light dark:text-fluency-text-dark mb-2">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={merged}
        {...rest}
      >
        {placeholder && <option value="" disabled hidden>{placeholder}</option>}
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <FiChevronDown className={clsx(
          "w-5 h-5 transition-colors",
          variant === "solid" 
            ? "text-fluency-gray-500 dark:text-fluency-gray-300" 
            : "currentColor"
        )} />
      </div>
    </div>
  );
});

FluencySelect.displayName = "Select";
export default FluencySelect;