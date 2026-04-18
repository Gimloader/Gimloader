interface FreeTrial {
    currentlyOnFreeTrial: boolean;
    freeTrialExtended: boolean;
    extendedFreeTrialCompleted: boolean;
    freeTrialCompleted: boolean;
}

interface SeasonTicket {
    active: boolean;
    viewed?: boolean;
}

export interface UserData {
    _id: string;
    firstName: string;
    lastName: string;
    accountType: string;
    email: string;
    type: string;
    planSource: string;
    planStartDate: number;
    areaOfExpertise: any;
    gradeLevel: any;
    acceptedLatestPolicies: boolean;
    passwordless: boolean;
    tokenIssued: number;
    token: string;
    freeTrial: FreeTrial;
    schoolId: string | null;
    districtId: string | null;
    schoolName: string;
    districtName: string;
    seasonTicket: SeasonTicket;
}

export interface InformationUpdate {
    key: string;
    value: string;
}