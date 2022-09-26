<template lang="pug">
.login.fill-height
	v-layout(align-center justify-center fill-height)
		v-card.mb-10.pb-5(v-if='validateTokenSuccess' max-width='380' min-height='400' color='transparent' flat)
			v-row
				v-col
					v-img.logo.mx-auto(src='../../assets/images/logo.png' max-width='200')
					.secondary--text.text-h4.font-weight-bold.text-center 歡迎回到排班系統
					p.text-center.my-3 請填寫以下資訊進行重置密碼
				v-col(cols='12')
					v-card-text.pa-4
						v-form(ref='form' v-model='valid' @submit.native.prevent='')
							v-text-field.required(label='設置密碼' ref='password' prepend-inner-icon='mdi-lock' name='password' :type='passwordInputType' v-model='password' :rules='passwordRules' @click:append='onShowOrHidePassword' :append-icon='passwordAppendIcon' background-color='white' required filled rounded)
							v-text-field.required(label='密碼確認' ref='confirmPassword' prepend-inner-icon='mdi-lock-check' name='confirmPassword' :type='comfirmPasswordInputType' v-model='confirmPassword' :rules='[confirmPasswordRules.required, confirmPasswordRules.sameCheck(password, confirmPassword)]' @click:append='onShowOrHideComfirmPassword' :append-icon='comfirmPasswordAppendIcon' required background-color='white' filled rounded hide-controls)
			v-row(v-show='validateTokenSuccess')
				v-col(cols='6')
					v-btn(@click='goToLogin' color='primary' outlined rounded width='100%' height='50') 取消
				v-col(cols='6')
					v-btn(@click='onResetPassword' color='primary' depressed rounded width='100%' height='50') 確認
			v-alert.mt-4(v-model='apiMessageShow' :type='apiMessage.type' dense) {{ apiMessage.message }}
		v-dialog(v-model='validateTokenFalse' overlay-opacity='0.6' max-width='500' persistent no-click-animation)
			v-card
				v-card-title.justify-center.text-h5.secondary--text.font-weight-bold.px-4.pt-6 此連結已失效
				v-card-text.text-center.pa-4 請重新點選忘記密碼發送驗證信
				v-card-actions.justify-center.pb-6
					v-btn(@click='goToLogin' color='primary' rounded width='120' height='50') 確認
</template>
<script>
import _ from 'lodash';
import { messageType } from "@/utils/constant";
import { apiResetPasswordValidateToken, apiResetPassword } from "@/api/api";

export default {
	name: 'forget-password',
	data() {
		return {
			valid: false,
			hidePassword: true,
			hideComfirmPassword: true,
			password: '',
			confirmPassword: '',
			passwordRules: [(v) => !!v || '密碼為必填資料'],
			confirmPasswordRules: {
				required: (v) => !!v || '密碼確認為必填資料',
				sameCheck(password, confirmPassword) {
					return password == confirmPassword || '密碼與密碼確認不一致';
				},
			},
			apiMessageShow: false,
			apiMessage: {},
			validateTokenSuccess: false,
			validateTokenFalse: false
		};
	},
	computed: {
		passwordAppendIcon() {
			return this.hidePassword ? 'mdi-eye' : 'mdi-eye-off';
		},
		passwordInputType() {
			return this.hidePassword ? 'password' : 'text';
		},
		comfirmPasswordAppendIcon() {
			return this.hideComfirmPassword ? 'mdi-eye' : 'mdi-eye-off';
		},
		comfirmPasswordInputType() {
			return this.hideComfirmPassword ? 'password' : 'text';
		},
		jwtToken() {
			return this.$route.params.token;
		}
	},
	mounted() {
		this.init();
	},
	methods: {
		init() {
			if (this.jwtToken) {
				localStorage.setItem('jwtToken', this.jwtToken);
				this.checkValidateToken();
			} else {
				localStorage.setItem('jwtToken', '');
			}
		},

		async checkValidateToken() {
			const res = await apiResetPasswordValidateToken();
			if (res.isSuccess === true) {
				this.validateTokenSuccess = true;
			} else if (res.isSuccess === false) {
				this.validateTokenFalse = true;
			}
		},

		onShowOrHidePassword() {
			this.hidePassword = !this.hidePassword;
		},

		onShowOrHideComfirmPassword() {
			this.hideComfirmPassword = !this.hideComfirmPassword;
		},

		onResetPassword() {
			this.valid = this.$refs.form.validate();
			if (this.valid) {
				this.doResetPassword();
			}
		},

		async doResetPassword() {
			const data = {
				newPwd: _.toString(this.password),
			}
			const res = await apiResetPassword(data);
			if (res.isSuccess == true) {
				this.apiMessageShow = true;
				this.apiMessage = {
					type: messageType.SUCCESS,
					message: '密碼已重置，請使用新密碼登入。'
				};
				setTimeout(() => {
					this.goToLogin();
				}, 3000);
			} else {
				this.apiMessageShow = true;
				this.apiMessage = {
					type: messageType.WARNING,
					message: res.sysMsg
				};
			}
		},

		onCancel() {
			this.$emit('emitCancel');
		},

		goToLogin() {
			this.$router.push({ path: '/' });
		}
	}
}
</script>
<style lang="scss">
@import '../../style/Page/Login.scss'; // 共用的css
</style>