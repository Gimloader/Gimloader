interface SmallGroup {
    _id: string;
    name: string;
    color: string;
}

export interface FullGroup extends SmallGroup {
    creatorName: string;
}

export interface HubItem {
    type: string;
    dueDate: string;
    title: string;
    group: SmallGroup;
    resourceId: string;
    status: string;
}