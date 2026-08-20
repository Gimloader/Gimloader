export interface EditorOptions {
    element: HTMLElement;
    code: string;
    onChange(): void;
}

export interface Editor {
    getValue(): string;
}

export type CreateEditor = (options: EditorOptions) => Editor;
