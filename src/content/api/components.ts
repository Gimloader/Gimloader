import * as Accordion from "$shared/ui/accordion";
import * as Dialog from "$shared/ui/dialog";
import * as AlertDialog from "$shared/ui/alert-dialog";
import * as ContextMenu from "$shared/ui/context-menu";
import * as DropdownMenu from "$shared/ui/dropdown-menu";
import * as Popover from "$shared/ui/popover";
import * as RadioGroup from "$shared/ui/radio-group";
import * as Separator from "$shared/ui/separator";
import * as Tabs from "$shared/ui/tabs";
import * as Tooltip from "$shared/ui/tooltip";
import { Button } from "$shared/ui/button";
import { Progress } from "$shared/ui/progress";
import { Slider } from "$shared/ui/slider";
import { Spinner } from "$shared/ui/spinner";
import { Switch } from "$shared/ui/switch";
import ColorPicker from "svelte-awesome-color-picker";

export interface SvelteComponents {
    Accordion: typeof Accordion;
    Dialog: typeof Dialog;
    AlertDialog: typeof AlertDialog;
    ContextMenu: typeof ContextMenu;
    DropdownMenu: typeof DropdownMenu;
    Popover: typeof Popover;
    RadioGroup: typeof RadioGroup;
    Separator: typeof Separator;
    Tabs: typeof Tabs;
    Tooltip: typeof Tooltip;
    Button: typeof Button;
    Progress: typeof Progress;
    Slider: typeof Slider;
    Spinner: typeof Spinner;
    Switch: typeof Switch;
    ColorPicker: typeof ColorPicker;
}

/** @hidden */
const Components: SvelteComponents = {
    Accordion,
    Dialog,
    AlertDialog,
    ContextMenu,
    DropdownMenu,
    Popover,
    RadioGroup,
    Separator,
    Tabs,
    Tooltip,
    Button,
    Progress,
    Slider,
    Spinner,
    Switch,
    ColorPicker
};

export default Components;
