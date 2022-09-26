<template lang="pug">
.page
	v-card.page-header(color='lightPrimary' tile flat dark)
		v-container.pb-2(fluid)
			.d-flex.align-center
				h2.text-h4.font-weight-bold 組織管理
			v-form.mt-4(ref='form' v-model='valid')
				v-row.justify-space-between
					v-col(cols='12' md='6')
						v-row.filter-bar(no-gutters)
							v-col(cols)
								v-select(label='單位名稱：' v-model='filter.deptId' :items='departmentList' item-value='id' item-text='deptName' hide-details="auto" background-color='white' filled light)
							v-col(cols)
								v-select(label='單位狀態：' v-model='filter.status' :items='deptStatus' item-value='dataCode' item-text='dataName' hide-details="auto" background-color='white' filled light)

					v-col(cols='12' md='6')
						v-row(no-gutters class='justify-space-between align-center')
							div(class='d-flex mb-2')
								v-btn.mr-2(@click='getData' color='secondary' depressed min-width='120' height='56' light) 查詢
								v-btn.ml-2(@click='onClean' color='white' outlined min-width='120' height='56' light) 清除查詢
							div(class='mb-2')
								v-btn(@click='onCreate' color='green' depressed rounded width='100%' height='50' dark) 新增單位
	v-container(fluid)
		v-card.page-card(color='white' height='100%' flat)
			v-data-table(:headers='headers' :items='depts' hide-default-footer :items-per-page="-1")
				template(v-slot:item.level='{ item }')
					span 第{{ item.level }}級
				template(v-slot:item.status='{ item }')
					v-chip(:color='getStatusColor(item.status)' outlined) {{ item.deptDisplayStatus }}
				template(v-slot:item.action='{ item }')
					v-btn(@click='onEdit(item)' color='primary' dense width='80' height='35' light) 編輯
	v-dialog(v-model='isEdit' overlay-opacity='0.6' max-width='500' persistent no-click-animation)
		edit(v-if='isEdit' @emitConfirm='onCreatedAndEdited' @emitCancel='isEdit = false' :edit-obj='editObj' :change-create='changeCreate' :options='options')
</template>
<script>
import _ from 'lodash';
import { messageType } from "@/utils/constant";
import { mapActions } from 'vuex';
import { apiSystemDept, apiSystemDeptPageOptions } from "@/api/api";
import Edit from './Edit.vue';

export default {
	components: {
		Edit
	},
	data() {
		return {
			valid: false,
			filter: {
				deptId: '',
				status: 'Active',
			},
			itemsPerPage: 30,
			deptLevel: [],
			deptStatus: [],
			deptAndEmployees: [],
			departmentList: [],
			headers: [
				{ text: '單位狀態', value: 'status', align: 'center' },
				{ text: '單位名稱', value: 'deptName', align: 'center' },
				{ text: '單位主管', value: 'managerName', align: 'center' },
				{ text: '單位層級', value: 'deptDisplayLevel', align: 'center' },
				{ text: '上一層單位', value: 'parentDeptName', align: 'center' },
				{ text: '操作', value: 'action', align: 'center' },
			],
			depts: [],
			originDepts: [],
			isEdit: false,
			editObj: {},
			options: {},
			changeCreate: false
		};
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapActions(['setLoading']),

		async init() {
			await this.getDeptPageOptions();
			await this.getData();
		},

		async getData() {
			const res = await apiSystemDept();
			if (res.isSuccess === true) {
				this.originDepts = res.data;
				this.handleData();
			}
		},

		handleData() {
			this.setLoading(true);
			if (!_.isEmpty(this.filter.deptId) && !_.isEmpty(this.filter.status)) {
				this.depts = _.filter(this.originDepts, { 'id': this.filter.deptId, 'status': this.filter.status });
			} else if (_.isEmpty(this.filter.deptId) && !_.isEmpty(this.filter.status)) {
				this.depts = _.filter(this.originDepts, { 'status': this.filter.status });
			} else {
				this.depts = this.originDepts;
			}
			this.setLoading(false);
		},

		async getDeptPageOptions() {
			const res = await apiSystemDeptPageOptions();
			if (res.isSuccess === true) {
				this.deptLevel = res.data.deptLevel;
				this.deptStatus = [
					{ dataCode: '', dataName: '全部' },
					...res.data.deptStatus
				]
				this.deptAndEmployees = res.data.deptAndEmployees;
				this.departmentList = _.filter(this.deptAndEmployees, { 'status': "Active" });
				this.options = {
					deptLevel: res.data.deptLevel,
					deptStatus: res.data.deptStatus,
					departmentList: this.deptAndEmployees
				}
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.setMessageBar({
					message: sysMsg,
					type: messageType.WARNING,
				});
			}
		},

		getStatusColor(val) {
			let color = '';
			switch (val) {
				case 'Active':
					color = 'green'
					break;
				case 'InActive':
					color = 'grey lighten-1'
					break;
			}
			return color;
		},
		onCreate() {
			this.editObj = {};
			this.changeCreate = true;
			this.isEdit = true;
		},
		onEdit(item) {
			this.editObj = item;
			this.changeCreate = false;
			this.isEdit = true;
		},
		onCreatedAndEdited() {
			this.editObj = {};
			this.isEdit = false;
			this.changeCreate = false;
			this.getDeptPageOptions();
			this.getData();
		},
		onEditCancel() {
			this.editObj = {};
			this.isEdit = false;
			this.changeCreate = false;
		},
		onClean() {
			this.filter = {
				deptId: '',
				status: 'Active',
			};
		},
	}
}
</script>