<template lang="pug">
v-card
	v-card-title.justify-center.text-h5.secondary--text.font-weight-bold.px-4.pt-6 編輯申請者資訊
	v-card-text.pa-4
		v-form(ref='form' v-model='valid' @submit.native.prevent='')
			v-text-field.required(label='申請者' prepend-inner-icon='mdi-account' name='username' v-model='editForm.empName' :rules='nameRules' required filled rounded)
			v-text-field.required(label='申請者員編' prepend-inner-icon='mdi-account-box' name='numbering' v-model='editForm.empNumber' :rules='numberingRules' required filled rounded)
			v-select(label='申請者單位' prepend-inner-icon='mdi-account-multiple' v-model='editForm.deptId' :items='departmentList' item-value='id' item-text='deptName' :rules='departmentRules' required filled rounded)
			v-text-field.required(label='申請者E-MAIL' prepend-inner-icon='mdi-email' name='email' v-model='editForm.email' :rules='emailRules' type='email' required filled rounded)
	v-card-actions.pb-6
		v-row
			v-col(cols='6')
				v-btn(@click='onCancel' color='primary' outlined rounded width='100%' height='50') 取消
			v-col(cols='6')
				v-btn(@click='onConfirm' color='primary' depressed rounded width='100%' height='50') 確認
</template>
<script>
import _ from 'lodash';
import { mapGetters, mapActions } from 'vuex';
import { messageType } from "@/utils/constant";
import { apiEmployeeApproveUpdate, apiGetDepts } from "@/api/api";

export default {
	props: {
		editObj: {
			type: Object,
			require: true
		}
	},
	data() {
		return {
			valid: false,
			nameRules: [(v) => !!v || '申請人為必填資料'],
			numberingRules: [(v) => !!v || '員編必填資料'],
			emailRules: [
				v => !!v || 'E-mail為必填資料',
				v => /.+@.+\..+/.test(v) || 'E-mail必需有效',
			],
			departmentRules: [v => !!v || '申請人單位為必選'],
			editForm: {
				empName: '',
				empNumber: '',
				deptId: '',
				email: ''
			}
		};
	},
	created() {
		this.editForm = {
			id: this.editObj.id,
			empName: this.editObj.empName,
			empNumber: this.editObj.empNumber,
			deptId: this.editObj.deptId,
			email: this.editObj.email
		}
	},
	computed: {
		...mapGetters(['getDepts']),

		departmentList() {
			return _.filter(this.getDepts, { 'status': "Active" });
		},
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapActions(['setMessageBar', 'setDepts']),

		init() {
			this.getDepartmentList();
		},

		async getDepartmentList() {
			const res = await apiGetDepts();
			if (res.isSuccess == true) {
				this.setDepts(res.data);
			}
		},

		onConfirm() {
			this.valid = this.$refs.form.validate();
			if (this.valid) {
				this.doUpdate();
			}
		},

		async doUpdate() {
			const data = {
				id: _.toString(this.editForm.id),
				empName: _.toString(this.editForm.empName),
				empNumber:  _.toString(this.editForm.empNumber),
				email:  _.toString(this.editForm.email),
				deptId:  _.toString(this.editForm.deptId),
			}
			const res = await apiEmployeeApproveUpdate(data);
			if (res.isSuccess == true) {
				this.departmentList = res.data;
				this.$emit('emitConfirm');
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