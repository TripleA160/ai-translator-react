import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { useRef } from "react";
import AuthButton from "./AuthButton";
import AccountIcon from "../assets/account-icon.svg?react";
import { useLocalization } from "../features/localization/useLocalization";
import { useTooltip } from "../features/tooltip/useTooltip";
import LogoutIcon from "../assets/logout-icon.svg?react";

const HeaderUserArea = ({
  onLogin,
  onSignUp,
  onLogout,
  onAccountClick,
  nameOnLeft = false,
  className,
}: {
  onLogin?: () => void;
  onSignUp?: () => void;
  onLogout?: () => void;
  onAccountClick?: () => void;
  nameOnLeft?: boolean;
  className?: string;
}) => {
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { currentLocale } = useLocalization();
  const tooltip = useTooltip();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleAccountClick = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (onAccountClick) onAccountClick();
    navigate("/account");
  };
  const handleSignUpClick = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (onSignUp) onSignUp();
    navigate("/signup");
  };
  const handleLoginClick = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (onLogin) onLogin();
    navigate("/login");
  };

  const handleLogoutClick = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    logout();
    if (onLogout) onLogout();
    navigate("/");
  };

  return (
    <>
      {currentUser ? (
        <div
          ref={containerRef}
          className={
            "relative flex items-center justify-end gap-3 " + className
          }
        >
          <AuthButton
            label={currentLocale.auth.logout}
            onClick={handleLogoutClick}
            isCollapsible={true}
            collapseLabel={<LogoutIcon className="w-4.5" />}
            className="hidden md:flex h-8! rounded-2xl"
          />
          <div
            onClick={handleAccountClick}
            className={`flex ${nameOnLeft && "flex-row-reverse"} group items-center gap-2 cursor-pointer`}
            onMouseEnter={() => {
              tooltip.showTooltip(
                400,
                "md",
                currentLocale.navigation.accountSettings,
              );
            }}
            onMouseLeave={() => tooltip.hideTooltip()}
          >
            <button
              onClick={handleAccountClick}
              className="text-sm select-none cursor-pointer transition-all duration-180
                text-secondary-100 dark:text-secondary-dark-100 h-full flex items-center
                justify-center group-hover:text-secondary-200
                dark:group-hover:text-secondary-dark-200 hover:text-secondary-200
                dark:hover:text-secondary-dark-200 focus-visible:text-secondary-200
                dark:focus-visible:text-secondary-dark-200 active:text-secondary-300
                dark:active:text-secondary-dark-300 group-focus-visible:text-secondary-200
                dark:group-focus-visible:text-secondary-dark-200 group-active:text-secondary-300
                dark:group-active:text-secondary-dark-300"
              aria-label={currentLocale.navigation.accountSettings}
            >
              {currentUser.displayName}
            </button>
            <button
              className="cursor-pointer"
              ref={accountButtonRef}
              onClick={handleAccountClick}
              aria-label={currentLocale.navigation.accountSettings}
            >
              <AccountIcon
                className="cursor-pointer w-7 md:w-8 text-secondary-100 dark:text-secondary-dark-100
                  transition-all duration-180 outline-none group-hover:text-secondary-200
                  dark:group-hover:text-secondary-dark-200 hover:text-secondary-200
                  dark:hover:text-secondary-dark-200 focus-visible:text-secondary-200
                  dark:focus-visible:text-secondary-dark-200
                  group-focus-visible:text-secondary-200
                  dark:group-focus-visible:text-secondary-dark-200 focus:text-secondary-200
                  dark:focus:text-secondary-dark-200 active:text-secondary-300
                  dark:active:text-secondary-dark-300 group-active:text-secondary-300
                  dark:group-active:text-secondary-dark-300"
              />
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative flex items-center justify-end w-1/5"
        >
          <div className="flex items-center gap-2">
            <AuthButton
              label={currentLocale.auth.login}
              onClick={handleLoginClick}
            />
            <AuthButton
              label={currentLocale.auth.signUp}
              onClick={handleSignUpClick}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderUserArea;
