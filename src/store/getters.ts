import { RootState, AuthState } from './stateModel';

export default {
    loginStatus: (state: RootState/*, getters*/): boolean => {
        return Boolean(state.user?.userId);
    },
    userPermission: (state: RootState): AuthState['auth'] => {
        return state.auth.auth;
    },
    userRole: (state: RootState): AuthState['role'] => {
        return state.auth.role;
    }
};
