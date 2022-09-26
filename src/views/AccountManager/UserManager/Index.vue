<template lang="pug">
.page
	v-card.page-header(color='lightPrimary' tile flat dark)
		v-container.pb-2(fluid)
			.d-flex.align-center
				h2.text-h4.font-weight-bold 使用者管理
			v-form.mt-4(ref='form' v-model='valid')
				v-row.justify-space-between.flex-column.flex-lg-row
					v-col
						v-row.filter-bar(no-gutters)
							v-col(cols)
								v-text-field(label='同仁姓名' name='empName' background-color='white' v-model='filter.empName' hide-details="auto" filled light)
							v-col(cols)
								v-text-field(label='同仁E-mail' name='email' background-color='white' v-model='filter.email' hide-details="auto" filled light)
							v-col(cols)
								v-select(label='同仁單位' v-model='filter.deptId' :items='departmentList' item-value='id' item-text='deptName' background-color='white' hide-details="auto" filled light)
							v-col(cols)
								v-select(label='帳號狀態' v-model='filter.status' :items='statusList' item-value='dataCode' item-text='dataName' background-color='white' hide-details="auto" filled light)

					v-col.flex-grow-0
						div.d-flex.justify-space-between.align-center(no-gutters)
							div.d-flex.mb-2.mr-2
								v-btn.mr-2(@click='getData' color='secondary' depressed min-width='120' height='56' light) 查詢
								v-btn(@click='onClean' color='white' outlined min-width='120' height='56' light) 清除查詢
							div.d-flex.mb-2
								v-btn.mr-2(@click='onBatchChange' color='orange darken-4' depressed rounded min-width='120' height='56' dark) 批次編輯單位
								v-btn(@click='onCreate' color='green' depressed rounded min-width='120' height='56' dark) 新增同仁

	v-container.pt-4(fluid)
		v-card.page-card.d-flex.flex-column.justify-space-between(color='white' height='100%' flat)
			v-data-table.has-pagination-table(v-model='batchLists' height='100%' :headers='headers' :items='desserts' :items-per-page='itemsPerPage' hide-default-footer show-select item-key='id')
				template(v-slot:item.status='{ item }')
					v-chip(:color='getStatusColor(item.status)' outlined) {{ item.statusName }}
				template(v-slot:item.action='{ item }')
					v-btn(@click='onEdit(item)' color='primary' dense width='80' height='35' light) 編輯
			v-pagination.mb-5(v-model='page' :length='pageCount' :total-visible='totalPage' circle color='primary')
	v-dialog(v-model='isEditApply' overlay-opacity='0.6' max-width='500' persistent no-click-animation)
		edit(v-if='isEditApply' @emitConfirm='onCreatedAndEdited' @emitCancel='onEditCancel' :edit-obj='editObj' :change-create='changeCreate' :options='options')
	v-dialog(v-model='isBatchDepartment' overlay-opacity='0.6' max-width='500' persistent no-click-animation)
		batch-department(v-if='isBatchDepartment' @emitConfirm='onBatchDeptConfirm' @emitCancel='isBatchDepartment = false' :lists='batchLists')
</template>
<script>
import _ from 'lodash';
import { messageType } from "@/utils/constant";
import { mapActions, mapGetters } from 'vuex';
import { apiEmployeeUserList, apiGetDepts, apiGetEmployeeListConfig } from "@/api/api";
import Edit from './Edit.vue';
import BatchDepartment from './BatchDepartment.vue';

export default {
	components: {
		Edit,
		BatchDepartment
	},
	data() {
		return {
			valid: false,
			filter: {
				empName: '',
				numbering: '',
				deptId: '',
				email: '',
				status: 'Active',
			},
			statusList: [],
			page: 1,
			pageCount: 0,
			itemsPerPage: 30,
			totalPage: 18,
			batchLists: [],
			headers: [
				{ text: '同仁姓名', value: 'empName', align: 'center' },
				{ text: '同仁員編', value: 'empNumber', align: 'center' },
				{ text: '同仁單位', value: 'deptName', align: 'center' },
				{ text: '同仁E-mail', value: 'email', align: 'left' },
				{ text: '帳號狀態', value: 'status', align: 'center' },
				{ text: '操作', value: 'action', align: 'center' },
			],
			desserts: [],
			isEditApply: false,
			editObj: {},
			options: [],
			isBatchDepartment: false,
			changeCreate: false
		};
	},
	computed: {
		...mapGetters(['getDepts']),

		departmentList() {
			return this.getDepts;
		}
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapActions(['setLoading', 'setDepts']),

		async init() {
			await this.getData();
			await this.getDepartmentList();
			await this.getStatus();
		},

		async getData() {
			const data = {
				pageNumber: _.toString(this.page),
				pageSize: _.toString(this.itemsPerPage),
				empName: _.toString(this.filter.empName),
				email: _.toString(this.filter.email),
				deptId: _.toString(this.filter.deptId),
				status: _.toString(this.filter.status),
			};
			const res = await apiEmployeeUserList(data);
			if (res.isSuccess === true) {
				this.page = res.data.currentPage;
				this.pageCount = res.data.totalPages;
				this.desserts = res.data.data;
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.setMessageBar({
					message: sysMsg,
					type: messageType.WARNING,
				});
			}
		},

		async getDepartmentList() {
			const res = await apiGetDepts();
			if (res.isSuccess == true) {
				this.setDepts(res.data);
			}
		},

		async getStatus() {
			const res = await apiGetEmployeeListConfig();
			if(res.isSuccess === true) {
				this.statusList = [
					{ dataCode: '', dataName: '全部' },
					...res.data.employeeStatuses
				]
				this.options = res.data.employeeStatuses;
			}
		},

		getStatusColor(val) {
			let color = '';
			switch (val) {
				case 'Active':
					color = 'green'
					break;
				case 'Rejected':
					color = 'red'
					break;
				case 'PendingApproval':
					color = 'orange'
					break;
			}
			return color;
		},
		onCreate() {
			this.editObj = {};
			this.changeCreate = true;
			this.isEditApply = true;
		},
		onEdit(item) {
			this.editObj = item;
			this.isEditApply = true;
		},
		onCreatedAndEdited() {
			this.editObj = {};
			this.isEditApply = false;
			this.changeCreate = false;
			this.getData();
		},
		onEditCancel() {
			this.editObj = {};
			this.isEditApply = false;
			this.changeCreate = false;
		},
		onBatchChange () {
			this.isBatchDepartment = true;
		},
		onBatchDeptConfirm() {
			this.isBatchDepartment = false;
			this.getData();
		},
		onClean() {
			this.filter = {
				empName: '',
				numbering: '',
				deptId: '',
				email: '',
				status: 'Active',
			};
		},
	},
	watch: {
		page() {
			this.getData();
		}
	}
}
</script>