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
}: DropdownProps) => {
  const isPlaceholder = !value;
  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger
        className={`w-full ${
          isPlaceholder ? "text-surface-4" : "text-surface-6"
        } text-sm rounded-xxs h-7 flex-shrink-0`}
      >
        {Icon}
        <SelectValue
          className="text-sm text-surface-0"
          placeholder={placeholder}
        />
      </SelectTrigger>
      <SelectContent className="rounded-xxs bg-surface-2">
        <SelectGroup className="bg-surface-2">
          <SelectLabel>{label}</SelectLabel>
          {options.map((option) => (
            <SelectItem value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
