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

type ButtonVariant = "solid" | "danger" | "warning" | "confirm" | "gray" | "orange" | "purple" | "glass";

const getVariant = (variant: ButtonVariant) => {
  switch (variant) {
    case "danger":
      return "border-fluency-red-500 hover:border-fluency-red-600 bg-fluency-red-500 text-fluency-text-dark hover:bg-fluency-red-600 focus:bg-fluency-red-700 dark:bg-transparent dark:text-fluency-red-500 dark:hover:text-white dark:hover:bg-fluency-red-500 hover:dark:border-fluency-red-500";
    case "warning":
      return "border-fluency-orange-500 hover:border-fluency-orange-600 bg-fluency-orange-500 text-fluency-text-dark hover:bg-fluency-orange-600 focus:bg-fluency-orange-700 dark:bg-transparent dark:text-fluency-orange-500 dark:hover:text-white dark:hover:bg-fluency-orange-500 hover:dark:border-fluency-orange-500";
    case "confirm":
      return "border-fluency-green-500 hover:border-fluency-green-600 bg-fluency-green-500 text-fluency-text-dark hover:bg-fluency-green-600 focus:bg-fluency-green-700 dark:bg-transparent dark:text-fluency-green-500 dark:hover:text-white dark:hover:bg-fluency-green-500 hover:dark:border-fluency-green-500"
    case "orange":
      return "border-fluency-orange-500 hover:border-fluency-orange-600 bg-fluency-orange-500 text-fluency-text-dark hover:bg-fluency-orange-600 focus:bg-fluency-orange-700 dark:bg-transparent dark:text-fluency-orange-500 dark:hover:text-white dark:hover:bg-fluency-orange-500 hover:dark:border-fluency-orange-500"
    case "gray":
      return "border-fluency-gray-100 hover:border-fluency-gray-100 bg-fluency-gray-500 text-fluency-text-dark hover:bg-fluency-gray-600 focus:bg-fluency-gray-700 dark:bg-transparent dark:text-fluency-gray-100 dark:hover:text-black dark:hover:bg-fluency-gray-100 hover:dark:border-fluency-gray-500"
    case "purple":
      return "border-indigo-500 hover:border-indigo-600 bg-indigo-500 text-fluency-text-dark hover:bg-indigo-600 focus:bg-indigo-700 dark:bg-transparent dark:text-indigo-700 dark:hover:text-black dark:hover:bg-indigo-700 hover:dark:border-indigo-700"
    case "glass":
      return "bg-white/20 dark:bg-black/20 backdrop-blur-lg border border-white/30 dark:border-white/10 text-fluency-gray-800 dark:text-fluency-gray-100 hover:bg-white/30 hover:dark:bg-black/30 hover:border-white/50 dark:hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"  
    default:
      return "border-fluency-blue-500 hover:border-fluency-blue-600 bg-fluency-blue-500 text-fluency-text-dark hover:bg-fluency-blue-700 focus:bg-fluency-blue-800 dark:bg-transparent dark:text-fluency-blue-500 dark:hover:text-white dark:hover:bg-fluency-blue-500 hover:dark:border-fluency-blue-500";
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