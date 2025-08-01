import { useRef, useState, type ReactNode } from "react";
import { useTooltip } from "../features/tooltip/useTooltip";
import random from "lodash/random";
import DeleteButton from "./DeleteButton";
import { useAuth } from "../features/auth/useAuth";

type Props = {
  label: string;
  icon: ReactNode;
  items?: {
    id?: string;
    icon: ReactNode;
    text: string;
    additionalText?: string;
    onSelect?: () => void;
    onDelete?: () => void;
  }[];
  privateAccess?: boolean;
  notAccessText?: string;
  className?: string;
};

const SidePanel = ({
  label,
  icon,
  items,
  privateAccess,
  notAccessText,
  className,
}: Props) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const { currentUser } = useAuth();
  const tooltip = useTooltip();

  const collapse = () => {
    setIsCollapsed(true);
  };

  const expand = () => {
    setIsCollapsed(false);
  };

  const handleClick = () => {
    if (isCollapsed) expand();
    else collapse();
  };

  return (
    <>
      <div
        className={
          `flex flex-col shrink-0 items-center bg-background-100 select-none
          dark:bg-background-dark-300 p-7 rounded-[1.75rem] transition-[width,_max-width]
          duration-250 cursor-pointer box-content ${isCollapsed ? "w-6" : "w-1/6"} ` +
          className
        }
        onClick={handleClick}
      >
        <div
          className={`flex items-center justify-center pb-3 mb-4 border-b border-border-200
            dark:border-border-100 w-full ${isCollapsed ? "gap-0" : "gap-1.5"} `}
        >
          <div
            className="w-7 shrink-0 text-secondary-100"
            onMouseEnter={() => {
              if (isCollapsed) {
                tooltip.showTooltip(400, "md", label);
              }
            }}
            onMouseLeave={() => tooltip.hideTooltip()}
          >
            {icon}
          </div>
          <div
            className={`select-none text-lg text-primary-100 dark:text-primary-dark-100
              transition-[max-width] duration-200
              ${isCollapsed ? "max-w-0 invisible" : "max-w-16 visible"}`}
          >
            {label}
          </div>
        </div>
        {!privateAccess || (privateAccess && currentUser) ? (
          <div
            className="flex flex-col items-center gap-2 w-full no-scrollbar overflow-y-auto
              overflow-x-hidden"
            ref={containerRef}
          >
            {items?.map((item) => (
              <div
                key={item.id || item.text + random()}
                onMouseEnter={() => {
                  if (isCollapsed) {
                    tooltip.showTooltip(0, "md", item.text);
                  }
                }}
                onMouseLeave={() => tooltip.hideTooltip()}
                className="w-full group"
              >
                <div
                  onClick={(event) => {
                    if (item.onSelect) {
                      event.stopPropagation();
                      item.onSelect();
                    }
                  }}
                  className={`group flex items-center w-full gap-1.5 bg-background-200
                    dark:bg-background-dark-200 rounded-t-md cursor-pointer hover:bg-background-300
                    dark:hover:bg-background-dark-100 group-hover:bg-background-300
                    dark:group-hover:bg-background-dark-100 active:bg-background-300
                    dark:active:bg-background-dark-100 group-active:bg-background-300
                    dark:group-active:bg-background-dark-100
                    [transition:colors_125ms_cubic-bezier(.1,.55,.75,.85)]`}
                >
                  <div
                    className="w-6 shrink-0 text-secondary-100 opacity-70 hover:opacity-100
                      group-hover:opacity-100 active:opacity-100 group-active:opacity-100
                      [transition:opacity_125ms_cubic-bezier(.1,.55,.75,.85)]"
                  >
                    {item.icon}
                  </div>

                  {!isCollapsed && (
                    <>
                      <div
                        dir="auto"
                        className="text-sm text-primary-200 dark:text-primary-dark-200 truncate w-full pr-1.5
                          select-text"
                      >
                        {item.text}
                      </div>
                      {item.onDelete && (
                        <DeleteButton
                          onClick={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            item.onDelete?.();
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
                {item.additionalText && (
                  <div
                    dir="auto"
                    onClick={(event) => {
                      if (item.onSelect) {
                        event.stopPropagation();
                        item.onSelect();
                      }
                    }}
                    className={`cursor-pointer text-xs p-0.25 bg-background-300 dark:bg-background-dark-200
                      text-secondary-100 dark:text-secondary-dark-200 hover:text-secondary-300
                      dark:hover:text-secondary-dark-100 rounded-b-md inset-shadow-[0_3px_3px_#000]/10
                      dark:inset-shadow-[0_3px_3px_#000]/10 group-hover:text-secondary-300
                      dark:group-hover:text-secondary-dark-100 active:text-secondary-300
                      dark:active:text-secondary-dark-100 group-active:text-secondary-300
                      dark:group-active:text-secondary-dark-100
                      [transition:color_125ms_cubic-bezier(.1,.55,.75,.85)_0s,_opacity_125ms_cubic-bezier(.1,.55,.75,.85)_0s,_max-height_250ms_cubic-bezier(0.4,0,0.2,1)_25ms]
                      overflow-hidden select-text w-full text-center
                      ${isCollapsed ? "opacity-0 max-h-0" : "opacity-85 max-h-5 hover:opacity-95 group-hover:opacity-95"}`}
                  >
                    {item.additionalText}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          !isCollapsed && (
            <div
              className="opacity-65 text-base text-primary-200 dark:text-primary-dark-200 w-full max-h-32
                overflow-hidden select-text"
            >
              {notAccessText}
            </div>
          )
        )}
      </div>
    </>
  );
};

export default SidePanel;
