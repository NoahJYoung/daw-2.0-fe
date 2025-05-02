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
import { cn } from "@/lib/utils";

interface ToolbarMenuProps {
  options: MenuItem[];
  value?: string;
  onValueChange: (newValue: string) => void;
  triggerIcon?: IconType;
  label?: string;
  title?: string;
  disabled?: boolean;
}

export const StudioDropdownMenu = ({
  options,
  value,
  onValueChange,
  triggerIcon: Icon,
  label,
  title,
  disabled,
}: ToolbarMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={disabled} asChild>
        <Button
          title={title}
          className="rounded-xs text-2xl relative flex items-center justify-centers p-1 w-8 h-8 bg-surface-2 text-surface-5 hover:bg-surface-3"
        >
          {Icon && <Icon />}
          {label && label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-xs bg-surface-1 max-h-48 lg:max-h-96 overflow-y-auto">
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
              className={cn(
                "bg-surface-1 text-surface-5 rounded-xs cursor-pointer",
                { "font-bold text-surface-6": value && option?.value === value }
              )}
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
