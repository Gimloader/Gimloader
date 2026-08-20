import type { Untyped } from "$types/util";

export namespace ClassicStores {
    export interface LastDrawRound {
        amount: number;
        metadata: number;
        type: "correct" | "speed" | "firstGuess" | "goodDrawer";
    }

    export interface Me {
        answeredCorrectly: boolean;
        lastRound: null | LastDrawRound[];
        role: "Guesser" | "Drawer";
    }

    export interface Drawer {
        id: string;
        name: string;
    }

    export interface TermOption {
        id: string;
        term: string;
    }

    export interface DrawRound {
        drawer: Drawer;
        drawingBase64: string;
        revealText: string;
        secondsLeft: number;
        term: string;
        termOptions: TermOption[];
    }

    export interface FeedItem {
        action: string;
        actionColor: HexColor;
        important: boolean;
    }

    export interface Line {
        color: string;
        width: number;
        xEnd: number;
        xStart: number;
        yEnd: number;
        yStart: number;
    }

    export interface PersonCount {
        correct: number;
        total: number;
    }

    export interface Drawing {
        image: string;
        index: number;
        name: string;
        term: string;
    }

    export interface PointAddition {
        amount: number;
        id: string;
        name: string;
    }

    export interface BaseDraw {
        latestFeedItem: FeedItem | null;
        latestLine: Line | null;
        round: DrawRound;
        status: "pickDrawer" | "results" | "termSelection" | "drawing";
    }

    export interface HostDraw extends BaseDraw {
        drawingHistory: Drawing[];
        drawingsModalOpen: boolean;
        everybodyGotLastRoundCorrect: boolean;
        personCount: PersonCount | null;
        pointAdditions: PointAddition[];
        showingFeed: boolean;
    }

    export interface GuestDraw extends BaseDraw {
        me: Me;
        shouldClearCanvas: boolean;
    }

    export interface Lava {
        buildHeight: number;
        buildPieces: number;
        buildsInProgress: number;
        lavaHeight: number;
        lavaIncreasePaused: boolean;
        lavaIncreaseSpeed: number;
        secondsLasted: number;
    }

    export interface DefendingHomebase {
        backgroundColor: HexColor;
        health: number;
        healthDecreasePerTick: number;
        healthRegenPerTick: number;
        icon: string;
        id: string;
        linkedWith: string;
        maxHealth: number;
        name: string;
    }

    export interface BaseEntities {
        lava: Lava | null;
    }

    export interface HostEntities extends BaseEntities {
        defendingHomebase: DefendingHomebase[] | null;
    }

    export interface GuestEntities extends BaseEntities {
        defendingHomebase: DefendingHomebase | null;
    }

    export interface Goal {
        type: string;
        value: number;
    }

    export type Currency = "$" | "€" | "¥" | "£" | "X̶" | "₩";

    export interface GameOptions {
        allowGoogleTranslate: boolean;
        clapping: boolean;
        cleanPowerupsOnly: boolean;
        currency: Currency;
        enablePowerupRNGAnimation: boolean;
        goal: Goal;
        group: string;
        handicap: number;
        language: string;
        modeOptions: any;
        music: boolean;
        powerups: boolean;
        specialGameType: string[];
        startingCash: number;
        themes: boolean;
        type: string;
    }

    export interface BaseGameOptionsStore extends GameOptions {
        formattedGameOptions: GameOptions;
    }

    export interface HostGameOptions extends BaseGameOptionsStore {
        setGameOptionsFromStorage: (gameOptions: GameOptions, defaultValues: boolean) => void;
    }

    export interface GuestGameOptions extends BaseGameOptionsStore {
        setGameOptions: (gameOptions: GameOptions) => void;
    }

    export interface NonDismissMessage {
        buttonText: string;
        link: string;
        message: string;
        title: string;
    }

    export interface NewsItem {
        tag: string;
        header: string;
        image: string;
        description: string;
    }

    export interface SimplePlayer {
        id: string;
        name: string;
    }

    export interface ThanosValues {
        saved: SimplePlayer[];
        showAt: number;
        snapped: SimplePlayer[];
        winner: SimplePlayer;
    }

    export interface ActivityItem {
        action: string;
        customTextColor: HexColor;
        key: string;
        name: string;
    }

    export interface LinkedPlayer extends SimplePlayer {
        linked: string;
    }

    export interface DefendingHomebaseResults {
        loser: LinkedPlayer;
        winner: LinkedPlayer;
        winnerPlayerNames: string[];
    }

    export type GameStatus = "results" | "teams" | "gameplay";

    export interface BaseGameValues {
        gameCode: string | null;
        thanosValues: ThanosValues | null;
    }

    export interface HostGameValues extends BaseGameValues {
        activityItems: ActivityItem[];
        availableThemes: ShopTheme[];
        bossId: string | null;
        clapCount: number;
        currentRoute: string;
        defendingHomebaseResults: null | DefendingHomebaseResults;
        gameEndDate: number;
        reportId: string;
        roomIntentErrorMessage: string;
        showBossBattleModal: boolean;
    }

    export interface GuestGameValues extends BaseGameValues {
        connected: boolean;
        connectionError: boolean;
        gameStatus: GameStatus;
        news: NewsItem[];
        nonDismissMessage: NonDismissMessage;
        players: Player[];
        teams: Theme[];
    }

    export interface ShopItem {
        background: HexColor;
        cost: number;
        description: string;
        icon: string;
        id: string;
        name: string;
    }

    export type Role = "imposter" | "detective";

    export interface ImposterMe {
        blendingIn: boolean;
        canNeverBeClear: boolean;
        currentVote: string;
        id: string;
        markedAsClear: boolean;
        name: string;
        notes: string;
        role: Role;
        votedOff: boolean;
    }

    export interface MeetingResult {
        name: string;
        wasImposter: boolean;
    }

    export interface Person {
        canNeverBeClear: boolean;
        id: string;
        markedAsClear: boolean;
        name: string;
        role: Role;
        votedOff: boolean;
    }

    export type Status = "intro" | "questions" | "discussion" | "voting" | "votingResult";

    export interface BaseImposter {
        impostersLeft: number;
        investigationsLeft: number;
        meetingsLeft: number;
        status: Status;
    }

    export interface HostImposter extends BaseImposter {
        meetingResults: MeetingResult | null;
        people: Person[];
        votes: number;
    }

    export interface GuestImposter extends BaseImposter {
        currentShopItem: string | null;
        currentShopItemModalVisible: boolean;
        epl: string | null;
        me: ImposterMe | null;
        noteDrawerOpen: boolean;
        roleModalOpen: boolean;
        shopItems: ShopItem[];
    }

    export interface AttackModal {
        open: boolean;
        powerup: string;
    }

    export type CurrentShopTab = "defendingHomebase" | "upgrades" | "powerups" | "themes" | "powerupsNonMusic" | "powerupsMusic" | "lava";

    export interface NavigationStore {
        attackModal: AttackModal;
        canChangeRoute: boolean;
        currentRoute: string;
        currentShopTab: CurrentShopTab;
        drawerOpen: boolean;
        leaderboardDrawerOpen: boolean;
        powerupRNGAnimationDone: boolean;
        settingsOpen: boolean;
        visitedPowerupSection: boolean;
        changeRoute(route: string): void;
    }

    export interface Power {
        background: HexColor;
        description: string;
        id: string;
        image: string;
        name: string;
    }

    export interface Item {
        amount: number;
        id: string;
        questionId: string;
    }

    export interface Category {
        name: string;
        items: Item[];
    }

    export interface Board {
        categories: Category[];
    }

    export interface RoundValue {
        category: string;
        id: string;
    }

    export interface NormalRound {
        type: "Normal";
        value: RoundValue;
    }

    export interface FinaleRound {
        type: "Finale";
        value: undefined;
    }

    export type Round = NormalRound | FinaleRound;

    export type QuestionScreen = "preview" | "finale" | "question";
    export type QuestionStatus = "preview" | "ask" | "timesUp";
    export type Screen = "home" | "question" | "question" | "answer";

    export interface BasePardy {
        powers: Power[];
        questionScreen: QuestionScreen;
        questionStatus: QuestionStatus;
        screen: Screen;
    }

    export interface HostPardy extends BasePardy {
        betsPlaced: number;
        board: Board | null;
        currentRound: Round | null;
        disabledSections: string[];
        finaleQuestionId: string;
        nameOfFirstPlayerToAnswerCorrectly: string;
        playerCount: number;
        playersAnswered: number;
        playersAnsweredCorrectly: number;
    }

    export interface GuestPardy extends BasePardy {
        animatingBetScreenOut: boolean;
        animatingQuestionScreenOut: boolean;
        answerLockedInWittyMessages: string[];
        answerResponseItems: string[];
        answered: boolean;
        answeredCorrectly: boolean;
        correctWittyMessages: string[];
        currentBet: number;
        currentQuestion: Question | null;
        incorrectWittyMessages: string[];
        maxBet: number;
        power: string;
        powerOptions: string[];
        tips: string[];
    }

    export interface Player {
        activePowerups: string[];
        balance: number;
        id: string;
        name: string;
        theme: string;
        /** Only in the "What Is..." gamemode */
        power?: string;
    }

    export interface Team {
        activePowerups: string[];
        balance: number;
        color: Theme;
        icon: string | undefined;
        id: string;
        players: string[];
    }

    export interface Players {
        finalResults: Player[];
        players: Player[];
        teams: Team[];
        filteredPlayers: Player[];
        totalBalance: number;
        totalStones: number;
    }

    export interface Powerup {
        baseCost: number;
        color: HexColor;
        description: string;
        disabled: string[];
        displayName: string;
        icon: string;
        name: string;
        percentageCost: number;
    }

    export interface ScreenAttack {
        attackerName: string;
        fullScreen: boolean;
        powerupName: string;
    }

    export interface HostPowerups {
        specialSongIsPlaying: boolean;
    }

    export interface GuestPowerups {
        availablePowerups: Powerup[];
        disabledPowerups: Powerup[];
        hasShownHelperModal: boolean;
        linkPartnerName: string;
        personalActivePowerups: Powerup[];
        purchasedPowerups: Powerup[];
        screenAttack: ScreenAttack;
        teamActivePowerups: Powerup[];
        teamAppliedPowerups: Powerup[];
        usedPowerups: Powerup[];
        activePowerups: Powerup[];
        appliedPowerups: Powerup[];
    }

    export interface Answer {
        correct: boolean;
        text: string;
        _id: string;
    }

    export interface Question {
        answers: Answer[];
        game: string;
        image: string;
        isActive: boolean;
        position: number;
        source: string;
        text: string;
        type: string;
        __v: number;
        _id: string;
    }

    export interface Questions {
        canAnswerQuestion: boolean;
        ceq: string;
        currentQuestionIndex: number;
        currentQuestionLoaded: boolean;
        eqt: string;
        lastQuestion: string;
        lastQuestionAnsweredTimestamp: number;
        lockedViewingCorrectAnswer: boolean;
        /** A list of the IDs of all the questions. */
        questionList: string[];
        questionsAnsweredCorrectly: number;
        questionsAnsweredIncorrectly: number;
        transitioningToNextQuestion: boolean;
        nextQuestion: () => void;
        questionAnswered: (lastQuestionCorrect: string, lastQuestion: string) => void;
        setCurrentQuestion: (index: number) => void;
        setQuestions: (questions: Question[]) => void;
    }

    export type HexColor = `#${string}`;

    export interface Theme {
        background: HexColor;
        text?: string;
    }

    export interface ShopTheme {
        cost: number;
        description: string;
        name: string;
        palette: Theme[];
        question: Theme;
    }

    export interface ActiveThemeResponse {
        continue: Theme;
        correctAnswer: Theme;
        incorrectAnswer: Theme;
        shop: Theme;
    }

    export interface ActiveTheme {
        defaultBackground: HexColor;
        desktopBreakpoint: number;
        palette: Theme[];
        question: Theme;
        response: ActiveThemeResponse;
    }

    export interface ThemeStore {
        availableThemes: ShopTheme[];
        disabledThemes: string[];
        ownedThemes: string[];
        theme: ActiveTheme;
        themeName: string;
    }

    export interface SuccessModalInfo {
        background: string;
        color: string;
        description: string;
        icon: string;
        sound?: string;
        textOptions?: Untyped;
        title: string;
    }

    export interface GuestUI {
        blurredScreen: boolean;
        fullBlackScreen: boolean;
        showingSuccessModal: boolean;
        snowing: boolean;
        successModalInfo: SuccessModalInfo[];
    }

    export interface HostUI {
        backgroundColor: HexColor;
        showingBossPreScreen: boolean;
        showingClassTip: boolean;
        showingHumansVsZombiesPreScreen: boolean;
        showingLavaPreScreen: boolean;
        snowing: boolean;
    }

    export interface Level {
        price: number;
        value: number;
    }

    export interface Upgrade {
        description: string;
        icon: string;
        levels: Level[];
        name: string;
    }

    export interface LavaUpgrade {
        background: HexColor;
        description: string;
        icon: string;
        id: string;
        name: string;
        price: number;
    }

    export interface HomebaseUpgrade {
        background: HexColor;
        baseCost: number;
        description: string;
        icon: string;
        id: string;
        name: string;
    }

    export interface UpgradeLevels {
        insurance: number;
        moneyPerQuestion: number;
        multiplier: number;
        streakBonus: number;
    }

    export interface Upgrades {
        currentlySelectedUpgrade: string;
        homebaseUpgades: HomebaseUpgrade[];
        lavaUpgrades: LavaUpgrade[];
        upgradeLevelTabs: UpgradeLevels;
        upgradeLevels: UpgradeLevels;
        upgradePricingDiscount: number;
        upgrades: Upgrade[];
    }

    export interface TeamMeta {
        isBoss?: boolean;
    }

    export interface UserTeam {
        color: Theme;
        icon?: string;
        id: string;
        meta: TeamMeta;
    }

    export interface User {
        groupId: string;
        groupMemberId: string;
        name: string;
        place: number;
        readToMeEnabled: boolean;
        team: UserTeam | null;
        theme: string;
    }

    export interface Balance {
        balance: number;
        balanceChangeIfCorrect: number;
        balanceChangeIfIncorrect: number;
        customColor: string;
        incomeMultiplier: number;
        maxBalance: number;
        streakAmount: number;
    }

    export interface Kit {
        questions: Question[];
    }

    export interface Metadata {
        currentGameIsUsingGroups: boolean;
        hasReceivedHostStaticState: boolean;
    }

    export interface Stats {
        playerStats: Untyped[];
    }

    export interface BaseClassicStores {
        events: Record<string, Untyped>;
        engine: Untyped;
    }

    export interface HostClassicStores extends BaseClassicStores {
        draw: HostDraw;
        entities: HostEntities;
        gameOptions: HostGameOptions;
        gameValues: HostGameValues;
        imposter: HostImposter;
        kit: Kit;
        metadata: Metadata;
        pardy: HostPardy;
        players: Players;
        powerups: HostPowerups;
        /** Appears to be unused by Gimkit */
        stats: Stats;
        translations: Untyped;
        ui: HostUI;
    }

    export interface GuestClassicStores extends BaseClassicStores {
        balance: Balance;
        draw: GuestDraw;
        entities: GuestEntities;
        gameOptions: GuestGameOptions;
        gameValues: GuestGameValues;
        imposter: GuestImposter;
        navigation: NavigationStore;
        pardy: GuestPardy;
        powerups: GuestPowerups;
        questions: Questions;
        theme: ThemeStore;
        translations: Untyped;
        ui: GuestUI;
        upgrades: Upgrades;
        user: User;
    }

    export type ClassicStores = HostClassicStores | GuestClassicStores;
}
