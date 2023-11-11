export interface FlyoutMenuItem<T = any> {
  label: string;
  id?: string;
  enabled?: boolean;
  checkable?: boolean;
  checked?: boolean;
  callback?: () => T;
}
export interface FlyoutMenuItemProp<T = any> {
  label: string;
  id: string;
  enabled?: boolean;
  checkable?: boolean;
  checked?: boolean;
  callback?: () => T;
}
export type FlyoutMenu = FlyoutMenuItemProp[];

export interface ContextMenuItem<T = any> {
  label: string;
  enabled?: boolean;
  checkable?: boolean;
  checked?: boolean;
  callback?: () => T;
  icon?: string;
  menu?: ContextMenuItem[];
}
export type ContextMenu = ContextMenuItem[];
