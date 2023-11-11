/**
 * For internal Volt-CEP use
 *
 * Many components will have additional required parameters set with defaults used within
 * SFC files. To avoid confusion and importing bloat, it'd be best to separate them here
 * so users can more easily draw intended generic surface types from './Volt/types'
 */

import type { FlyoutMenuItem, ContextMenuItem } from "./index";

export declare interface FlyoutMenuItemProp<T = any> extends FlyoutMenuItem<T> {
  /** Arbitrary string for item matching, mandatory for props due to need for matching key/value and generated */
  id: string;
}
export declare type FlyoutMenuProp = FlyoutMenuItemProp[];

export declare interface ContextMenuItemProp<T = any>
  extends ContextMenuItem<T> {
  /** Arbitrary string for item matching, mandatory for props due to need for matching key/value and generated */
  id: string;
  /** Whether menu item appears as clickable or disabled */
  enabled: boolean;
  /** Whether menu item can be toggled and displays checkmark */
  checkable: boolean;
  /** The state of the current item if checkable, true = checked, false = unchecked */
  checked: boolean;
}
export declare type ContextMenuProp = ContextMenuItemProp[];
