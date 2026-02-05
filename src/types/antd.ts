import type * as React from "react";

type NoticeType = "info" | "success" | "error" | "warning" | "loading";

type MessageSemanticClassNames = {
    root?: string;
    icon?: string;
    content?: string;
};

type MessageSemanticStyles = {
    root?: React.CSSProperties;
    icon?: React.CSSProperties;
    content?: React.CSSProperties;
};

type ArgsClassNamesType = MessageSemanticClassNames;

type ArgsStylesType = MessageSemanticStyles;

interface MessageConfigOptions {
    top?: string | number;
    duration?: number;
    prefixCls?: string;
    getContainer?: () => HTMLElement;
    transitionName?: string;
    maxCount?: number;
    rtl?: boolean;
    pauseOnHover?: boolean;
    classNames?: ArgsClassNamesType;
    styles?: ArgsStylesType;
}

interface MessageArgsProps {
    content: React.ReactNode;
    duration?: number;
    type?: NoticeType;
    onClose?: () => void;
    icon?: React.ReactNode;
    key?: string | number;
    style?: React.CSSProperties;
    className?: string;
    classNames?: ArgsClassNamesType;
    styles?: ArgsStylesType;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    pauseOnHover?: boolean;
}

type MessageJointContent = React.ReactNode | MessageArgsProps;

interface MessageType extends PromiseLike<boolean> {
    (): void;
}

type MessageTypeOpen = (
    content: MessageJointContent,
    duration?: number | VoidFunction,
    onClose?: VoidFunction
) => MessageType;

interface MessageInstance {
    info: MessageTypeOpen;
    success: MessageTypeOpen;
    error: MessageTypeOpen;
    warning: MessageTypeOpen;
    loading: MessageTypeOpen;
    open: (args: MessageArgsProps) => MessageType;
    destroy: (key?: React.Key) => void;
}

interface MessageBaseMethods {
    open: (config: MessageArgsProps) => MessageType;
    destroy: (key?: React.Key) => void;
    config: (config: MessageConfigOptions) => void;
    useMessage: () => MessageInstance;
    _InternalPanelDoNotUseOrYouWillBeFired: React.FC<any>;
}

interface MessageMethods {
    info: MessageTypeOpen;
    success: MessageTypeOpen;
    error: MessageTypeOpen;
    warning: MessageTypeOpen;
    loading: MessageTypeOpen;
}

const NotificationPlacements = ["top", "topLeft", "topRight", "bottom", "bottomLeft", "bottomRight"] as const;

type NotificationPlacement = (typeof NotificationPlacements)[number];

type NotificationIconType = "success" | "info" | "error" | "warning";

type NotificationSemanticClassNames = {
    root?: string;
    title?: string;
    description?: string;
    actions?: string;
    icon?: string;
};

type NotificationSemanticStyles = {
    root?: React.CSSProperties;
    title?: React.CSSProperties;
    description?: React.CSSProperties;
    actions?: React.CSSProperties;
    icon?: React.CSSProperties;
};

type NotificationClassNamesType = NotificationSemanticClassNames;

type NotificationStylesType = NotificationSemanticStyles;

interface NotificationDivProps extends React.HTMLProps<HTMLDivElement> {
    "data-testid"?: string;
}

interface NotificationArgsProps {
    message?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    btn?: React.ReactNode;
    actions?: React.ReactNode;
    key?: React.Key;
    onClose?: () => void;
    duration?: number | false;
    showProgress?: boolean;
    pauseOnHover?: boolean;
    icon?: React.ReactNode;
    placement?: NotificationPlacement;
    style?: React.CSSProperties;
    className?: string;
    classNames?: NotificationClassNamesType;
    styles?: NotificationStylesType;
    readonly type?: NotificationIconType;
    onClick?: () => void;
    closeIcon?: React.ReactNode;
    closable?: boolean | {
        onClose?: () => void;
    };
    props?: NotificationDivProps;
    role?: "alert" | "status";
}

type NotificationStaticFn = (args: NotificationArgsProps) => void;

interface NotificationInstance {
    success: NotificationStaticFn;
    error: NotificationStaticFn;
    info: NotificationStaticFn;
    warning: NotificationStaticFn;
    open: NotificationStaticFn;
    destroy: (key?: React.Key) => void;
}

interface NotificationGlobalConfigProps {
    top?: number;
    bottom?: number;
    duration?: number | false;
    showProgress?: boolean;
    pauseOnHover?: boolean;
    prefixCls?: string;
    getContainer?: () => HTMLElement | ShadowRoot;
    placement?: NotificationPlacement;
    closeIcon?: React.ReactNode;
    closable?: boolean | {
        onClose?: () => void;
    };
    rtl?: boolean;
    maxCount?: number;
    props?: NotificationDivProps;
}

interface NotificationBaseMethods {
    open: (config: NotificationArgsProps) => void;
    destroy: (key?: React.Key) => void;
    config: (config: NotificationGlobalConfigProps) => void;
    useNotification: () => NotificationInstance;
    _InternalPanelDoNotUseOrYouWillBeFired: React.FC<any>;
}

interface NotificationNoticeMethods {
    success: NotificationStaticFn;
    info: NotificationStaticFn;
    warning: NotificationStaticFn;
    error: NotificationStaticFn;
}

type ModalSemanticClassNames = {
    root?: string;
    header?: string;
    body?: string;
    footer?: string;
    container?: string;
    title?: string;
    wrapper?: string;
    mask?: string;
};

type ModalSemanticStyles = {
    root?: React.CSSProperties;
    header?: React.CSSProperties;
    body?: React.CSSProperties;
    footer?: React.CSSProperties;
    container?: React.CSSProperties;
    title?: React.CSSProperties;
    wrapper?: React.CSSProperties;
    mask?: React.CSSProperties;
};

type ModalClassNamesType = ModalSemanticClassNames;

type ModalStylesType = ModalSemanticStyles;

type ModalMousePosition = {
    x: number;
    y: number;
} | null;

type ModalGetContainerFunc = () => HTMLElement;

type ModalLegacyButtonType = "primary" | "dashed" | "default" | "text" | "link";

interface ModalCommonProps {
    footer?:
        | React.ReactNode
        | ((originNode: React.ReactNode, extra: {
            OkBtn: React.FC;
            CancelBtn: React.FC;
        }) => React.ReactNode);
    closable?: boolean | {
        onClose?: () => void;
        afterClose?: () => void;
    };
    classNames?: ModalClassNamesType;
    styles?: ModalStylesType;
}

interface ModalProps extends ModalCommonProps {
    open?: boolean;
    confirmLoading?: boolean;
    title?: React.ReactNode;
    onOk?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    afterClose?: () => void;
    afterOpenChange?: (open: boolean) => void;
    centered?: boolean;
    width?: string | number;
    okText?: React.ReactNode;
    okType?: ModalLegacyButtonType;
    cancelText?: React.ReactNode;
    maskClosable?: boolean;
    forceRender?: boolean;
    okButtonProps?: Record<string, any>;
    cancelButtonProps?: Record<string, any>;
    destroyOnClose?: boolean;
    destroyOnHidden?: boolean;
    style?: React.CSSProperties;
    wrapClassName?: string;
    maskTransitionName?: string;
    transitionName?: string;
    className?: string;
    rootClassName?: string;
    rootStyle?: React.CSSProperties;
    getContainer?: string | HTMLElement | ModalGetContainerFunc | false;
    zIndex?: number;
    bodyStyle?: React.CSSProperties;
    maskStyle?: React.CSSProperties;
    mask?: boolean | "static";
    keyboard?: boolean;
    wrapProps?: any;
    prefixCls?: string;
    closeIcon?: React.ReactNode;
    modalRender?: (node: React.ReactNode) => React.ReactNode;
    children?: React.ReactNode;
    mousePosition?: ModalMousePosition;
    loading?: boolean;
    focusTriggerAfterClose?: boolean;
    focusable?: {
        focusTriggerAfterClose?: boolean;
    };
}

interface ModalFuncProps extends ModalCommonProps {
    prefixCls?: string;
    className?: string;
    rootClassName?: string;
    open?: boolean;
    title?: React.ReactNode;
    content?: React.ReactNode;
    onOk?: (...args: any[]) => any;
    onCancel?: (...args: any[]) => any;
    afterClose?: () => void;
    okButtonProps?: Record<string, any>;
    cancelButtonProps?: Record<string, any>;
    centered?: boolean;
    width?: string | number;
    okText?: React.ReactNode;
    okType?: ModalLegacyButtonType;
    cancelText?: React.ReactNode;
    icon?: React.ReactNode;
    mask?: boolean | "static";
    maskClosable?: boolean;
    zIndex?: number;
    okCancel?: boolean;
    style?: React.CSSProperties;
    wrapClassName?: string;
    maskStyle?: React.CSSProperties;
    type?: "info" | "success" | "error" | "warn" | "warning" | "confirm";
    keyboard?: boolean;
    getContainer?: string | HTMLElement | ModalGetContainerFunc | false;
    transitionName?: string;
    maskTransitionName?: string;
    direction?: "ltr" | "rtl";
    bodyStyle?: React.CSSProperties;
    closeIcon?: React.ReactNode;
    footer?: ModalProps["footer"];
    modalRender?: (node: React.ReactNode) => React.ReactNode;
    focusTriggerAfterClose?: boolean;
    autoFocusButton?: null | "ok" | "cancel";
    focusable?: {
        focusTriggerAfterClose?: boolean;
        autoFocusButton?: null | "ok" | "cancel";
    };
}

type ModalConfigUpdate = ModalFuncProps | ((prevConfig: ModalFuncProps) => ModalFuncProps);

interface ModalFuncReturn {
    destroy: () => void;
    update: (configUpdate: ModalConfigUpdate) => void;
}

type ModalFunc = (props: ModalFuncProps) => ModalFuncReturn;

interface ModalStaticFunctions {
    info: ModalFunc;
    success: ModalFunc;
    error: ModalFunc;
    warning: ModalFunc;
    confirm: ModalFunc;
    warn: ModalFunc;
}

interface ModalBaseMethods {
    useModal: () => [api: any, contextHolder: React.ReactNode];
    destroyAll: () => void;
    config: (config: { rootPrefixCls: string }) => void;
    _InternalPanelDoNotUseOrYouWillBeFired: React.FC<any>;
}

export type Notification = NotificationNoticeMethods & NotificationBaseMethods;

export type Message = MessageMethods & MessageBaseMethods;

export type Modal = React.FC<ModalProps> & ModalStaticFunctions & ModalBaseMethods;
