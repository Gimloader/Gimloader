import { DropdownMenu as DropdownMenuPrimitive, type DropdownMenuRootProps } from "bits-ui";
import CheckboxGroup from "./dropdown-menu-checkbox-group.svelte";
import CheckboxItem from "./dropdown-menu-checkbox-item.svelte";
import Content from "./dropdown-menu-content.svelte";
import Group from "./dropdown-menu-group.svelte";
import Item from "./dropdown-menu-item.svelte";
import Label from "./dropdown-menu-label.svelte";
import RadioGroup from "./dropdown-menu-radio-group.svelte";
import RadioItem from "./dropdown-menu-radio-item.svelte";
import Separator from "./dropdown-menu-separator.svelte";
import Shortcut from "./dropdown-menu-shortcut.svelte";
import Trigger from "./dropdown-menu-trigger.svelte";
import SubContent from "./dropdown-menu-sub-content.svelte";
import SubTrigger from "./dropdown-menu-sub-trigger.svelte";
import GroupHeading from "./dropdown-menu-group-heading.svelte";
import type { Component } from "svelte";

// biome-ignore lint: typescript does not like the root type for some reason
type RootType = Component<DropdownMenuRootProps, {}, "open">;

const Root = DropdownMenuPrimitive.Root as RootType;
const Sub = DropdownMenuPrimitive.Sub;

export {
    CheckboxGroup,
    CheckboxGroup as DropdownMenuCheckboxGroup,
    CheckboxItem,
    CheckboxItem as DropdownMenuCheckboxItem,
    Content,
    Content as DropdownMenuContent,
    Group,
    Group as DropdownMenuGroup,
    GroupHeading,
    GroupHeading as DropdownMenuGroupHeading,
    Item,
    Item as DropdownMenuItem,
    Label,
    Label as DropdownMenuLabel,
    RadioGroup,
    RadioGroup as DropdownMenuRadioGroup,
    RadioItem,
    RadioItem as DropdownMenuRadioItem,
    Root,
    Root as DropdownMenu,
    Separator,
    Separator as DropdownMenuSeparator,
    Shortcut,
    Shortcut as DropdownMenuShortcut,
    Sub,
    Sub as DropdownMenuSub,
    SubContent,
    SubContent as DropdownMenuSubContent,
    SubTrigger,
    SubTrigger as DropdownMenuSubTrigger,
    Trigger,
    Trigger as DropdownMenuTrigger
};
