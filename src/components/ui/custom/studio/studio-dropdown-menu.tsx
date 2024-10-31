import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../../button";
import { MenuItem } from "../types";
import { IconType } from "react-icons/lib";

interface ToolbarMenuProps {
  options: MenuItem[];
  value?: string;
  onValueChange: (newValue: string) => void;
  triggerIcon?: IconType;
  label?: string;
  title?: string;
}

export const StudioDropdownMenu = ({
  options,
  value,
  onValueChange,
  triggerIcon: Icon,
  label,
  title,
}: ToolbarMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          title={title}
          className="rounded-xxs text-2xl relative flex items-center justify-centers p-1 w-8 h-8 bg-surface-2 text-surface-5 hover:bg-surface-3"
        >
          {Icon && <Icon />}
          {label && label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-xxs bg-surface-1">
        {options.map((option, i) => {
          if (option?.separator) {
            return <DropdownMenuSeparator key={option.label ?? i} />;
          }

          if (option.header) {
            return (
              <DropdownMenuLabel key={option.label ?? i}>
                {option.label}
              </DropdownMenuLabel>
            );
          }
          return (
            <DropdownMenuItem
              disabled={option.disabled}
              key={option.label ?? i}
              className={
                value && option?.value === value
                  ? "bg-surface-1 rounded-xxs font-bold text-surface-6 cursor-pointer"
                  : "bg-surface-1 rounded-xxs text-surface-5 cursor-pointer"
              }
              onClick={(e) => {
                if (option?.onClick) {
                  option.onClick(e);
                } else if (option?.value) {
                  onValueChange(option.value);
                }
              }}
            >
              <span className="flex items-center gap-2">
                {option.icon && <option.icon />}
                {option.label}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
