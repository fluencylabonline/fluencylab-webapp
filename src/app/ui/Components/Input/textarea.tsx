import React, { forwardRef } from "react";
import clsx from "clsx";

interface TextareaOptions {
  /**
   * Textarea display variants
   * @default "solid"
   * @type TextareaVariant
   */
  variant?: TextareaVariant;
  /**
   * Placeholder text for the textarea
   */
  placeholder?: string;
  label?: string;
}

type Ref = HTMLTextAreaElement;

export type TextareaProps = React.DetailedHTMLProps<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
> &
  TextareaOptions;

type TextareaVariant = "solid" | "danger" | "warning" | "confirm";

const getVariant = (variant: TextareaVariant) => {
  switch (variant) {
    case "danger":
      return "border-fluency-red-500 hover:border-fluency-red-600 bg-fluency-red-500 text-fluency-text-dark hover:bg-fluency-red-600 focus:bg-fluency-red-700 dark:bg-transparent dark:text-fluency-red-500 dark:hover:text-white dark:hover:bg-fluency-red-500 hover:dark:border-fluency-red-500";
    case "warning":
      return "border-fluency-orange-500 hover:border-fluency-orange-600 bg-fluency-orange-500 text-fluency-text-dark hover:bg-fluency-orange-600 focus:bg-fluency-orange-700 dark:bg-transparent dark:text-fluency-orange-500 dark:hover:text-white dark:hover:bg-fluency-orange-500 hover:dark:border-fluency-orange-500";
    case "confirm":
      return "border-fluency-green-500 hover:border-fluency-green-600 bg-fluency-green-500 text-fluency-text-dark hover:bg-fluency-green-600 focus:bg-fluency-green-700 dark:bg-transparent dark:text-fluency-green-500 dark:hover:text-white dark:hover:bg-fluency-green-500 hover:dark:border-fluency-green-500";
    default:
      return "border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800";
  }
};

const FluencyTextarea = forwardRef<Ref, TextareaProps>((props, ref) => {
  const {
    label,
    variant = "solid",
    placeholder,
    className,
    value,
    rows = 4,
    ...rest
  } = props;

  const merged = clsx(
    "ease-in-out duration-300 w-full p-3 rounded-lg border-2 font-medium min-h-[100px]",
    getVariant(variant),
    "transition-all ease-in-out duration-100 resize-y",
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
      <textarea
        ref={ref}
        className={merged}
        placeholder={placeholder}
        value={value}
        rows={rows}
        {...rest}
      />
    </div>
  );
});

FluencyTextarea.displayName = "Textarea";
export default FluencyTextarea;
