export interface BaseSetting<K extends string, T> {
    id: K;
    default?: T;
    onChange?: (value: T, remote: boolean) => void;
}

export interface NamedSetting<K extends string, T> extends BaseSetting<K, T> {
    title: string;
    description?: string;
}

export interface DropdownSetting<K extends string> extends NamedSetting<K, string> {
    type: "dropdown";
    options: { label: string; value: string }[];
    allowNone?: boolean;
}

export interface MultiselectSetting<K extends string> extends NamedSetting<K, string[]> {
    type: "multiselect";
    options: { label: string; value: string }[];
}

export interface NumberSetting<K extends string> extends NamedSetting<K, number> {
    type: "number";
    min?: number;
    max?: number;
    step?: number;
}

export interface ToggleSetting<K extends string> extends NamedSetting<K, boolean> {
    type: "toggle";
}

export interface TextSetting<K extends string> extends NamedSetting<K, string> {
    type: "text";
    placeholder?: string;
    maxLength?: number;
}

export interface SliderSetting<K extends string> extends NamedSetting<K, number> {
    type: "slider";
    min: number;
    max: number;
    step?: number;
    ticks?: number[];
    formatter?: (value: number) => string;
}

export interface RadioSetting<K extends string> extends NamedSetting<K, string> {
    type: "radio";
    options: { label: string; value: string }[];
}

export interface ColorSetting<K extends string> extends NamedSetting<K, string> {
    type: "color";
    rgba?: boolean;
}

export interface CustomSetting<K extends string, T = any> extends NamedSetting<K, T> {
    type: "custom";
    render: (container: HTMLElement, currentValue: T, update: (newValue: T) => void) => (() => void) | void;
}

export interface CustomSection<K extends string, T = any> extends BaseSetting<K, T> {
    type: "customsection";
    render: (container: HTMLElement, currentValue: T, onChange: (newValue: T) => void) => (() => void) | void;
}

export type PluginSetting<K extends string> =
    | DropdownSetting<K>
    | MultiselectSetting<K>
    | NumberSetting<K>
    | ToggleSetting<K>
    | TextSetting<K>
    | SliderSetting<K>
    | RadioSetting<K>
    | ColorSetting<K>
    | CustomSetting<K>
    | CustomSection<K>;

export interface SettingGroup {
    type: "group";
    title: string;
    settings: PluginSetting<any>[];
}

export type PluginSettingsDescription = (PluginSetting<any> | SettingGroup)[];
export type SettingsChangeCallback = (value: any, remote: boolean) => void;

// There's probably some black magic that can be done to get rid of this
export type DescriptionToReturnType<T extends PluginSetting<any>> = T extends DropdownSetting<any> ? string
    : T extends MultiselectSetting<any> ? string[]
    : T extends NumberSetting<any> ? number
    : T extends ToggleSetting<any> ? boolean
    : T extends TextSetting<any> ? string
    : T extends SliderSetting<any> ? number
    : T extends RadioSetting<any> ? string
    : T extends ColorSetting<any> ? string
    : T extends CustomSetting<any, infer V> ? V
    : T extends CustomSection<any, infer V> ? V
    : never;

type ExtractSettingObject<T> = T extends PluginSetting<infer Id> ? { [K in Id]: DescriptionToReturnType<T> }
    : T extends SettingGroup ? ExtractSettingObject<T["settings"][number]>
    : never;

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

export interface SettingsMethods {
    create<const T extends PluginSettingsDescription>(description: T): UnionToIntersection<ExtractSettingObject<T[number]>>;
    listen(key: string, callback: SettingsChangeCallback, immediate?: boolean): () => void;
}

export type PluginSettings = SettingsMethods & Record<string, any>;
