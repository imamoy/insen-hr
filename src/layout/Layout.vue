<template lang="pug">
.layout
	menu-bar
	v-main
		router-view
</template>

<script lang="ts">
import _ from 'lodash';
import Vue from 'vue';
import { mapGetters } from 'vuex';
import MenuBar from './MenuBar.vue';

export default Vue.extend({
	components: {
		MenuBar
	},
	created() {
		if (this.accountNotLogin) {
			this.$router.push("/");
		}
	},
	computed: {
		...mapGetters(['getAccount']),

		accountNotLogin() {
			return _.isEmpty(this.getAccount);
		},
	},
});
</script>