<template lang="pug">
.login.fill-height
	v-layout(align-center justify-center fill-height)
		v-card.mb-10.pb-5(max-width='380' color='transparent' flat)
			v-row
				v-col
					v-img.logo.mx-auto(src='../../assets/images/logo.png' max-width='200')
					.secondary--text.text-h4.font-weight-bold.text-center 歡迎回到排班系統
					p.text-center.my-3 請填寫以下資訊進行登入
				v-col(cols='12')
					v-form(ref='form' v-model='valid' @submit.native.prevent='')
						v-text-field.required(label='帳號' ref='account' prepend-inner-icon='mdi-account' name='login' type='text' v-model='account' :rules='accountRules' required background-color='white' filled rounded @input='apiMessageShow = false')
						v-text-field.required(label='密碼' ref='password' prepend-inner-icon='mdi-lock' name='password' :type='passwordInputType' v-model='password' :rules='passwordRules' @click:append='onShowOrHidePassword' :append-icon='passwordAppendIcon' required background-color='white' filled rounded @input='apiMessageShow = false')
						v-row(no-gutters)
							v-col(cols='7')
								v-text-field.required(label='驗證碼' ref='captchaText' name='code' type='number' v-model='captchaText' :rules='captchaTextRules' hide-details='auto' required background-color='white' filled rounded @input='apiMessageShow = false')
							v-col.pl-4(cols='5')
								v-img(v-if='showCaptchaImage' :src="'data:image/jpeg;base64' + captchaImage" max-height='56' @click='getCaptcha')
			.text-center.mt-2.mb-5
				v-btn(text color='gray' @click='onForgetPassword' :ripple='false') 忘記密碼？
			v-row
				v-col(cols='6')
					v-btn(@click='goToSignUp' color='primary' outlined rounded width='100%' height='50') 建立帳號
				v-col(cols='6')
					v-btn(@click='onLogin' color='primary' depressed rounded width='100%' height='50') 登入
			v-alert.mt-4(v-model='apiMessageShow' :type='apiMessage.type' timeout='5000' dense) {{ apiMessage.message }}
	v-dialog(v-model='isForgetPassword' overlay-opacity='0.6' max-width='500' persistent no-click-animation)
		forget-password(v-if='isForgetPassword' @emitCancel='isForgetPassword = false')
</template>
<script>
import _ from 'lodash';
import { mapActions } from 'vuex';
import { messageType } from "@/utils/constant";
import ForgetPassword from './ForgetPassword.vue';
import { apiLoginCaptcha, apiLogin, apiEmployeeProfile } from "@/api/api";

export default {
	name: 'login',
	components: {
		ForgetPassword,
	},
	data() {
		return {
			valid: false,
			hidePassword: true,
			account: '',
			password: '',
			captchaText: '',
			accountRules: [(v) => !!v || '帳號為必填資料'],
			passwordRules: [(v) => !!v || '密碼為必填資料'],
			captchaTextRules: [(v) => !!v || '驗證碼為必填資料'],
			isForgetPassword: false,
			captchaId: ',',
			captchaImage: '',
			apiMessageShow: false,
			apiMessage: {},
			accountObj: {}
		};
	},
	computed: {
		passwordAppendIcon() {
			return this.hidePassword ? 'mdi-eye' : 'mdi-eye-off';
		},
		passwordInputType() {
			return this.hidePassword ? 'password' : 'text';
		},
		showCaptchaImage() {
			return this.captchaImage ? true : false;
		}
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapActions(['setMessageBar', 'setAccount']),

		init() {
			this.getCaptcha();
		},
		async getCaptcha() {
			const res = await apiLoginCaptcha(this.captchaId);
			if (res.isSuccess === true) {
				this.captchaId = res.data.captchaId;
				this.captchaImage = res.data.captchaImageBase64;
			} else {
				this.setMessageBar({
					message: res.data.sysMsg,
					type: messageType.ERROR,
				})
			}
		},
		onShowOrHidePassword() {
			this.hidePassword = !this.hidePassword;
		},
		onLogin() {
			this.valid = this.$refs.form.validate();
			if (this.valid) {
				this.doLogin();
			}
		},
		async doLogin() {
			const data = {
				account: _.toString(this.account),
				pwd: _.toString(this.password),
				captchaId: _.toString(this.captchaId),
				captchaText: _.toString(this.captchaText)
			};
			const res = await apiLogin(data).catch(error => {
				if(error.response.status >= 400) {
					this.getCaptcha();
				}
			});
			if (res.isSuccess == true) {
				localStorage.setItem('jwtToken', res.data.jwtToken);
				this.accountObj = res.data;
				this.getProfile();
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.apiMessageShow = true;
				this.apiMessage = {
					type: messageType.WARNING,
					message: sysMsg
				};
				this.getCaptcha();
			}
		},
		async getProfile() {
			const res = await apiEmployeeProfile();
			if (res.isSuccess === true) {
				Object.assign(this.accountObj, { id: res.data.id });
				this.setAccount(this.accountObj);
				this.$router.push({ path: "/schedule" });
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.setMessageBar({
					message: sysMsg,
					type: messageType.WARNING,
				});
			}
		},
		goToSignUp() {
			this.$router.push({ path: '/signup' });
		},
		onForgetPassword() {
			this.isForgetPassword = true;
		},
	},
}
</script>
<style lang="scss">
@import '../../style/Page/Login.scss'; // 共用的css
</style>