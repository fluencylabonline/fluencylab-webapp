import clsx from "clsx";
import { forwardRef } from "react";

interface ButtonOptions {
  /**
   * Button display variants
   * @default "solid"
   * @type ButtonVariant
   */
  variant?: ButtonVariant;
}

type Ref = HTMLButtonElement;

export type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  ButtonOptions;

type ButtonVariant = "solid" | "danger" | "warning" | "confirm" | "gray";

const getVariant = (variant: ButtonVariant) => {
  switch (variant) {
    case "danger":
      return "border-fluency-red-500 hover:border-fluency-red-600 bg-fluency-red-500 text-fluency-text-dark hover:bg-fluency-red-600 focus:bg-fluency-red-700 dark:bg-transparent dark:text-fluency-red-500 dark:hover:text-white dark:hover:bg-fluency-red-500 hover:dark:border-fluency-red-500";
    case "warning":
      return "border-fluency-yellow-500 hover:border-fluency-yellow-600 bg-fluency-yellow-500 text-fluency-text-dark hover:bg-fluency-yellow-600 focus:bg-fluency-yellow-700 dark:bg-transparent dark:text-fluency-yellow-500 dark:hover:text-white dark:hover:bg-fluency-yellow-500 hover:dark:border-fluency-yellow-500";
    case "confirm":
      return "border-fluency-green-500 hover:border-fluency-green-600 bg-fluency-green-500 text-fluency-text-dark hover:bg-fluency-green-600 focus:bg-fluency-green-700 dark:bg-transparent dark:text-fluency-green-500 dark:hover:text-white dark:hover:bg-fluency-green-500 hover:dark:border-fluency-green-500"
    case "gray":
      return "border-fluency-gray-100 hover:border-fluency-gray-100 bg-fluency-gray-500 text-fluency-text-dark hover:bg-fluency-gray-600 focus:bg-fluency-gray-700 dark:bg-transparent dark:text-fluency-gray-100 dark:hover:text-black dark:hover:bg-fluency-gray-100 hover:dark:border-fluency-gray-500"
    default:
      return "border-fluency-blue-500 hover:border-fluency-blue-600 bg-fluency-blue-500 text-fluency-text-dark hover:bg-fluency-blue-600 focus:bg-fluency-blue-700 dark:bg-transparent dark:text-fluency-blue-500 dark:hover:text-white dark:hover:bg-fluency-blue-500 hover:dark:border-fluency-blue-500";
  }
};

const FluencyButton = forwardRef<Ref, ButtonProps>((props, ref) => {
  const {
    variant = "solid",
    type = "button",
    className,
    children,
    ...rest
  } = props;

  const merged = clsx(
    "block max-w-sm px-5 py-2.5 font-bold rounded-lg border flex flex-row gap-1 justify-center items-center text-center text-sm mr-2",
    getVariant(variant),
    "transition-all ease-in-out duration-100",
    className
  );
  return (
    <button ref={ref} className={merged} {...rest}>
      {children}
    </button>
  );
});

FluencyButton.displayName = "Button";
export default FluencyButton;