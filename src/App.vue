<template>
    <router-view />
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import { Action } from 'vuex-class';
import { Store, useStore } from 'vuex';
import { Ref, ref, watch } from 'vue';
import { SetScreenTypeAction, RootState } from './store/stateModel';

export default class App extends Vue {
    setup(): { language: Ref<SupportLanguageType> } {
        const store: Store<RootState> = useStore();

        console.log(store);
        const language = ref(store.state.language);

        watch(language, () => {
            console.log(language);
        });

        return {
            language
        };
    }

    created(): void {
        this.setWindowSize();
    }

    mounted(): void {
        let waitForResizeEndTimer: null | number = null;

        window.onresize = () => {
            const waitTime = 500;

            if (waitForResizeEndTimer === null) {
                waitForResizeEndTimer = window.setTimeout(() => {
                    this.setWindowSize();
                }, waitTime);
            } else {
                clearTimeout(waitForResizeEndTimer);
                waitForResizeEndTimer = window.setTimeout(() => {
                    this.setWindowSize();
                }, waitTime);
            }
        };
    }

    @Action('setScreenType')
    private setWindowSize!: SetScreenTypeAction;

    // @State('language')
    // private language!: string;

    // private get currentLang(): string {
    //     return this.language;
    // }
}
</script>
