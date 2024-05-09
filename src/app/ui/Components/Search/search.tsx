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

export type FluencySearchProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> &
  InputOptions;

type InputVariant = "solid" | "danger" | "warning" | "confirm";

const getVariant = (variant: InputVariant) => {
  switch (variant) {
  default:
      return "border-2 border-gray-300 bg-white focus:outline-none";
  }
};

const FluencySearch = forwardRef<Ref, FluencySearchProps>((props, ref) => {
  const {
    variant = "solid",
    type = "input",
    placeholder,
    className,
    value,
    ...rest
  } = props;

  const merged = clsx(
    "h-10 px-5 pr-16 rounded-lg text-sm",
    getVariant(variant),
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

FluencySearch.displayName = "Search";
export default FluencySearch;
