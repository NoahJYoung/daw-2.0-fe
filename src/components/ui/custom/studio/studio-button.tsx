import { IconType } from "react-icons/lib";
import { Button } from "../../button";
import { CSSProperties } from "react";

interface StudioButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  on?: boolean;
  onClassName?: string;
  label?: string;
  icon?: IconType;
  disabled?: boolean;
  title?: string;
  style?: CSSProperties;
  className?: string;
}

export const StudioButton = ({
  onClick,
  on,
  onClassName,
  label,
  icon: Icon,
  disabled,
  title,
  className,
  style,
}: StudioButtonProps) => {
  const getClassName = () => {
    const baseClass =
      className ??
      `rounded-xxs focus-visible:ring-0 text-2xl relative flex items-center justify-centers p-1 w-8 h-8 bg-surface-2 text-surface-5 hover:bg-surface-3`;
    if (!!on && !!onClassName) {
      return [...baseClass.split(" "), ...onClassName.split(" ")].join(" ");
    }
    return baseClass;
  };
  return (
    <Button
      style={style}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={getClassName()}
    >
      {Icon && <Icon />}
      {label && label}
    </Button>
  );
};
