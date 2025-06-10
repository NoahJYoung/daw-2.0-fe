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
  triggerClassName?: string;
}

export const StudioDropdownMenu = ({
  options,
  value,
  onValueChange,
  triggerIcon: Icon,
  label,
  title,
  disabled,
  triggerClassName,
}: ToolbarMenuProps) => {
  const combinedTriggerClassName = cn(
    "rounded-xs text-2xl relative flex items-center justify-centers p-1 w-8 h-8 bg-surface-2 text-surface-5 hover:bg-surface-3 active:bg-surface-3 focus:bg-surface-3",
    triggerClassName
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={disabled} asChild>
        <Button title={title} className={combinedTriggerClassName}>
          {Icon && <Icon />}
          {label && label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-xs bg-surface-1 max-h-48 lg:max-h-96 overflow-y-auto">
        {options.map((option, i) => {
          if (option?.render) {
            return (
              <DropdownMenuItem key={i}>{option.render()}</DropdownMenuItem>
            );
          }
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
                "bg-surface-1 text-surface-5 hover:bg-surface-2 hover:text-surface-6 focus:bg-surface-2 focus:text-surface-6 focus-visible:bg-surface-2 focus-visible:text-surface-6 rounded-xs cursor-pointer data-[highlighted]:bg-surface-2 data-[highlighted]:text-surface-6",
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
