import clsx from "clsx";
import { forwardRef } from "react";
import { IoClose } from "react-icons/io5";

interface ButtonOptions {
  /**
   * Button display variants
   * @default "solid"
   * @type ButtonVariant
   */
  variant?: ButtonVariant;
}

type Ref = HTMLButtonElement;

export type FluencyCloseButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  ButtonOptions;

type ButtonVariant = "solid" | "danger" | "warning" | "confirm";

const FluencyCloseButton = forwardRef<Ref, FluencyCloseButtonProps>((props, ref) => {
  const {
    variant = "solid",
    type = "button",
    className,
    ...rest
  } = props;

  const merged = clsx(
    "absolute top-0 left-0 mt-2 ml-2 text-gray-500 hover:text-blue-600",
    "transition-all ease-in-out duration-100",
    className
  );
  return (
    <button ref={ref} className={merged} {...rest}>
      <span className="sr-only">Fechar</span>
      <IoClose className="icon w-7 h-7 ease-in-out duration-300" />
    </button>
  );
});

FluencyCloseButton.displayName = "Button";
export default FluencyCloseButton;