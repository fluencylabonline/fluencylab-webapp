import React, { forwardRef } from "react";
import clsx from "clsx";

interface InputOptions {
  /**
   * Input display variants
   * @default "solid"
   * @type InputVariant
   */
  variant?: InputVariant;
  /**
   * Placeholder text for the input
   */
  placeholder?: string;
  label?: string;
}

type Ref = HTMLInputElement;

export type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> &
  InputOptions;

type InputVariant = "solid" | "danger" | "warning" | "confirm" | "glass";

const getVariant = (variant: InputVariant) => {
  switch (variant) {
    case "danger":
      return "border-fluency-red-500 hover:border-fluency-red-600 bg-fluency-red-500 text-fluency-text-dark hover:bg-fluency-red-600 focus:bg-fluency-red-700 dark:bg-transparent dark:text-fluency-red-500 dark:hover:text-white dark:hover:bg-fluency-red-500 hover:dark:border-fluency-red-500";
    case "warning":
      return "border-fluency-orange-500 hover:border-fluency-orange-600 bg-fluency-orange-500 text-fluency-text-dark hover:bg-fluency-orange-600 focus:bg-fluency-orange-700 dark:bg-transparent dark:text-fluency-orange-500 dark:hover:text-white dark:hover:bg-fluency-orange-500 hover:dark:border-fluency-orange-500";
    case "confirm":
      return "border-fluency-green-500 hover:border-fluency-green-600 bg-fluency-green-500 text-fluency-text-dark hover:bg-fluency-green-600 focus:bg-fluency-green-700 dark:bg-transparent dark:text-fluency-green-500 dark:hover:text-white dark:hover:bg-fluency-green-500 hover:dark:border-fluency-green-500";
    case "glass":
      return "bg-white/20 backdrop-blur-lg border border-white/30 text-fluency-gray-800 dark:text-fluency-gray-100 hover:bg-white/30 hover:dark:bg-black/30 hover:border-white/50 dark:hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent dark:bg-black/20 dark:border-white/10 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.05)]";
    default:
      return "border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800";
  }
};

const FluencyInput = forwardRef<Ref, InputProps>((props, ref) => {
  const {
    label,
    variant = "solid",
    type = "input",
    placeholder,
    className,
    value,
    ...rest
  } = props;

  const merged = clsx(
    "ease-in-out duration-300 w-full pl-3 py-2 rounded-lg border-2 font-medium",
    getVariant(variant),
    "transition-all ease-in-out duration-100",
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={rest.id}
          className="block text-sm font-medium text-fluency-text-light dark:text-fluency-text-dark mb-2"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={merged}
        placeholder={placeholder}
        value={value}
        {...rest}
      />
    </div>
  );
});

FluencyInput.displayName = "Input";
export default FluencyInput;