<template lang="pug">
.schedule.fill-height
	v-card.overflow-y-auto(tile height='100%')
		v-toolbar(dark color='lightPrimary')
			v-btn(icon dark @click='onCancel')
				v-icon mdi-close
			v-toolbar-title.text-h5.font-weight-bold {{ title }}
			v-spacer
			v-toolbar-items.text-h6.font-weight-bold.py-4.mr-5
				span {{ staffObj.deptName }} -
				span.ml-2 {{ staffObj.employeeName }}
		.pa-8
			.d-flex.justify-center.align-center
				h2.text-h4.font-weight-bold
					span {{ calendarData.calendarYear }}年
					span {{ calendarData.calendarMonth }}月
					span.ml-2 排班作業
				v-chip.ml-2(v-if='calendarData' :color='getStatusColor(calendarData.status)' dark) {{ calendarData.statusName }}
					v-icon.ml-1(v-if="calendarData.status === 'PendingApproval'" @click='showChangeComment(calendarData)' size='18') mdi-alert-circle
					v-icon.ml-1(v-else-if="calendarData.status === 'PendingReject'" @click='showChangeComment(calendarData)' size='18' color='red') mdi-alert-circle
			calendar(@emitClickEvent='clickEvent' :calendar-data='calendarData')
		v-card-actions.pb-4.pt-0.mt-auto(v-if="showCalendarBtns")
			v-row.justify-center
				v-col(cols='2' v-if='showToRejectedBtn')
					v-btn(@click='onReject' color='red' outlined rounded width='100%' height='50') 退回班表
				v-col(cols='2' v-if="this.openRule == 'Verify' && showConfirmVerifyBtn")
					v-btn(@click='onConfirmVerify' color='primary' depressed rounded width='100%' height='50') 確認班表
				v-col(cols='2' v-if="this.openRule == 'Manager' && showConfirmEditBtn")
					v-btn(@click='onConfirmEdit' color='primary' depressed rounded width='100%' height='50') 確認修改
	v-dialog(v-model='isStaffJoinApply' overlay-opacity='0.6' max-width='1200' persistent no-click-animation)
		staff-join-apply(v-if='isStaffJoinApply' @emitCancel='isStaffJoinApply = false' :event-obj='eventObj')
	v-dialog(v-model='isVerifyReturnForm' overlay-opacity='0.6' max-width='800' persistent no-click-animation)
		verify-return-form(v-if='isVerifyReturnForm' @emitConfirm='onRejectConfirm' @emitCancel='isVerifyReturnForm = false' :employee-calendar-id='employeeCalendarId')
	v-dialog(v-model='isConfirmDialog' overlay-opacity='0.6' max-width='360' persistent no-click-animation)
		confirm-dialog(v-if='isConfirmDialog' @emitConfirm='doConfirm' @emitCancel='isConfirmDialog = false' :message-obj='messageObj')
	v-dialog(v-model='isCalendarChangeComment' overlay-opacity='0.6' max-width='600' persistent no-click-animation)
		staff-change-comment(v-if='isCalendarChangeComment' @emitCancel='isCalendarChangeComment = false' :change-obj='calendarChangeObj')
</template>
<script>
import _ from 'lodash';
import { mapActions } from 'vuex';
import { messageType } from "@/utils/constant";
import { apiCalendarEmployee, apiCalendarApprove, apiCalendarManagerApprove } from "@/api/api";
import Calendar from '@/components/Calendar.vue';
import StaffJoinApply from './StaffJoinApply.vue';
import VerifyReturnForm from './VerifyReturnForm.vue';
import ConfirmDialog from '@/components/Dialog/ConfirmDialog';
import StaffChangeComment from './StaffChangeComment.vue';

export default {
	props: {
		openRule: {
			type: String,
			require: true
		},
		staffObj: {
			type: Object,
			require: true
		}
	},
	components: {
		Calendar,
		StaffJoinApply,
		VerifyReturnForm,
		ConfirmDialog,
		StaffChangeComment
	},
	data() {
		return {
			calendarData: {},
			isStaffJoinApply: false,
			isVerifyReturnForm: false,
			eventObj: {},
			isConfirmDialog: false,
			messageObj: {},
			isCalendarChangeComment: false,
			calendarChangeObj: {},
		};
	},
	computed: {
		title() {
            return this.staffObj.isPendignCurrentManagerApprove ? '審核班表' : '檢視班表';
        },
		employeeCalendarId() {
			return this.staffObj.employeeCalendarId;
		},
		showCalendarBtns() {
			if(this.$route.name === 'ScheduleManager') {
				return this.staffObj.status !== 'InActive';
			}
			if(this.$route.name === 'scheduleVerify') {
				return this.staffObj.isPendignCurrentManagerApprove && this.staffObj.status !== 'InActive';
			}
		return false;
		},
		showToRejectedBtn() {
			return this.calendarData.status === 'PendingApproval' || this.calendarData.status === 'PendingReject' || this.calendarData.status === 'Active' || this.calendarData.status === 'Approved' ? true : false;
		},
		showConfirmVerifyBtn() {
			return this.staffObj.isPendignCurrentManagerApprove && this.calendarData.status !== 'Rejected'	? true : false;
		},
		showConfirmEditBtn() {
			return this.calendarData.status === 'Rejected' || this.calendarData.status === 'PendingApproval' ? true : false;
		},
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapActions(['setMessageBar']),

		async init() {
			await this.getData();
		},

		async getData() {
			const res = await apiCalendarEmployee(this.employeeCalendarId);
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

		clickEvent(eventObj) {
			this.eventObj = eventObj;
			this.isStaffJoinApply = true;
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
		onReject() {
			this.isVerifyReturnForm = true;
		},

		onConfirmVerify() {
			this.isConfirmDialog = true;
			this.confirmWork = 'Verify',
			this.messageObj = {
				message: '您是否確認審核這個班表？'
			}
		},

		onConfirmEdit() {
			this.isConfirmDialog = true;
			this.confirmWork = 'Edit',
			this.messageObj = {
				message: '您是否確認修改這個班表？'
			}
		},

		doConfirm() {
			if (this.confirmWork == 'Verify') {
				this.doVerify();
			} else if (this.confirmWork == 'Edit') {
				this.doEdit();
			}
		},

		async doVerify() {
			const data = {
				employeeCalendarId: this.employeeCalendarId
			}
			const res = await apiCalendarApprove(data);
			if (res.isSuccess === true) {
				this.setMessageBar({
					type: messageType.SUCCESS,
					message: '已成功確認審核此班表'
				});
				this.getData();
				setTimeout(this.$emit('emitConfirm'), 2000);
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.setMessageBar({
					message: sysMsg,
					type: messageType.WARNING,
				});
			}
		},

		async doEdit() {
			const data = {
				employeeCalendarId: this.employeeCalendarId
			}
			const res = await apiCalendarManagerApprove(data);
			if (res.isSuccess === true) {
				this.setMessageBar({
					type: messageType.SUCCESS,
					message: '已成功確認修改此班表'
				});
				this.getData();
				setTimeout(this.$emit('emitConfirm'), 2000);
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.setMessageBar({
					message: sysMsg,
					type: messageType.WARNING,
				});
			}
		},

		onRejectConfirm() {
			this.isVerifyReturnForm = false;
			this.$emit('emitConfirm')
		},

		onCancel() {
			this.$emit('emitCancel');
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
	},
	watch: {
		staffObj() {
			this.getData();
		}
	}
}
</script>