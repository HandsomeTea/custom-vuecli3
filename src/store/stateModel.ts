export interface RootState {
    loginStatus: boolean;
    language: string;
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
    (language: 'zh-cn' | 'zh-tw' | 'en'): never;
}

export interface SetScreenTypeAction {
    (): never;
}
