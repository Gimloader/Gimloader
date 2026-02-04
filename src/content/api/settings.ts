import type { Plugin } from "$core/scripts/plugin.svelte";
import type { PluginSettings, PluginSettingsDescription, SettingsMethods } from "$types/settings";
import { validate } from "$content/utils";
import { error } from "$shared/utils";
import Storage from "$core/storage.svelte";
import * as z from "zod";
import Modals from "$content/core/modals.svelte";

const BaseSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    onChange: z.function().optional()
});

const OptionSchema = z.object({
    label: z.string(),
    value: z.string()
});

const DropdownSchema = BaseSchema.extend({
    type: z.literal("dropdown"),
    default: z.string().optional(),
    options: z.array(OptionSchema),
    allowNone: z.boolean().optional()
});

const MultiselectSchema = BaseSchema.extend({
    type: z.literal("multiselect"),
    default: z.array(z.string()).optional(),
    options: z.array(OptionSchema)
});

const NumberSchema = BaseSchema.extend({
    type: z.literal("number"),
    default: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional()
});

const ToggleSchema = BaseSchema.extend({
    type: z.literal("toggle"),
    default: z.boolean().optional()
});

const TextSchema = BaseSchema.extend({
    type: z.literal("text"),
    default: z.string().optional(),
    placeholder: z.string().optional(),
    maxLength: z.number().optional()
});

const SliderSchema = BaseSchema.extend({
    type: z.literal("slider"),
    default: z.number().optional(),
    min: z.number(),
    max: z.number(),
    step: z.number().optional(),
    ticks: z.array(z.number()).optional(),
    formatter: z.function().optional()
});

const RadioSchema = BaseSchema.extend({
    type: z.literal("radio"),
    default: z.string().optional(),
    options: z.array(OptionSchema)
});

const ColorSchema = BaseSchema.extend({
    type: z.literal("color"),
    default: z.string().optional(),
    rgba: z.boolean().optional()
});

const CustomSchema = BaseSchema.extend({
    type: z.literal("custom"),
    default: z.any().optional(),
    render: z.function()
});

const CustomSectionSchema = z.object({
    type: z.literal("customsection"),
    id: z.string(),
    default: z.any().optional(),
    onChange: z.function().optional(),
    render: z.function()
});

const SettingSchema = z.discriminatedUnion("type", [
    DropdownSchema,
    MultiselectSchema,
    NumberSchema,
    ToggleSchema,
    TextSchema,
    SliderSchema,
    RadioSchema,
    ColorSchema,
    CustomSchema,
    CustomSectionSchema
]);

const GroupSchema = z.object({
    type: z.literal("group"),
    title: z.string(),
    settings: z.array(SettingSchema)
});

const DescriptionSchema = z.array(z.discriminatedUnion("type", [
    SettingSchema,
    GroupSchema
]));

function applyDefaults(id: string, settings: PluginSettingsDescription) {
    for(const setting of settings) {
        if(setting.type === "group") {
            applyDefaults(id, setting.settings);
            continue;
        }

        if(Storage.pluginSettings[id][setting.id] !== undefined) continue;

        let defaultValue: any = null;
        if(setting.default !== undefined) defaultValue = setting.default;
        else if(setting.type === "dropdown") defaultValue = setting.allowNone ? null : setting.options[0].value;
        else if(setting.type === "multiselect") defaultValue = [];
        else if(setting.type === "number" || setting.type === "slider") defaultValue = setting.min ?? 0;
        else if(setting.type === "toggle") defaultValue = false;
        else if(setting.type === "text") defaultValue = "";
        else if(setting.type === "radio") defaultValue = setting.options[0].value;
        else if(setting.type === "color") defaultValue = setting.rgba ? "rgba(255,0,0,1)" : "#ff0000";

        Storage.pluginSettings[id][setting.id] = defaultValue;
    }
}

function registerListeners(id: string, settings: PluginSettingsDescription) {
    for(const setting of settings) {
        if(setting.type === "group") {
            registerListeners(id, setting.settings);
            continue;
        }

        if(!setting.onChange) continue;
        Storage.onPluginSettingUpdate(id, setting.id, setting.onChange);
    }
}

export default function createSettingsApi(plugin: Plugin): PluginSettings {
    const id = plugin.headers.name;

    const methods: SettingsMethods = {
        create(description) {
            validate("settings.create", arguments, ["description", DescriptionSchema]);

            plugin.settingsDescription = description;
            plugin.openSettingsMenu.push(() => Modals.open("pluginSettings", { plugin }));

            Storage.pluginSettings[id] ??= {};
            applyDefaults(id, description);
            registerListeners(id, description);

            return this;
        },
        listen(key, callback, immediate = false) {
            validate("settings.listen", arguments, ["key", "string"], ["callback", "function"], ["immediate?", "boolean"]);

            if(immediate) callback(Storage.pluginSettings[id]?.[key], false);
            return Storage.onPluginSettingUpdate(id, key, callback);
        }
    };

    const settings = new Proxy(methods, {
        get(target, prop, receiver) {
            if(typeof prop !== "string") return null;

            const method = Reflect.get(target, prop, receiver);
            if(method) return method;

            return Storage.pluginSettings[id]?.[prop] ?? null;
        },
        set(_, prop, value) {
            if(typeof prop !== "string") return false;
            if(prop in methods) {
                error(`settings.${prop} is reserved and cannot be set`);
                return false;
            }

            Storage.setPluginSetting(id, prop, value);
            return true;
        }
    });

    return settings;
}
