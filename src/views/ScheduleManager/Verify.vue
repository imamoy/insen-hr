<template lang="pug">
.page
	v-card.page-header(color='lightPrimary' tile flat dark)
		v-container.pb-2(fluid)
			.d-flex.align-center
				h2.text-h4.font-weight-bold 班表審核列表
			v-form.mt-4(ref='form' v-model='valid')
				v-row
					v-col(cols='9')
						v-row.filter-bar(no-gutters)
							v-col(cols)
								v-select(v-model='filter.year' :items='yearList' label='查詢年份' background-color='white' filled light)
							v-col(cols)
								v-select(v-model='filter.month' :items='monthList' label='查詢月份' item-value='id' item-text='text' background-color='white' filled light)
							v-col(cols)
								v-text-field(v-model='filter.empName' label='員工' name='name' type='text' background-color='white' filled light)
							v-col(cols)
								v-select(v-model='filter.dept' :items='depts' label='同仁單位' item-value='id' item-text='deptName' background-color='white' filled light)
							v-col(cols)
								v-select(v-model='filter.status' :items='statusList' label='審核狀態' item-value='dataCode' item-text='dataName' background-color='white' filled light)
					v-col(cols='3')
						v-row(no-gutters)
							v-col.pr-2(cols='6')
								v-btn(@click='getData' color='secondary' depressed width='100%' height='56' light) 查詢
							v-col.pl-2(cols='6')
								v-btn(@click='onClean' color='white' outlined width='100%' height='56' light) 清除查詢
	v-container(fluid)
		v-card.page-card.d-flex.flex-column.justify-space-between(color='white' height='100%' flat)
			v-data-table.has-pagination-table(:headers='headers' :items='desserts' :items-per-page='itemsPerPage' height='100%' fixed-header hide-default-footer)
				template(v-slot:item.status='{ item }')
					v-chip(:color='getStatusColor(item.status)' outlined) {{ item.statusName }}
						v-icon.ml-1(v-if="showAlertIcon(item)" @click='showChangeComment(item)' size='18' :color='getStatusColor(item.status)') mdi-alert-circle
				template(v-slot:item.employeeName='{ item }')
					span(:class="item.isBlockOverHour ? 'teal--text':''") {{ item.employeeName }}
				template(v-slot:item.action='{ item }')
					v-btn(v-if="item.isPendignCurrentManagerApprove && item.status !== 'Rejected'" @click='showSchedule(item)' color='primary' depressed dense width='80' height='35' light) 審核
					v-btn(v-else @click='showSchedule(item)' color='primary' outlined dense width='80' height='35' light) 檢視
			v-pagination.mb-5(v-model='page' :length='pageCount' :total-visible='totalPage' circle color='primary')
	v-dialog(v-model='isCalendarChangeComment' overlay-opacity='0.6' max-width='600' persistent no-click-animation)
		staff-change-comment(v-if='isCalendarChangeComment' @emitCancel='isCalendarChangeComment = false' :change-obj='calendarChangeObj')
	v-dialog(v-model='isSchedule' fullscreen persistent hide-overlay no-click-animation)
		schedule(:staff-obj='staffObj' @emitConfirm='onScheduleConfirm' @emitCancel='isSchedule = false' open-rule='Verify')
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import { mapActions } from 'vuex';
import { messageType } from "@/utils/constant";
import { apiGetCalendarApproeListConfig, apiCalendarApproveList } from "@/api/api";
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
			depts: [],
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
				{ text: '年份', value: 'calendarYear', align: 'center' },
				{ text: '月份', value: 'calendarMonth', align: 'center' },
				{ text: '審核狀態', value: 'status', align: 'center' },
				{ text: '單位名稱', value: 'deptName', align: 'center' },
				{ text: '員工', value: 'employeeName', align: 'center' },
				{ text: '操作', value: 'action', align: 'center' },
			],
			desserts: [],
			isCalendarChangeComment: false,
			calendarChangeObj: {},
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
			const res = await apiCalendarApproveList(data);
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
			const res = await apiGetCalendarApproeListConfig();
			if (res.isSuccess === true) {
				this.depts = res.data.depts;
				this.depts.unshift({ id: '', deptName: '全部' });
				this.statusList = res.data.calendarStatuses;
				this.statusList.unshift({ dataCode: '', dataName: '全部' });
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

		showAlertIcon(data) {
			return data.status === 'PendingApproval' && data.modifyReason || data.status === 'PendingReject' && data.applyRejectReason ||
			data.status === 'Rejected' && data.rejectReason ? true : false
		},

		showChangeComment(data) {
			this.calendarChangeObj = {
				status: data.status,
				applyRejectReason: data.applyRejectReason,
				modifyReason: data.modifyReason,
				rejectReason: data.rejectReason,
			}
			this.isCalendarChangeComment = true;
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
		}
	}
}
</script>