<template lang="pug">
v-card
	v-card-title.d-flex.flex-nowrap.justify-center.px-4.pt-6.pb-0
		v-icon(size='40' color='orange') mdi-alert-circle
		span.text-h6.orange--text.font-weight-bold.ml-2 請注意，工時已超出8小時/日，請確認是否報名。
	v-card-text.pa-4
		.text-subtitle-1.secondary--text.mb-4 繼續報名，請選擇加班時數要換休或是換加班費：
		v-form(ref='form' v-model='valid' @submit.native.prevent='')
			v-select(v-model='overTimeType' :items='overTimeOption' :rules='overTimeRules' item-value='dataCode' item-text='dataName' background-color='#F2F2F2' required solo flat hide-details='auto')
	v-card-actions.pb-6
		v-row
			v-col(cols='6')
				v-btn(@click='onCancel' color='primary' outlined rounded width='100%' height='50') 上一步
			v-col(cols='6')
				v-btn(@click='onConfirm' color='primary' depressed rounded width='100%' height='50') 儲存
</template>
<script>
import { mapActions } from 'vuex';

export default {
	props: {
		isOverTime: {
			type: Boolean,
			require: true
		},
		overTimeOption: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			valid: false,
			overTimeType: 'Leave',
			overTimeRules: [(v) => !!v || '此欄位為必填資料'],
		};
	},
	methods: {
		...mapActions(['']),

		onShowOrHidePassword() {
            this.hidePassword = !this.hidePassword;
        },

		onConfirm() {
			this.valid = this.$refs.form.validate();
			if (this.valid) {
				this.$emit('emitConfirm', this.overTimeType);
			}
		},

		onCancel() {
			this.$emit('emitCancel');
		}
	}
}
</script>