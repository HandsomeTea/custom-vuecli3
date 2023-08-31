import { MutationTree, ActionTree, Module } from 'vuex';
import { AuthState, RootState } from './stateModel';
import Api from '@/api';

const state: AuthState = {
    role: 'user',
    auth: []
};
const mutations: MutationTree<AuthState> = {
    _setUserAuth(state: AuthState, auth: AuthState) {
        state.role = auth.role;
        state.auth = auth.auth;
    }
};

const actions: ActionTree<AuthState, RootState> = {
    async setUserAuth({ commit }, userId: string) {
        const auth = await Api.Account.getUserPermissions(userId);

        if (!auth.error) {
            return commit('_setUserAuth', auth.data);
        }
    }
};

const auth: Module<AuthState, RootState> = {
    namespaced: true,
    state,
    mutations,
    actions
};

export default auth;
