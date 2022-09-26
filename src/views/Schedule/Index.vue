<template lang="pug">
.page
	v-card.page-header(color='lightPrimary' height='10vh' tile flat dark)
		v-container.pb-2(fluid)
			.d-flex.justify-center.align-center(no-gutters)
				v-select.select-hide-dropdown.calendar-year-select.pt-0.mt-0(v-model='year' :items='yearList' label='查詢年份' solo background-color='transparent' flat hide-details hide-spin-buttons @change='getData')
					template(v-slot:selection='data')
						.text-h4.font-weight-bold.text-decoration-underline(v-bind='data.attrs' :value='data.selected') {{ data.item }}年
				v-select.select-hide-dropdown.calendar-month-select.pt-0.mt-0(v-model='month' :items='monthList' label='查詢月份' item-value='id' item-text='text' solo background-color='transparent' flat hide-details @change='getData')
					template(v-slot:selection='data')
						.text-h4.font-weight-bold.text-decoration-underline(v-bind='data.attrs' :value='data.selected') {{ data.item.text }}
				h2.text-h4.font-weight-bold 排班作業
				v-chip.ml-2(v-if='calendarData' :color='getStatusColor(calendarData.status)' dark) {{ calendarData.statusName }}
					v-icon.ml-1(v-if="calendarData.status === 'PendingApproval'" @click='showChangeComment(calendarData)' size='18') mdi-alert-circle
					v-icon.ml-1(v-else-if="calendarData.status === 'PendingReject'" @click='showChangeComment(calendarData)' size='18' color='red') mdi-alert-circle
					v-icon.ml-1(v-else-if="calendarData.status === 'Rejected'" @click='showChangeComment(calendarData)' size='18' color='white') mdi-alert-circle
	v-container(fluid)
		v-card.mt-sm-n5.nt-xl-n10.px-8.py-0.overflow-y-auto(color='white' height='78vh' flat style="z-index: 0")
			calendar(@emitClickEvent='clickEvent' :calendar-data='calendarData')
		v-row.justify-center.mt-2
			v-col(v-if='showReturnBtn' cols='2')
				v-btn(@click='onReturn' color='secondary' outlined depressed rounded width='100%' height='50' dark) 回復上個版本
			v-col(v-if='showToApproveBtn' cols='2')
				v-btn(@click='onApprove' color='primary' depressed rounded width='100%' height='50' dark) 送出審核申請
			v-col(v-if='showToRejectedBtn' cols='2')
				v-btn(@click='onReject' color='red' outlined depressed rounded width='100%' height='50' dark) 申請退回班表
	v-dialog(v-model='isActivityApply' overlay-opacity='0.6' max-width='1340' persistent no-click-animation)
		activity-apply(v-if='isActivityApply' @emitConfirm='onActivityConfirm' @emitCancel='isActivityApply = false' :event-obj='eventObj')
	v-dialog(v-model='isChangeForm' overlay-opacity='0.6' max-width='800' persistent no-click-animation)
		change-form(v-if='isChangeForm' @emitConfirm='onChangeConfirm' @emitCancel='isChangeForm = false' :is-change='changeWork' :calendar-data='calendarData')
	v-dialog(v-model='isConfirmDialog' overlay-opacity='0.6' max-width='360' persistent no-click-animation)
		confirm-dialog(v-if='isConfirmDialog' @emitConfirm='doReturn' @emitCancel='isConfirmDialog = false' :message-obj='messageObj')
	v-dialog(v-model='isCalendarChangeComment' overlay-opacity='0.6' max-width='800' persistent no-click-animation)
		staff-change-comment(v-if='isCalendarChangeComment' @emitCancel='isCalendarChangeComment = false' :change-obj='calendarChangeObj')
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import { mapActions } from 'vuex';
import { messageType } from "@/utils/constant";
import { apiCalendar, apiCalendarReverse } from "@/api/api";
import Calendar from '@/components/Calendar.vue';
import ActivityApply from './ActivityApply.vue';
import ChangeForm from './ChangeForm.vue';
import ConfirmDialog from '@/components/Dialog/ConfirmDialog';
import StaffChangeComment from './StaffChangeComment.vue';

export default {
	components: {
		Calendar,
		ActivityApply,
		ChangeForm,
		ConfirmDialog,
		StaffChangeComment
	},
	data() {
		return {
			year: '',
			yearList: [],
			month: '',
			monthList: [
				{ id: 0, text: '請選擇' },
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
			eventObj: {},
			isActivityApply: false,
			isChangeForm: false,
			changeWork: false,
			calendarData: {},
			isConfirmDialog: false,
			messageObj: {},
			isCalendarChangeComment: false,
			calendarChangeObj: {},
		};
	},
	computed: {
		showReturnBtn() {
			return this.calendarData.status === 'Editing' || this.calendarData.status === 'Rejected' ? true : false;
		},
		showToApproveBtn() {
			return this.calendarData.status === 'Active' || this.calendarData.status === 'Editing' || this.calendarData.status === 'Rejected' || this.calendarData.status === 'Approved' ? true : false;
		},
		showToRejectedBtn() {
			return this.calendarData.status === 'PendingApproval' ? true : false;
		},
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapActions(['setMessageBar']),

		init() {
			this.getYearLists();
			this.getMonth();
			this.getData();
		},

		getYearLists() {
			this.year = moment().year();
			const yearCount = this.year + 1;
			for(let year = this.year; year <= yearCount; year++) {
				this.yearList.push(year);
			}
		},

		async getData() {
			const res = await apiCalendar(this.year, this.month);
			if (res.isSuccess === true) {
				this.calendarData = res.data;
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.setMessageBar({
					message: sysMsg,
					type: messageType.WARNING,
				});
			}
		},

		getMonth() {
			const month = moment().add(1, 'M').format('MM');
			this.month = _.parseInt(month);
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

		//-
		onApprove() {
			this.changeWork = true;
			this.isChangeForm = true;
		},

		onReject() {
			this.changeWork = false;
			this.isChangeForm = true;
		},

		onChangeConfirm() {
			this.isChangeForm = false;
			this.getData();
		},

		//- 回復上一個版本
		onReturn() {
			this.isConfirmDialog = true;
			this.messageObj = {
				message: '您確定回復上一個版本的班表？'
			}
		},

		async doReturn(){
			this.isConfirmDialog = false;
			const res = await apiCalendarReverse(this.calendarData.employeeCalendarId);
			if (res.isSuccess === true) {
				this.setMessageBar({
					type: messageType.SUCCESS,
					message: '已成功回復上一個版本的班表'
				});
				this.getData();
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.setMessageBar({
					message: sysMsg,
					type: messageType.WARNING,
				});
			}
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

		onActivityConfirm() {
			this.isActivityApply = false;
			this.getData();
		},

		clickEvent(eventObj) {
			this.eventObj = {
				...eventObj,
				calendarStatus: this.calendarData.status
			};
			this.isActivityApply = true;
		}
	}
}
</script>