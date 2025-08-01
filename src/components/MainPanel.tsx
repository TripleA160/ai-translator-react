import { type ReactNode } from "react";

const MainPanel = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  return (
    <>
      <div
        className={
          `h-full flex flex-col items-center bg-background-100 dark:bg-background-dark-300
          transition-all duration-300 pl-3.5 pr-3.5 pt-6 pb-6 rounded-[1.75rem]
          overflow-auto ` + className
        }
      >
        {children}
      </div>
    </>
  );
};

export default MainPanel;
