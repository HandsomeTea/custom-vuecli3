export interface RootState {
    loginStatus: boolean;
    language: SupportLanguageType;
    menuHidden: boolean;
    screenType: 'phone' | 'ipad' | 'spc' | 'pc';
}

export interface UserState {
    username: string;
}

export interface ToogleSideAction {
    (): never;
}

export interface SetLanguageAction {
    (language: SupportLanguageType): never;
}

export interface SetScreenTypeAction {
    (): never;
}
