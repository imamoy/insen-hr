<template lang='pug'>
v-app
    router-view
    v-overlay(:value='getLoading' opacity=0.8 z-index='999')
        v-progress-circular(indeterminate :size='70' :width='7' color='blue')
    message-bar
</template>
<script>
import { mapGetters } from 'vuex';
import messageBar from '@/components/Dialog/MessageBar.vue';

export default {
    name: 'App',
    components: {
        messageBar
    },
    computed: {
        ...mapGetters(['getLoading'])
    },
    async created() {
        //在頁面載入時讀取sessionStorage裡的狀態資訊
        if (sessionStorage.getItem('store')) {
            this.$store.replaceState(
                Object.assign({}, this.$store.state, JSON.parse(sessionStorage.getItem('store') || ''))
            );
        }
        //在頁面重新整理時將vuex裡的資訊儲存到sessionStorage裡
        window.addEventListener('beforeunload', () => {
            sessionStorage.setItem('store', JSON.stringify(this.$store.state));
        });
    },
};
</script>
<style lang="scss">
@import './style/Main.scss'; // 共用的css
</style>
