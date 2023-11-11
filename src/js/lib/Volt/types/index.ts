export interface FlyoutMenuItem<T = any> {
  label: string;
  id?: string;
  enabled?: boolean;
  checkable?: boolean;
  checked?: boolean;
  callback?: () => T;
}
export interface FlyoutMenuItemProp<T = any> extends FlyoutMenuItem<T> {
  id: string;
}
export type FlyoutMenu = FlyoutMenuItem[];
export type FlyoutMenuProp = FlyoutMenuItemProp[];

export interface ContextMenuItem<T = any> {
  label: string;
  id?: string;
  enabled?: boolean;
  checkable?: boolean;
  checked?: boolean;
  callback?: () => T;
  icon?: string;
  menu?: ContextMenuItem[];
}
export interface ContextMenuItemProp<T = any> extends ContextMenuItem<T> {
  id: string;
  checked: boolean;
  checkable: boolean;
  enabled: boolean;
}
export type ContextMenu = ContextMenuItem[];
export type ContextMenuProp = ContextMenuItemProp[];
