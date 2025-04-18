import { IconType } from "react-icons/lib";

export interface MenuItem<T = string> {
  label?: string;
  icon?: IconType;
  separator?: boolean;
  value?: T;
  header?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  shortcut?: string;
  children?: MenuItem[];
  disabled?: boolean;
  render?: () => React.ReactNode;
}
