<template lang="pug">
v-card
	v-card-title.justify-center.text-h5.secondary--text.font-weight-bold.px-4.pt-6 修改密碼
	v-card-text.pa-4
		v-form(ref='form' v-model='valid' @submit.native.prevent='')
			v-text-field.required(label='舊密碼' prepend-inner-icon='mdi-lock' name='password' :type='oldPasswordInputType' v-model='oldPassword' :rules='passwordRules' @click:append='onShowOrHideOldPassword' :append-icon='oldPasswordAppendIcon' required filled rounded @input='apiMessageShow = false')
			v-text-field.required(label='新密碼' prepend-inner-icon='mdi-lock' name='password' :type='newPasswordInputType' v-model='newPassword' :rules='passwordRules' @click:append='onShowOrHideNewPassword' :append-icon='newPasswordAppendIcon' required filled rounded @input='apiMessageShow = false')
			v-text-field.required(label='密碼確認' prepend-inner-icon='mdi-lock-check' name='confirmPassword' :type='comfirmPasswordInputType' v-model='confirmPassword' :rules='[confirmPasswordRules.required, confirmPasswordRules.sameCheck(newPassword, confirmPassword)]' @click:append='onShowOrHideComfirmPassword' :append-icon='comfirmPasswordAppendIcon' required filled rounded hide-controls @input='apiMessageShow = false')
	v-card-actions.flex-column
		v-row
			v-col(cols='6')
				v-btn(@click='onCancel' color='primary' outlined rounded width='100%' height='50') 取消
			v-col(cols='6')
				v-btn(@click='onResetPassword' color='primary' depressed rounded width='100%' height='50') 確認
		v-alert.mt-4(v-model='apiMessageShow' :type='apiMessage.type' timeout='5000' dense width='100%') {{ apiMessage.message }}
</template>
<script>
import _ from 'lodash';
import { mapActions } from 'vuex';
import { messageType } from "@/utils/constant";
import { apiEmployeeEditPassword } from "@/api/api";

export default {
	props: {
		memberId: {
			type: String,
			require: true
		}
	},
	data() {
		return {
			valid: false,
			hideOldPassword: true,
			hideNewPassword: true,
			hideComfirmPassword: true,
			oldPassword: '',
			newPassword: '',
			confirmPassword: '',
			confirmPasswordRules: {
				required: (v) => !!v || '密碼確認為必填資料',
                sameCheck(password, confirmPassword) {
                    return password == confirmPassword || '密碼與密碼確認不一致';
                },
			},
			passwordRules: [(v) => !!v || '密碼為必填資料'],
			apiMessageShow: false,
			apiMessage: {}
		};
	},
	computed: {
		oldPasswordAppendIcon() {
				return this.hideOldPassword ? 'mdi-eye' : 'mdi-eye-off';
		},
		oldPasswordInputType() {
				return this.hideOldPassword ? 'password' : 'text';
		},
		newPasswordAppendIcon() {
				return this.hideNewPassword ? 'mdi-eye' : 'mdi-eye-off';
		},
		newPasswordInputType() {
				return this.hideNewPassword ? 'password' : 'text';
		},
		comfirmPasswordAppendIcon() {
			return this.hideComfirmPassword ? 'mdi-eye' : 'mdi-eye-off';
		},
		comfirmPasswordInputType() {
			return this.hideComfirmPassword ? 'password' : 'text';
		},
	},
	methods: {
		...mapActions(['setAccount']),

		onShowOrHideOldPassword() {
			this.hideOldPassword = !this.hideOldPassword;
		},

		onShowOrHideNewPassword() {
			this.hideNewPassword = !this.hideNewPassword;
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
				id: _.toString(this.memberId),
				oldPwd: _.toString(this.oldPassword),
				newPwd: _.toString(this.newPassword),
			};
			const res = await apiEmployeeEditPassword(data);
			if (res.isSuccess == true) {
				this.apiMessageShow = true;
				this.apiMessage = {
					type: messageType.SUCCESS,
					message: '密碼重置完成後，請重新使用新密碼登入'
				};
				setTimeout(this.resetFinishLogout(), 2000);
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
		resetFinishLogout() {
			if (this.$route.path != '/') {
				this.$router.push({ path: '/' });
			}
			localStorage.setItem('jwtToken', '');
			this.setAccount({});
		},
		onCancel() {
			this.$emit('emitCancel');
		}
	}
}
</script>