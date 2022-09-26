<template lang="pug">
v-card
	v-card-title.justify-center.text-h5.secondary--text.font-weight-bold.px-4.pt-6 {{ title }}
	v-card-text.pa-4
		v-form(ref='form' v-model='valid' @submit.native.prevent='')
			v-text-field.required(label='同仁名稱' name='empName' v-model='emp.empName' :rules='empNameRules' required filled rounded)
			v-text-field.required(label='同仁員編' name='empNumber' v-model='emp.empNumber' :rules='empNumberRules' required filled rounded)
			v-select(label='同仁單位' v-model='emp.deptId' :items='departmentList' :rules='departmentRules' item-value='id' item-text='deptName' required filled rounded :class="{required: this.changeCreate}")
			v-text-field(label='同仁E-MAIL' name='email' v-model='emp.email' :rules='emailRules' type='email' :readonly='!changeCreate' filled rounded :class="{required: this.changeCreate}")
			v-select(label='帳號狀態' v-model='emp.status' :items='options' item-value='dataCode' item-text='dataName' required filled rounded)
	v-card-actions.pb-6
		v-row
			v-col(cols='6')
				v-btn(@click='onCancel' color='primary' outlined rounded width='100%' height='50') 取消
			v-col(cols='6')
				v-btn(@click='onConfirm' color='primary' depressed rounded width='100%' height='50') 確認
</template>
<script>
import _ from 'lodash';
import { mapActions, mapGetters } from 'vuex';
import { messageType } from "@/utils/constant";
import { apiEmployeeUserUpdate, apiEmployeeUserAdd, apiGetDepts } from "@/api/api";

export default {
	props: {
		editObj: {
			type: Object,
			require: true
		},
		changeCreate: {
			type: Boolean,
			require: true
		},
		options: {
			type: Array,
			require: true
		}
	},
	data() {
		return {
			valid: false,
			emp: {},
			empNameRules: [(v) => !!v || '名稱為必填資料'],
			empNumberRules: [(v) => !!v || '員編必填資料'],
			emailRules: [
				v => !!v || 'E-mail為必填資料',
				v => /.+@.+\..+/.test(v) || 'E-mail必需有效',
			],
			departmentRules: [v => !!v || '單位為必選'],
			statusRules: [v => !!v || '啟用狀態為必選']
		};
	},
	computed: {
		...mapGetters(['getDepts']),

		departmentList() {
			return _.filter(this.getDepts, { 'status': "Active" });
		},
		title() {
			return this.changeCreate ? '新增同仁資訊': '編輯同仁資訊';
		},
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapActions(['setMessageBar', 'setDepts']),

		init() {
			if (this.changeCreate) {
				this.emp = {
					empName: '',
					empNumber: '',
					deptId: '',
					email: '',
					status: 'Active',
				}
			} else {
				this.emp = this.editObj;
			}
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
				const data = {
					empName: _.toString(this.emp.empName),
					empNumber: _.toString(this.emp.empNumber),
					deptId: _.toString(this.emp.deptId),
					status: _.toString(this.emp.status)
				}
				if (this.changeCreate) {
					this.doCreate(data);
				} else {
					this.doUpdate(data);
				}
			}
		},
		async doCreate(data) {
			Object.assign(data, { email: _.toString(this.emp.email) });
			const res = await apiEmployeeUserAdd(data);
			if (res.isSuccess == true) {
				this.setMessageBar({
					type: messageType.SUCCESS,
					message: '已成功新增同仁'
				});
				this.$emit('emitConfirm');
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.setMessageBar({
					type: messageType.WARNING,
					message: sysMsg,
				});
			}
		},
		async doUpdate(data) {
			Object.assign(data, { id: _.toString(this.emp.id) });
			const res = await apiEmployeeUserUpdate(data);
			if (res.isSuccess == true) {
				this.setMessageBar({
					type: messageType.SUCCESS,
					message: '已成功修改同仁',
				});
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