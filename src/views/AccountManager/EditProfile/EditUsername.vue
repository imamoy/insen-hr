<template lang="pug">
v-card
	v-card-title.justify-center.text-h5.secondary--text.font-weight-bold.px-4.pt-6 修改使用者名稱
	v-card-text.pa-4
		v-form(ref='form' v-model='valid' @submit.native.prevent='')
			v-text-field.required(label='使用者' prepend-inner-icon='mdi-account' name='username' v-model='empName' :rules='empNameRules' required filled rounded @input='apiMessageShow = false')
	v-card-actions.flex-column
		v-row
			v-col(cols='6')
				v-btn(@click='onCancel' color='primary' outlined rounded width='100%' height='50') 取消
			v-col(cols='6')
				v-btn(@click='onConfirm' color='primary' depressed rounded width='100%' height='50') 確認
		v-alert.mt-4(v-model='apiMessageShow' :type='apiMessage.type' timeout='5000' dense width='100%') {{ apiMessage.message }}
</template>
<script>
import _ from 'lodash';
import { messageType } from "@/utils/constant";
import { apiEmployeeEditName } from "@/api/api";

export default {
	props: {
		member: {
			type: Object,
			require: true
		}
	},
	data() {
		return {
			valid: false,
			empName: '',
			empNameRules: [(v) => !!v || '使用者為必填資料'],
			apiMessageShow: false,
			apiMessage: {}
		};
	},
	mounted() {
		this.empName = this.member.empName;
	},
	methods: {
		onConfirm() {
			this.valid = this.$refs.form.validate();
			if (this.valid) {
				this.doEdit();
			}
		},
		async doEdit() {
			const data = {
				id: _.toString(this.member.id),
				empName: _.toString(this.empName),
			};
			const res = await apiEmployeeEditName(data);
			if (res.isSuccess == true) {
				this.apiMessageShow = true;
				this.apiMessage = {
					type: messageType.SUCCESS,
					message: '使用者名稱已修改'
				};
				setTimeout(this.$emit('emitConfirm'), 2000);
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.apiMessageShow = true;
				this.apiMessage = {
					type: messageType.WARNING,
					message: sysMsg
				};
			}
		},
		onCancel() {
			this.$emit('emitCancel');
		}
	}
}
</script>