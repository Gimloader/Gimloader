interface BaseKit {
    _id: string;
    title: string;
    creator: string;
    privacy: "private" | "public";
    isActive: boolean;
    __v: number;
}

export interface Game extends BaseKit {
    gif: string;
    source: string;
    originalSource: string;
    isArchived: boolean;
    editCount: number;
    isCopied: boolean;
    lang: string;
    subject: string;
    gradeLevel: any;
    createdAt: string;
    updatedAt: string;
    questionCount: number;
    playCount: number;
    searchResultMetadata: {
        _id: string;
        creatorAccountType: string;
        primaryQuestionSource: string;
    };
}

export interface Folder extends BaseKit {
    games: string[];
}

interface Answer {
    _id: string;
    text: string;
    correct: boolean;
}

interface BaseQuestion {
    type: string;
    source: string;
    answers: Answer[];
}

export interface QuestionEdit extends BaseQuestion {
    audio: string;
    image: string;
    kitId: string;
    questionText: string;
    replacingQuestion: string;
}

interface QuestionResponse extends BaseQuestion {
    _id: string;
    text: string;
    game: string;
    position: number;
    isActive: boolean;
    __v: number;
}

export interface QuestionAdded {
    question: QuestionResponse;
    replaceId: string;
}

export interface Creator {
    _id: string;
    name: string;
}