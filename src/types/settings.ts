export interface BaseSetting<T> {
    id: string;
    default?: T;
    title: string;
    description?: string;
    onChange?: (value: T, remote: boolean) => void;
}

export interface DropdownSetting extends BaseSetting<string> {
    type: "dropdown";
    options: { label: string; value: string }[];
    allowNone?: boolean;
}

export interface MultiselectSetting extends BaseSetting<string[]> {
    type: "multiselect";
    options: { label: string; value: string }[];
}

export interface NumberSetting extends BaseSetting<number> {
    type: "number";
    min?: number;
    max?: number;
    step?: number;
}

export interface ToggleSetting extends BaseSetting<boolean> {
    type: "toggle";
}

export interface TextSetting extends BaseSetting<string> {
    type: "text";
    placeholder?: string;
    maxLength?: number;
}

export interface SliderSetting extends BaseSetting<number> {
    type: "slider";
    min: number;
    max: number;
    step?: number;
    ticks?: number[];
    formatter?: (value: number) => string;
}

export interface RadioSetting extends BaseSetting<string> {
    type: "radio";
    options: { label: string; value: string }[];
}

export interface ColorSetting extends BaseSetting<string> {
    type: "color";
    rgba?: boolean;
}

export interface CustomSetting<T = any> extends BaseSetting<T> {
    type: "custom";
    render: (container: HTMLElement, currentValue: T, update: (newValue: T) => void) => (() => void) | void;
}

export interface CustomSection<T = any> {
    type: "customsection";
    id: string;
    default?: T;
    onChange?: (value: T, remote: boolean) => void;
    render: (container: HTMLElement, currentValue: T, onChange: (newValue: T) => void) => (() => void) | void;
}

export type PluginSetting = DropdownSetting | MultiselectSetting | NumberSetting | ToggleSetting | TextSetting | SliderSetting | RadioSetting | ColorSetting | CustomSetting | CustomSection;

export interface SettingGroup {
    type: "group";
    title: string;
    settings: PluginSetting[];
}

export type PluginSettingsDescription = (PluginSetting | SettingGroup)[];
export type SettingsChangeCallback = (value: any, remote: boolean) => void;

export interface SettingsMethods {
    create: (description: PluginSettingsDescription) => void;
    listen: (key: string, callback: SettingsChangeCallback) => () => void;
}

export type PluginSettings = SettingsMethods & Record<string, any>;
