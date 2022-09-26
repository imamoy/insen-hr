<template lang="pug">
v-card
    v-card-text.pa-8(v-html='messageObj.message')
    v-card-actions.pa-8.pt-0
        v-row
            v-col(cols='6')
                v-btn(color='primary' outlined rounded block height='45' @click='onCancel') 取消
            v-col(cols='6')
                v-btn(color='primary' depressed rounded block height='45' @click='onConfirm') 確認
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        messageObj: {
            type:  Object
        }
    },
    methods: {
        onConfirm() {
            this.$emit('emitConfirm');
        },
        onCancel() {
            this.$emit('emitCancel');
        }
    }
});
</script>