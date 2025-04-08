import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CSSProperties } from "react";

interface DropdownProps {
  options: { label: string; value: string }[];
  value: string | null;
  onChange: (value: string) => void;
  colorOffset?: number;
  placeholder?: string;
  label?: string;
  size?: "sm" | "lg";
  icon?: React.ReactElement;
  style?: CSSProperties;
  showSelectedValue?: boolean;
  disabled?: boolean;
}

export const StudioDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  size = "sm",
  icon: Icon,
  colorOffset = 0,
  showSelectedValue = true,
  style,
  disabled,
}: DropdownProps) => {
  const isPlaceholder = !value;
  return (
    <Select disabled={disabled} value={value || ""} onValueChange={onChange}>
      <SelectTrigger
        style={style}
        className={`max-w-full flex items-center gap-1 focus:ring-0 ${
          isPlaceholder
            ? `text-surface-${4 + colorOffset}`
            : `text-surface-${6 + colorOffset}`
        } ${size === "lg" ? "text-lg" : "text-sm"} border-surface-${
          2 + colorOffset
        } rounded-xxs ${size === "lg" ? "lg:h-10 h-8" : "h-7"} `}
      >
        {Icon}
        {showSelectedValue && (
          <SelectValue
            className="text-sm text-surface-0"
            placeholder={placeholder}
          />
        )}
      </SelectTrigger>
      <SelectContent className="rounded-xxs bg-surface-1">
        {label && <SelectLabel>{label}</SelectLabel>}
        {options.map((option) => (
          <SelectItem
            className="bg-surface-1 hover:bg-surface-2 rounded-xxs"
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
