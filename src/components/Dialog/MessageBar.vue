<template lang="pug">
v-snackbar.ma-4(v-model='showAlert' :color='getMessageBar.type' timeout='3000' max-width='500' :left='showLeft' bottom) {{ getMessageBar.message }}
</template>

<script lang="ts">
import _ from 'lodash';
import Vue from 'vue';
import { mapGetters } from 'vuex';

export default Vue.extend({
	data() {
		return {
			objects: [],
		};
	},
	computed : {
		...mapGetters(['getMessageBar']),
		showAlert: {
			get() {
				return _.isEmpty(this.getMessageBar) ? false : true;
			},
			set(value)	{
				this.$store.commit('SET_MESSAGE_BAR', value);
			},
		},
		showLeft() {
			return this.getMessageBar.type === 'error' ? true : false;
		}
	},
});
</script>