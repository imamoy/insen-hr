<template lang="pug">
v-card
	v-card-title.justify-center.text-h5.secondary--text.font-weight-bold.px-4.pt-6 班表退回原因
	v-card-text.pa-4
		v-form(ref='form' v-model='valid' @submit.native.prevent='')
			v-radio-group(v-model='returnMain')
				v-radio(label='同仁異動需求' value='同仁異動需求')
				v-radio(label='其他：' value='其他')
			v-textarea(v-model='content' filled hide-details='auto' :class="{required: returnMain==='其他'}" :rules="contentRules")
	v-card-actions.pb-6
		v-row
			v-col(cols='6')
				v-btn(@click='onCancel' color='primary' outlined rounded width='100%' height='50') 取消
			v-col(cols='6')
				v-btn(@click='onConfirm' color='primary' depressed rounded width='100%' height='50') 送出
</template>
<script>
import _ from 'lodash';
import { mapActions } from 'vuex';
import { messageType } from "@/utils/constant";
import { apiCalendarReject } from "@/api/api";

export default {
	props: {
		employeeCalendarId: {
			type: String,
			required: true
		}
	},
	data() {
		return {
			valid: false,
			returnMain: '同仁異動需求',
			content: '',
		};
	},
	computed: {
		contentRules() {
			return this.returnMain === '其他' ? [(v) => !!v || '內容原因為必填資料'] : [];
		}
	},
	methods: {
		...mapActions(['setMessageBar', 'setLoading']),

		onConfirm() {
			this.valid = this.$refs.form.validate();
			if (this.valid) {
				this.doConfirm();
			}
		},
		async doConfirm() {
			let rejectReason = '';
			if(this.returnMain === '同仁異動需求') {
				rejectReason = '同仁異動需求'
			} else {
				rejectReason = this.content;
			}

			const data = {
				employeeCalendarId: this.employeeCalendarId,
				rejectReason,
			}

			const res = await apiCalendarReject(data);
			if (res.isSuccess === true) {
				this.setMessageBar({
					type: messageType.SUCCESS,
					message: '已成功退回此班表'
				});
				setTimeout(this.$emit('emitConfirm'), 2000);
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.setMessageBar({
					message: sysMsg,
					type: messageType.WARNING,
				});
			}
		},
		onCancel() {
			this.$emit('emitCancel');
		}
	}
}
</script>