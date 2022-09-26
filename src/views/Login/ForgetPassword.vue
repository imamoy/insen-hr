<template lang="pug">
v-card
	v-card-title.justify-center.text-h5.secondary--text.font-weight-bold.px-4.pt-6 忘記密碼
	v-card-text.pa-4
		v-form(ref='form' v-model='valid' @submit.native.prevent='')
			v-text-field.required(label='Email' ref='email' prepend-inner-icon='mdi-email' name='email' type='email' v-model='email' :rules='emailRules' placeholder='請輸入註冊時所使用的E-mail' required filled rounded @input='apiMessageShow = false')
	v-card-actions.flex-column.pb-6
		v-row.full-width(no-gutters)
			v-col.pr-2(cols='6')
				v-btn(@click='onCancel' color='primary' outlined rounded width='100%' height='50') 關閉視窗
			v-col.pl-2(cols='6')
				v-btn(@click='onForgetPassword' color='primary' depressed rounded width='100%' height='50' :disabled='sendBtnDisabled')
					span(v-if='!sendBtnDisabled') 發送驗證信
					span(v-else) {{ time }} 秒後可再次發送
		v-alert.full-width.mt-4.mb-0(v-model='apiMessageShow' :type='apiMessage.type' dense width='100%') {{ apiMessage.message }}
</template>
<script>
import { messageType } from "@/utils/constant";
import { apiForgetPassword } from "@/api/api";

export default {
	name: 'forget-password',
	data() {
		return {
			valid: false,
			email: '',
			emailRules: [
				v => !!v || 'E-mail為必填資料',
				v => /.+@.+\..+/.test(v) || 'E-mail必需有效',
			],
			sendBtnDisabled: false,
			time: 60,
			apiMessageShow: false,
			apiMessage: {}
		};
	},
	methods: {
		onForgetPassword() {
			this.valid = this.$refs.form.validate();
			if (this.valid) {
				this.doForgetPassword();
			}
		},

		async doForgetPassword() {
			const res = await apiForgetPassword(this.email);
			if (res.isSuccess == true) {
				this.onSetTimeOut();
				this.apiMessageShow = true;
				this.apiMessage = {
					type: messageType.SUCCESS,
					message: '已發送驗證信，請至信箱收信'
				};
			} else {
				this.apiMessageShow = true;
				this.apiMessage = {
					type: messageType.WARNING,
					message: res.sysMsg
				};
			}
		},
		onSetTimeOut() {
			this.sendBtnDisabled = true;
			let timer = setInterval(() => {
				this.time--;
			}, 1000);
			setTimeout(() => {
				this.sendBtnDisabled = false;
				this.time = 60;
				clearInterval(timer);
			}, 61000);
		},
		onCancel() {
			this.$emit('emitCancel');
		}
	}
}
</script>