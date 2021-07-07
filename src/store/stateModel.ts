export interface UserState {
    username: string;
}

export interface RootState {
    loginStatus: boolean;
    language: SupportLanguageType;
    menuHidden: boolean;
    screenType: 'phone' | 'ipad' | 'spc' | 'pc';
    user?: UserState
}
