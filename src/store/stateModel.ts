export interface UserState {
    token?: string
    user?: {
        email?: { address: string, verify: boolean }
        id: string
        name: string
        phone: { number: string, verify: boolean }
        role?: Array<string>
        type: Array<string>
    }
    role?: string
    targetView?: string
}

export enum PermissionType {
    add = 'add',
    delete = 'delete',
    update = 'update'
}

export interface RootState {
    language: SupportLanguageType;
    menuHidden: boolean;
    screenType: 'phone' | 'ipad' | 'spc' | 'pc';
    user: UserState
}
