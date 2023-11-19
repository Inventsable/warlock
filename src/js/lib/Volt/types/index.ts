/** A single entry within a FlyoutMenu array or collection.
 * For a dividing line, use { label: "---" }
 *
 * label:string = String to display on menu
 *
 * id?:string = Arbitrary string for item matching
 *
 * enabled?:boolean = Whether menu item appears as clickable or disabled
 *
 * checkable?:boolean = Whether menu item can be toggled and displays checkmark
 *
 * checked?:boolean = The state of the current item if checkable
 *
 * callback?:function = Function to execute on clicking this menu item
 *
 */
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

/**
 * An array containing FlyoutMenuItem types, which are:
 *
 * label:string = String to display on menu
 *
 * id?:string = Arbitrary string for item matching
 *
 * enabled?:boolean = Whether menu item appears as clickable or disabled
 *
 * checkable?:boolean = Whether menu item can be toggled and displays checkmark
 *
 * checked?:boolean = The state of the current item if checkable
 *
 * callback?:function = Function to execute on clicking this menu item
 *
 */
export declare type FlyoutMenu = FlyoutMenuItem[];

/**
 *  A single entry within a ContextMenu array or collection.
 *  For a dividing line, use { label: "---" }
 *
 * label:string = String to display on menu
 *
 * id?:string = Arbitrary string for item matching
 *
 * enabled?:boolean = Whether menu item appears as clickable or disabled
 *
 * checkable?:boolean = Whether menu item can be toggled and displays checkmark
 *
 * checked?:boolean = The state of the current item if checkable
 *
 * callback?:function = Function to execute on clicking this menu item
 *
 * icon?:string = Relative path to icon which replaces check. Cannot co-exist with checkable/checked
 *
 * menu?:ContextMenuItem[] = A nested collection within this menu item
 */
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

/**
 * An array containing ContextMenuItem types, which are:
 *
 * label:string = String to display on menu
 *
 * id?:string = Arbitrary string for item matching
 *
 * enabled?:boolean = Whether menu item appears as clickable or disabled
 *
 * checkable?:boolean = Whether menu item can be toggled and displays checkmark
 *
 * checked?:boolean = The state of the current item if checkable
 *
 * callback?:function = Function to execute on clicking this menu item
 *
 * icon?:string = Relative path to icon which replaces check. Cannot co-exist with checkable/checked
 *
 * menu?:ContextMenuItem[] = A nested collection within this menu item
 */
export declare type ContextMenu = ContextMenuItem[];
