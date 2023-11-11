/** Foo bar something here */
export declare interface FlyoutMenuItem<T = any> {
  /** String to display on menu */
  label: string;
  /** Arbitrary string for item matching */
  id?: string;
  /** Whether menu item appears as clickable or disabled */
  enabled?: boolean;
  /** Whether menu item can be toggled and displays checkmark */
  checkable?: boolean;
  /** The state of the current item if checkable, true = checked, false = unchecked */
  checked?: boolean;
  /** Function to execute on clicking this menu item */
  callback?: () => T;
}
export declare type FlyoutMenu = FlyoutMenuItem[];

export interface ContextMenuItem<T = any> {
  /** String to display on menu */
  label: string;
  /** Arbitrary string for item matching */
  id?: string;
  /** Whether menu item appears as clickable or disabled */
  enabled?: boolean;
  /** Whether menu item can be toggled and displays checkmark */
  checkable?: boolean;
  /** The state of the current item if checkable, true = checked, false = unchecked */
  checked?: boolean;
  /** Function to execute on clicking this menu item */
  callback?: () => T;
  /** Relative path to icon which replaces check. Cannot co-exist with checkable/checked */
  icon?: string;
  /** Allows the ability to infinitely nest menus within subgroups */
  menu?: ContextMenuItem[];
}
export declare type ContextMenu = ContextMenuItem[];
