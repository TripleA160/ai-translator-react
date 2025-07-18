import type { Ref } from "react";

type Props = {
  label: string;
  accessibilityLabel?: string;
  onClick?: () => void;
  ref?: Ref<HTMLButtonElement>;
  className?: string;
};

const AuthButton = ({
  label,
  accessibilityLabel,
  onClick,
  ref,
  className,
}: Props) => {
  return (
    <button
      ref={ref}
      className={
        `outline-1 focus:shadow-button outline-transparent focus:outline-primary-200
        dark:focus:outline-primary-dark-200 min-w-18 h-9 text-sm pl-2 pr-2
        whitespace-nowrap cursor-pointer rounded-3xl bg-secondary-100
        dark:bg-secondary-dark-100 text-white dark:text-black transition-all
        duration-180 hover:bg-secondary-200 dark:hover:bg-secondary-dark-200
        focus-visible:bg-secondary-200 dark:focus-visible:bg-secondary-dark-200
        active:bg-secondary-300 dark:active:bg-secondary-dark-300 ` + className
      }
      onClick={onClick}
      aria-label={accessibilityLabel ? accessibilityLabel : label}
    >
      {label}
    </button>
  );
};

export default AuthButton;
