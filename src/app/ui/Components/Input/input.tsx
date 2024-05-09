import React, { forwardRef } from "react";
import clsx from "clsx";

interface InputOptions {
  /**
   * Button display variants
   * @default "solid"
   * @type ButtonVariant
   */
  variant?: InputVariant;
  /**
   * Placeholder text for the input
   */
  placeholder?: string;
}

type Ref = HTMLInputElement;

export type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> &
  InputOptions;

type InputVariant = "solid" | "danger" | "warning" | "confirm";

const getVariant = (variant: InputVariant) => {
  switch (variant) {
    case "danger":
      return "border-fluency-red-500 hover:border-fluency-red-600 bg-fluency-red-500 text-fluency-text-dark hover:bg-fluency-red-600 focus:bg-fluency-red-700 dark:bg-transparent dark:text-fluency-red-500 dark:hover:text-white dark:hover:bg-fluency-red-500 hover:dark:border-fluency-red-500";
    case "warning":
      return "border-fluency-yellow-500 hover:border-fluency-yellow-600 bg-fluency-yellow-500 text-fluency-text-dark hover:bg-fluency-yellow-600 focus:bg-fluency-yellow-700 dark:bg-transparent dark:text-fluency-yellow-500 dark:hover:text-white dark:hover:bg-fluency-yellow-500 hover:dark:border-fluency-yellow-500";
    case "confirm":
      return "border-fluency-green-500 hover:border-fluency-green-600 bg-fluency-green-500 text-fluency-text-dark hover:bg-fluency-green-600 focus:bg-fluency-green-700 dark:bg-transparent dark:text-fluency-green-500 dark:hover:text-white dark:hover:bg-fluency-green-500 hover:dark:border-fluency-green-500"
    default:
      return "border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800";
  }
};

const FluencyInput = forwardRef<Ref, InputProps>((props, ref) => {
  const {
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
    <input
      ref={ref}
      className={merged}
      placeholder={placeholder}
      value={value}
      {...rest}
    />
  );
});

FluencyInput.displayName = "Input";
export default FluencyInput;
