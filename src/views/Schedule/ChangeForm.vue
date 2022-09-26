<template lang="pug">
v-card
	v-card-title.justify-center.text-h5.secondary--text.font-weight-bold.px-4.pt-6 {{ title }}
	v-card-text.pa-4
		v-form(ref='form' v-model='valid' @submit.native.prevent='')
			v-textarea(v-model='content' filled hide-details='auto')
	v-card-actions.pb-6
		v-row
			v-col(cols='6')
				v-btn(@click='onCancel' color='primary' outlined rounded width='100%' height='50') 關閉視窗
			v-col(cols='6')
				v-btn(@click='onConfirm' color='primary' depressed rounded width='100%' height='50') 送出
</template>
<script>
import _ from 'lodash';
import { mapActions } from 'vuex';
import { messageType } from "@/utils/constant";
import { apiCalendarSendToVerify, apiCalendarApplyReject } from "@/api/api";

export default {
	props: {
		isChange: {
			type: Boolean,
			require: true,
		},
		calendarData: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			valid: false,
			content: '',
		};
	},
	computed: {
        title() {
            return this.isChange ? '班表異動原因' : '班表申請退回原因';
        },
    },
	mounted() {

	},
	methods: {
		...mapActions(['setMessageBar']),

		onShowOrHidePassword() {
            this.hidePassword = !this.hidePassword;
        },

		onConfirm() {
			const isAllow = this.isAllowWorkDays();
			if(!isAllow) {
				this.setMessageBar({
					type: messageType.WARNING,
					message: '您有排班不符合勞基法規則，請重新確認，謝謝。'
				});
				return;
			}
			this.valid = this.$refs.form.validate();
			if (this.valid) {
				if (this.isChange) {
					this.doCalendarApprove();
				} else {
					this.doCalendarReject();
				}
			}
		},

		// 確認是否符合做六休一
		isAllowWorkDays() {
			let workDays = 0;
			let isAllow = true;
			const calendarWorkBlocks = this.calendarData.employeeCalendarWorkBlocks;
			_.forEach(calendarWorkBlocks, (item) => {
				_.forEach(item.employeeCalendarWorkDates, (subItem) => {
					if(subItem.dateType !== 'Leave' && subItem.dateType !== 'Holiday') {
						workDays++;
						if(workDays > 6) {
							isAllow = false
						}
					} else {
						workDays = 0;
					}
				})
			})
			return isAllow;
		},

		//- 班表異動
		async doCalendarApprove() {
			//- 處理資料
			const data = {
				employeeCalendarId: _.toString(this.calendarData.employeeCalendarId),
				employeeId: _.toString(this.calendarData.employeeId),
				calendarYear: _.toNumber(this.calendarData.calendarYear),
				calendarMonth: _.toNumber(this.calendarData.calendarMonth),
				modifyReason: _.toString(this.content),
			};
			let employeeCalendarDates = [];
			// _.forEach(this.calendarData.employeeCalendarWorkBlocks, (item) => {
			// 	_.forEach(item.employeeCalendarWorkDates, (subItem) => {
			// 		const pushData = {
			// 			calendarDate: _.toString(subItem.calendarDate),
			// 			dateType: _.toString(subItem.dateType),
			// 			workHour: _.toNumber(subItem.workHour),
			// 			workStartTime: _.toString(subItem.workStartTime),
			// 			workEndTime: _.toString(subItem.workEndTime),
			// 		}
			// 		employeeCalendarDates.push(pushData);
			// 	});
			// });
			Object.assign(data, { employeeCalendarDates });
			//-
			const res = await apiCalendarSendToVerify(data);
			if (res.isSuccess === true) {
				this.setMessageBar({
					type: messageType.SUCCESS,
					message: '已成功送出班表審核申請'
				});
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

		//- 班表申請退回
		async doCalendarReject() {
			const data = {
				employeeCalendarId: _.toString(this.calendarData.employeeCalendarId),
				applyRejectReason: _.toString(this.content),
			};
			const res = await apiCalendarApplyReject(data);
			if (res.isSuccess === true) {
				this.setMessageBar({
					type: messageType.SUCCESS,
					message: '已成功送出班表退回申請'
				});
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

		onCancel() {
			this.$emit('emitCancel');
		}
	}
}
</script>