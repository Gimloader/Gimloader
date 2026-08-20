import * as Accordion from "$shared/ui/accordion";
import * as Dialog from "$shared/ui/dialog";
import * as AlertDialog from "$shared/ui/alert-dialog";
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

export interface SvelteComponents {
    Accordion: typeof Accordion;
    Dialog: typeof Dialog;
    AlertDialog: typeof AlertDialog;
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
}

const Components: SvelteComponents = {
    Accordion,
    Dialog,
    AlertDialog,
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
    Switch
};

export default Components;
