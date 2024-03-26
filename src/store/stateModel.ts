type UserType = 'admin' | 'user';

export enum PermissionType {
    add = 'add',
    delete = 'delete',
    update = 'update'
}

export interface UserState {
    token?: string
    user?: {
        id: string
        name: string
        phone: { number?: string, verify?: boolean }
        email: { address?: string, verify?: boolean }
        avatar?: { url: string, updateAt: Date }
        type: Array<UserType>
        role: Array<string>
    }
    permission?: Record<string, Set<string>>
    targetView?: string
}

export interface RootState {
    language: SupportLanguageType;
    menuHidden: boolean;
    screenType: 'phone' | 'ipad' | 'spc' | 'pc';
    user: UserState
}
