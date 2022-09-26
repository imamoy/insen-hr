<template lang="pug">
v-layout.login(align-center justify-center)
	v-card.mb-10.pb-5(max-width='500' color='transparent' flat)
		v-row
			v-col
				v-img.logo.mx-auto(src='../assets/images/logo.png' max-width='200')
				.secondary--text.text-h4.font-weight-bold.text-center 排班系統帳號申請
				p.text-center.my-3 請填寫以下資訊並送出申請
			v-col(cols='12')
				v-form(ref='form' v-model='valid' @submit.native.prevent='')
					v-text-field.required(label='申請人' ref='name' prepend-inner-icon='mdi-account' name='empName' type='text' v-model='empName' :rules='empNameRules' background-color='white' filled rounded required)
					v-text-field.required(label='員編' ref='numbering' prepend-inner-icon='mdi-account-box' name='empNumber' type='text' v-model='empNumber' :rules='empNumberRules' required background-color='white' filled rounded hide-controls)
					v-text-field.required(label='Email' ref='email' prepend-inner-icon='mdi-email' name='email' type='email' v-model='email' :rules='emailRules' required background-color='white' filled rounded)
					v-text-field.required(label='設置密碼' ref='password' prepend-inner-icon='mdi-lock' name='password' :type='passwordInputType' v-model='password' :rules='passwordRules' @click:append='onShowOrHidePassword' :append-icon='passwordAppendIcon' autocomplete='new-password' required background-color='white' filled rounded)
					v-text-field.required(label='密碼確認' ref='confirmPassword' prepend-inner-icon='mdi-lock-check' name='confirmPassword' :type='comfirmPasswordInputType' v-model='confirmPassword' :rules='[confirmPasswordRules.required, confirmPasswordRules.sameCheck(password, confirmPassword)]' @click:append='onShowOrHideComfirmPassword' :append-icon='comfirmPasswordAppendIcon' required background-color='white' filled rounded hide-controls)
					v-select.required(v-model='deptId' :items='deptList' :rules='deptRules' item-value='id' item-text='deptName' label='申請人單位' prepend-inner-icon='mdi-account-multiple' required background-color='white' filled rounded)
		v-row
			v-col(cols='6')
				v-btn(@click='goToLogin' color='primary' outlined rounded width='100%' height='50') 放棄申請
			v-col(cols='6')
				v-btn(@click='onSignUp' color='primary' depressed rounded width='100%' height='50') 送出申請
		v-alert.mt-4(v-model='apiMessageShow' :type='apiMessage.type' dense) {{ apiMessage.message }}
</template>
<script>
import _ from 'lodash';
import { mapActions, mapGetters } from 'vuex';
import { messageType } from "@/utils/constant";
import { apiSignup, apiGetDepts } from "@/api/api";

export default {
	data() {
		return {
			valid: false,
			empName: '',
			empNameRules: [(v) => !!v || '申請人為必填資料'],
			empNumber: '',
			empNumberRules: [(v) => !!v || '員編為必填資料'],
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
			email: '',
			emailRules: [
				v => !!v || 'E-mail為必填資料',
				v => /.+@.+\..+/.test(v) || 'E-mail必需有效',
			],
			deptId:'',
			deptRules: [v => !!v || '申請人單位為必選'],
			apiMessageShow: false,
			apiMessage: {}
		};
	},
	computed: {
		...mapGetters(['getDepts']),

		deptList() {
			return !_.isEmpty(this.getDepts) ? this.getDepts : [];
		},

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
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapActions(['setDepts']),

		init() {
			this.getDepartmentList();
		},

		async getDepartmentList() {
			const res = await apiGetDepts();
			if (res.isSuccess == true) {
				this.setDepts(res.data);
			}
		},

		onShowOrHidePassword() {
            this.hidePassword = !this.hidePassword;
        },

		onShowOrHideComfirmPassword() {
			this.hideComfirmPassword = !this.hideComfirmPassword;
		},

		onSignUp() {
			this.valid = this.$refs.form.validate();
			if (this.valid) {
				this.doSignUp();
			}
		},

		async doSignUp() {
			const data = {
				empName: _.toString(this.empName),
				empNumber: _.toString(this.empNumber),
				pwd: _.toString(this.password),
				email: _.toString(this.email),
				deptId: _.toString(this.deptId)
			};
			const res = await apiSignup(data);
			if (res.isSuccess == true) {
				this.apiMessageShow = true;
				this.apiMessage = {
					message: '帳號申請已送出，請等待人資進行審核，謝謝！',
					type: messageType.SUCCESS,
				};
				this.goToLogin();
				// 先註解，等三秒才看的到提示文字
				// setTimeout(() => {
				// 	this.goToLogin();
				// }, 3000);
			} else {
				this.apiMessageShow = true;
				this.apiMessage = {
					type: messageType.WARNING,
					message: res.sysMsg
				};
			}
		},

		goToLogin() {
			this.$router.push({ path: '/' });
		}
	}
}
</script>
<style lang="scss">
@import '../style/Page/Login.scss'; // 共用的css
</style>