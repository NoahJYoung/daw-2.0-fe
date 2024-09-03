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
          className="rounded-xxs text-xl relative flex items-center justify-centers p-1 w-8 h-8 bg-surface-2 text-surface-5 hover:bg-surface-3"
        >
          {Icon && <Icon />}
          {label && label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-xxs bg-surface-1">
        {options.map((option) => {
          if (option?.separator) {
            return <DropdownMenuSeparator />;
          }

          if (option.header) {
            return <DropdownMenuLabel>{option.label}</DropdownMenuLabel>;
          }
          return (
            <DropdownMenuItem
              className={
                value && option?.value === value
                  ? "bg-surface-1 rounded-xxs font-bold text-surface-6 cursor-pointer"
                  : "bg-surface-1 rounded-xxs text-surface-5 cursor-pointer"
              }
              onClick={() => {
                if (option?.onClick) {
                  option.onClick();
                } else if (option?.value) {
                  onValueChange(option.value);
                }
              }}
            >
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
