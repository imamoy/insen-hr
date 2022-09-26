<template lang="pug">
v-card
	v-card-title.justify-center.text-h5.secondary--text.font-weight-bold.px-4.pt-6 編輯單位
	v-card-text.pa-4
		v-form(ref='form' v-model='valid' @submit.native.prevent='')
			v-text-field.required(label='單位名稱' name='department' v-model='deptName' :rules='[deptNameRules.required, deptNameRules.nonRepeatName]' required filled rounded)
			v-select.required(label='單位狀態' v-model='deptObj.status' :items='options.deptStatus' item-value='dataCode' item-text='dataName' :rules='statusRules' required filled rounded :disabled='statusDisabled')
			v-row(no-gutters)
				v-col.pr-2(cols='6')
					v-select.required(label='選擇主管單位' v-model='deptObj.managerDeptId' :items='departmentList' :rules='departmentRules' item-value='id' item-text='deptName' required filled rounded @change='getManagerList')
				v-col.pl-2(cols='6')
					v-select.required(label='選擇主管' v-model='deptObj.managerName' :items='directorList' :rules='managerNameRules' item-value='item' item-text='empName' required filled rounded :disabled='managerNameDisabled' @change='getManagerId')
			v-select.required(label='單位層級' v-model='deptObj.deptLevel' :items='levelList' item-value='dataCode' item-text='dataName' required filled rounded @change='getPreLevelList')
			v-select(label='上層單位' v-model='deptObj.parentDeptId' :items='preDepts' :rules='preDepIdRules' item-value='id' item-text='deptName' required filled rounded :disabled='parentDepNameDisabled' no-data-text='無' @change='getPreDeptName' :class="{required: !parentDepNameDisabled}")
	v-card-actions.pb-6
		v-row
			v-col(cols='6')
				v-btn(@click='onCancel' color='primary' outlined rounded width='100%' height='50') 取消
			v-col(cols='6')
				v-btn(@click='onConfirm' color='primary' depressed rounded width='100%' height='50') 確認
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import { mapActions, mapGetters } from 'vuex';
import { messageType } from "@/utils/constant";
import { apiSystemDeptAdd,apiSystemDeptUpdate } from "@/api/api";

export default {
	props: {
		editObj: {
			type: Object,
			require: false
		},
		changeCreate: {
			type: Boolean,
			require: true
		},
		options: {
			type: Object,
			require: true
		}
	},
	data() {
		return {
			valid: false,
			deptName: '',
			deptNameRules: {
				required: (v) => !!v || '單位名稱為必填資料',
				nonRepeatName: value => {
					if(this.changeCreate) {
						const nonRepeat = _.isUndefined(_.find(this.departmentList, { 'deptName': value }));
						return nonRepeat || '單位名稱不可以重複';
					} else {
						return true;
					}
				}
			},
			departmentRules: [(v) => !!v || '單位為必選資料'],
			statusRules: [v => !!v || '啟用狀態為必選'],
			managerNameRules: [],
			preDepIdRules: [],
			deptObj: {},
			directorList: [],
			departmentList: [],
			levelList: [],
			preDepts: [],
			parentDeptDisabled: false,
			managerNameDisabled: true,
			parentDepNameDisabled: true,
			statusDisabled: false
		};
	},
	computed: {
		...mapGetters(['getAccount']),

		title() {
			return this.changeCreate ? '新增單位': '編輯單位';
		},
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapActions(['setLoading', 'setMessageBar']),

		async init() {
			this.setLoading(true);
			await this.getOptions();
			await this.getDeptObj();
			this.setLoading(false);
		},

		getDeptObj() {
			if (this.changeCreate === false) {
				this.deptObj = this.editObj;
				this.deptName = this.deptObj.deptName;
				this.getManagerList();
				this.getPreLevelList();
				this.getDeptEmployees();
				this.checkStatusDisabled();
			} else {
				this.deptObj = {
					id: '',
					deptName: '',
					deptLevel: '',
					managerId: '',
					managerDeptId: '',
					parentDeptId: '',
					status: '',
					lstUpdateTime: '',
					lstUpdateUserId: '',
					employees: [],
					deptDisplayLevel: '',
					managerName: '',
					parentDeptName: '',
					deptDisplayStatus: ''
				};
			}
			this.deptObj.lstUpdateUserId = this.getAccount.id;
			this.deptObj.lstUpdateTime = moment().format('YYYY-MM-DD HH:mm:ss');
		},
		getOptions() {
			this.departmentList = this.options.departmentList;
			this.levelList = this.options.deptLevel;
		},

		getDeptEmployees() {
			const depts = _.find(this.departmentList, { 'id': this.deptObj.id });
			if(depts) {
				this.deptObj.employees = depts.employees;
			}
		},

		getManagerList() {
			const managerDepts = _.find(this.departmentList, { 'id': this.deptObj.managerDeptId });
			this.directorList = !_.isEmpty(managerDepts.employees) ? managerDepts.employees : [];
			this.managerNameRules = !_.isEmpty(managerDepts.employees) ? [v => !!v || '單位主管為必選'] : [];
			this.managerNameDisabled = false;
		},

		getManagerId() {
			this.deptObj.managerId = _.find(this.directorList, { 'empName': this.deptObj.managerName }).id;
		},

		getPreDeptName() {
			this.deptObj.parentDeptName = _.find(this.preDepts, { 'id': this.deptObj.parentDeptId }).deptName;
		},

		getPreLevelList() {
			this.parentDepNameDisabled = false;
			const levelListIndex = _.findIndex(this.levelList, { 'dataCode': this.deptObj.deptLevel });
			if (levelListIndex != 0) {
				const preLevel = this.levelList[levelListIndex - 1].dataCode;
				const preLevelDepts = _.filter(this.departmentList, { 'deptLevel': preLevel });
				this.preDepts = preLevelDepts;
				this.preDepIdRules = [v => !!v || '上層單位為必選'];
			} else {
				this.preDepIdRules = [];
				this.parentDepNameDisabled = true;
			}
		},
		checkStatusDisabled() {
			const currentDepts = _.find(this.options.departmentList, { 'id': this.deptObj.id });
			if(currentDepts){
				this.statusDisabled = !_.isEmpty(currentDepts.employees) ? true : false;
			}
		},

		onConfirm() {
			this.valid = this.$refs.form.validate();
			if (this.valid) {
				this.deptObj.deptName = this.deptName;
				if (!this.changeCreate) {
					this.doEdit();
				} else if(this.changeCreate) {
					this.doCreate();
				}
			}
		},

		async doEdit() {
			const res = await apiSystemDeptUpdate(this.deptObj);
			if (res.isSuccess == true) {
				this.setMessageBar({
					type: messageType.SUCCESS,
					message: '已成功修改單位'
				});
				setTimeout(this.$emit('emitConfirm'), 2000);
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.setMessageBar({
					type: messageType.WARNING,
					message: sysMsg
				});
			}
		},

		async doCreate() {
			this.deptObj.deptDisplayStatus = _.find(this.options.deptStatus, { 'dataCode': this.deptObj.status }).dataName;
			this.deptObj.deptDisplayLevel = _.find(this.levelList, { 'dataCode': this.deptObj.deptLevel }).dataName;
			const res = await apiSystemDeptAdd(this.deptObj);
			if (res.isSuccess == true) {
				this.setMessageBar({
					type: messageType.SUCCESS,
					message: '已成功新增單位'
				});
				setTimeout(this.$emit('emitConfirm'), 2000);
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.setMessageBar({
					type: messageType.WARNING,
					message: sysMsg
				});
			}
		},

		onCancel() {
			this.$emit('emitCancel');
		}
	}
}
</script>