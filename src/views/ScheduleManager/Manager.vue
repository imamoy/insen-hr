<template lang="pug">
.page.fill-height
	v-card.page-header(color='lightPrimary' tile flat dark)
		v-container.pb-2(fluid)
			.d-flex.align-center
				h2.text-h4.font-weight-bold 班表管理
			v-form.mt-4(ref='form' v-model='valid')
				v-row.justify-space-between.flex-column.flex-lg-row
					v-col
						v-row.filter-bar(no-gutters)
							v-col(cols)
								v-text-field(label='同仁名稱' name='name' type='text' v-model='filter.empName' background-color='white' hide-details="auto" filled light)
							v-col(cols)
								v-select(v-model='filter.dept' :items='depts' label='同仁單位' item-value='id' item-text='deptName' hide-details="auto" background-color='white' filled light)
							v-col(cols)
								v-select(v-model='filter.status' :items='statusList' label='審核狀態' item-value='dataCode' item-text='dataName' hide-details="auto" background-color='white' filled light)
							v-col(cols)
								v-select(v-model='filter.year' :items='yearList' label='查詢年份' hide-details="auto" background-color='white' filled light)
							v-col(cols)
								v-select(v-model='filter.month' :items='monthList' label='查詢月份' item-value='id' item-text='text' hide-details="auto" background-color='white' filled light)

					v-col.flex-grow-0
						div.d-flex.justify-space-between.align-center(no-gutters)
							div.d-flex.mb-2.mr-2
								v-btn.mr-2(@click='getData' color='secondary' depressed min-width='120' height='56' light) 查詢
								v-btn(@click='onClean' color='white' outlined min-width='120' height='56' light) 清除查詢
							div.d-flex.mb-2
								v-btn.mr-2(@click='onExportCalendar' color='green' depressed rounded min-width='120' height='56' dark) 匯出班表
								v-btn(@click='onExportOverTimeCalendar' color='orange darken-4' depressed rounded min-width='120' height='56' dark) 匯出加班表
	v-container.pt-4(fluid)
		v-card.page-card.d-flex.flex-column.justify-space-between(color='white' width='100%' height='100%' flat)
			v-data-table.has-pagination-table(v-model='originSelectList' :headers='headers' :items='desserts' :items-per-page='itemsPerPage' height='100%' fixed-header hide-default-footer show-select item-key='employeeCalendarId' @toggle-select-all='selectAllToggle')
				template(v-slot:item.data-table-select='{ item, isSelected, select }')
					v-simple-checkbox(:value='isSelected' :readonly='checkCheckDisabled(item.status)' :disabled='checkCheckDisabled(item.status)' @input='select($event)')
				template(v-slot:item.employeeName='{ item }')
					span(:class="item.hours > 80 ? 'teal--text':''") {{ item.employeeName }}
				template(v-slot:item.status='{ item }')
					v-chip(:color='getStatusColor(item.status)' outlined) {{ item.statusName }}
				template(v-slot:item.action='{ item }')
					v-btn(@click='showSchedule(item)' color='primary' dense outlined width='80' height='30' light) 檢視
			v-pagination.mb-5(v-model='page' :length='pageCount' :total-visible='totalPage' circle color='primary')
	v-dialog(v-model='isStaffChangeComment' overlay-opacity='0.6' max-width='600' persistent no-click-animation)
		staff-change-comment(v-if='isStaffChangeComment' @emitCancel='isStaffChangeComment = false' :change-obj='staffChangeObj')
	v-dialog(v-model='isSchedule' fullscreen persistent hide-overlay no-click-animation)
		schedule(:staff-obj='staffObj' @emitConfirm='onScheduleConfirm'  @emitCancel='isSchedule = false' open-rule='Manager')
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import { mapActions } from 'vuex';
import { messageType } from "@/utils/constant";
import { apiGetCalendarManagerListConfig, apiCalendarManagerList, apiExportCalendar, apiExportOverTimeCalendar } from "@/api/api";
import Schedule from './Schedule.vue';
import StaffChangeComment from './StaffChangeComment.vue';

export default {
	components: {
		Schedule,
		StaffChangeComment
	},
	data() {
		return {
			valid: false,
			filter: {
				empName: '',
				dept: '',
				status: '',
				year: null,
				month: null,
			},
			originSelectList: [],
			selectList: [],
			disabledCount: 0,
			depts: ['全部'],
			statusList: [],
			yearList: [],
			monthList: [
				{ id: 1, text: '1月' },
				{ id: 2, text: '2月' },
				{ id: 3, text: '3月' },
				{ id: 4, text: '4月' },
				{ id: 5, text: '5月' },
				{ id: 6, text: '6月' },
				{ id: 7, text: '7月' },
				{ id: 8, text: '8月' },
				{ id: 9, text: '9月' },
				{ id: 10, text: '10月' },
				{ id: 11, text: '11月' },
				{ id: 12, text: '12月' },
			],
			page: 1,
            pageCount: 0,
			itemsPerPage: 30,
			totalPage: 18,
			headers: [
				{ text: '同仁', value: 'employeeName', align: 'center' },
				{ text: '單位名稱', value: 'deptName', align: 'center' },
				{ text: '審核狀態', value: 'status', align: 'center' },
				{ text: '班表總時數', value: 'totalWorkHour', align: 'center' },
				{ text: '加班總時數', value: 'totalOverTimeHour', align: 'center' },
				{ text: '操作', value: 'action', align: 'center' },
			],
			desserts: [],
			isStaffChangeComment: false,
			staffChangeObj: {},
			isSchedule: false,
			staffObj: {}
		};
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapActions(['setLoading', 'setMessageBar']),

		async init() {
			this.setLoading(true);
			await this.getOptions();
			this.getYearLists();
			this.getMonth();
			await this.getData();
			this.setLoading(false);
		},

		getYearLists() {
			this.filter.year = moment().year();
			const yearCount = this.filter.year + 1;
			for(let year = this.filter.year; year <= yearCount; year++) {
				this.yearList.push(year);
			}
		},

		getMonth() {
			const month = moment().subtract('month', -1).format('MM');
			this.filter.month = _.parseInt(month);
		},

		async getData() {
			const data = {
				pageNumber: _.toString(this.page),
				pageSize: _.toString(this.itemsPerPage),
				year: _.toNumber(this.filter.year),
				month: _.toNumber(this.filter.month),
				empName: _.toString(this.filter.empName),
				deptId: _.toString(this.filter.dept),
				status: _.toString(this.filter.status),
			};
			const res = await apiCalendarManagerList(data);
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

		async getOptions() {
			const res = await apiGetCalendarManagerListConfig();
			if (res.isSuccess === true) {
				this.depts = res.data.depts;
				this.statusList = res.data.calendarStatuses;
			}
		},

		getStatusColor(val) {
			let color = '';
			switch (val) {
				case 'Active': //- 已完成
					color = 'green'
					break;
				case 'Rejected': //- 退回
					color = 'red'
					break;
				case 'PendingApproval':  //- 待審核
					color = 'grey lighten-1'
					break;
				case 'Editing':  //- 審核中
					color = 'Orange'
					break;
				case 'InActive':  //- 停用
					color = 'default'
					break;
				case 'Approved':  //- 審核通過
					color = 'light-green'
					break;
				case 'PendingReject':  //- 申請退回
					color = 'amber lighten-1'
					break;
			}
			return color;
		},

		selectAllToggle(props) {
			if(this.selectList.length != this.desserts.length - this.disabledCount) {
				this.selectList = [];
				const self = this;
				props.items.forEach(item => {
				if(!item.disabled) {
					self.selectList.push(item);
				}
				});
			} else this.selectList = [];
		},

		checkCheckDisabled(status) {
			let disabled = false;
			if (status === 'PendingApproval' || status === 'PendingReject' || status === 'InActive' || status === 'Editing' || status === 'Rejected') {
				disabled = true;
			} else {
				disabled = false;
			}
			return disabled
		},

		async onExportCalendar() {
			if (!_.isEmpty(this.selectList)) {
				const res = await apiExportCalendar(this.selectList);
				const url = URL.createObjectURL(new Blob([res], {
					type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
				}));
				const link = document.createElement('a')
				link.href = url
				link.setAttribute('download', '班表')
				document.body.appendChild(link)
				link.click()
			}
		},

		async onExportOverTimeCalendar() {
			if (!_.isEmpty(this.selectList)) {
				const res = await apiExportOverTimeCalendar(this.selectList);
				const url = URL.createObjectURL(new Blob([res], {
					type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
				}));
				const link = document.createElement('a')
				link.href = url
				link.setAttribute('download', '加班表')
				document.body.appendChild(link)
				link.click();
			}
		},

		showSchedule(data) {
			this.staffObj = data;
			this.isSchedule = true;
		},

		onScheduleConfirm() {
			this.getData();
			this.isSchedule = false;
		},

		onClean() {
			this.filter = {
				empName: '',
				dept: '',
				status: '',
				year: moment().year(),
				month: _.parseInt(moment().subtract('month', -1).format('MM')),
			}
		},
	},
	watch: {
		page() {
			this.getData();
		},
		originSelectList() {
			const handleSelect = [];
			_.forEach(this.originSelectList, (item) => { handleSelect.push(item.employeeCalendarId); });
			this.selectList = _.uniq(handleSelect);
		}
	}
}
</script>