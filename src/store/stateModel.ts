export interface UserState {
    userId: string
    account: string
    token: string
    targetView?: string
}

export type PermissionType = {
    add: boolean
    delete: boolean
    update: boolean
};

export interface AuthState {
    role: 'admin' | 'user'
    auth: Array<{ page: string } & PermissionType>
}

export interface RootState {
    language: SupportLanguageType;
    menuHidden: boolean;
    screenType: 'phone' | 'ipad' | 'spc' | 'pc';
    user: UserState
    auth: AuthState
}
