import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DropdownProps {
  options: { label: string; value: string }[];
  value: string | null;
  onChange: (value: string) => void;
  colorOffset?: number;
  placeholder?: string;
  label?: string;
  icon?: React.ReactElement;
}

export const StudioDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  icon: Icon,
  colorOffset = 0,
}: DropdownProps) => {
  const isPlaceholder = !value;
  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger
        className={`w-full ${
          isPlaceholder
            ? `text-surface-${4 + colorOffset}`
            : `text-surface-${6 + colorOffset}`
        } text-sm border-surface-${
          2 + colorOffset
        } rounded-xxs h-7 flex-shrink-0`}
      >
        {Icon}
        <SelectValue
          className="text-sm text-surface-0"
          placeholder={placeholder}
        />
      </SelectTrigger>
      <SelectContent className={`rounded-xxs bg-surface-${2 + colorOffset}`}>
        <SelectGroup className={`bg-surface-${2 + colorOffset}`}>
          <SelectLabel>{label}</SelectLabel>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
