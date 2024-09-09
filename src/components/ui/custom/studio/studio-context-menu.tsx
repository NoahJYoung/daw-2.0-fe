import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { MenuItem } from "../types";

interface StudioContextMenuProps {
  children?: React.ReactNode;
  items?: MenuItem[];
}

export const StudioContextMenu = ({
  children,
  items,
}: StudioContextMenuProps) => {
  const getSubMenu = ({
    children,
    label,
    onClick,
    shortcut,
    icon: Icon,
    separator,
  }: MenuItem) => {
    if (separator) {
      return <ContextMenuSeparator />;
    }
    if (children && children.length > 0) {
      return (
        <ContextMenuSub key={label}>
          <ContextMenuSubTrigger inset>{label ?? ""}</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48 rounded-xxs">
            {children.map((child) => getSubMenu(child))}
          </ContextMenuSubContent>
        </ContextMenuSub>
      );
    }
    return (
      <ContextMenuItem onClick={onClick} inset>
        {Icon && <Icon />}
        {label || ""}
        {shortcut && <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>}
      </ContextMenuItem>
    );
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48 rounded-xxs">
        {items?.map((item) => {
          if (item.children) {
            return getSubMenu(item);
          }
          const { onClick, label, shortcut, icon: Icon, separator } = item;
          if (separator) {
            return <ContextMenuSeparator />;
          }

          return (
            <ContextMenuItem onClick={onClick} inset>
              {Icon && <Icon />}
              {label || ""}
              {shortcut && (
                <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>
              )}
            </ContextMenuItem>
          );
        })}
      </ContextMenuContent>
    </ContextMenu>
  );
};
