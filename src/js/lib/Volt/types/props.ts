import type { FlyoutMenuItem, ContextMenuItem } from "./index";

export interface FlyoutMenuItemProp<T = any> extends FlyoutMenuItem<T> {
  id: string;
}
export type FlyoutMenuProp = FlyoutMenuItemProp[];

export interface ContextMenuItemProp<T = any> extends ContextMenuItem<T> {
  id: string;
  checked: boolean;
  checkable: boolean;
  enabled: boolean;
}
export type ContextMenuProp = ContextMenuItemProp[];
