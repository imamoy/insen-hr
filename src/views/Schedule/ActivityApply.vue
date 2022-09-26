<template lang="pug">
.activity-apply
	v-card
		v-card-title.align-center.justify-space-between.px-4.pt-6.pb-0
			.text-h5.secondary--text.font-weight-bold {{ campaign.campaignName }}
			v-chip.ml-3(:color='statusColor' dark) {{ campaign.status }}
		v-card.ma-4.pa-4(color='grey lighten-3' flat)
			v-form(ref='form' v-model='valid' @submit.native.prevent='')
				v-row
					v-col(cols='3')
						.mt-1 活動日期：{{ eventObj.campaignDate }}
					v-col(cols='9')
						v-row.align-center(no-gutters)
							v-col(cols='auto')
								span.red--text *
								span 補休日期：
							v-col(cols='4')
								v-select(v-model='campaign.campaignLeaveDate' :items='leaveDateOptions' background-color='white' item-value='date' item-text='date' :label="campaign.campaignLeaveDate" item-disabled='disabled' dense solo flat hide-details :disabled='beforeCampaignDate')
							v-col.mt-2(cols='8')
								.red--text.text-caption *選定之排休日期，請務必避開於 Apollo 上已申請之特休或其他假別
				v-divider.my-3
				v-row
					v-col(cols='5')
						span 活動時間：{{ campaign.startTime }} ~ {{ campaign.endTime }}
					v-col.d-flex(cols='4' offset='1')
						span 用餐時間：
						div.d-flex.flex-column
							span.ml-4(v-for='(item, index) in campaign.campaignDinnerTimes' :key='index') {{ item.startTime }} ~ {{ item.endTime }}
					v-col.text-right(cols='2') 共計 #[span(:class='getTotalHourOver(campaign.totalHour)') {{ campaign.totalHour }}] 小時
				v-row
					v-col(cols='6')
						v-row.align-center
							v-col.d-flex.align-center(cols='auto')
								span 預計與會時間：
							v-col(cols='4')
								v-sheet.px-1(color='#0000000f' rounded v-if='campaign.timeMenu')
									v-row(no-gutters)
										v-col(cols='6')
											v-select(v-model='employee.startTimeHour' :items='campaign.timeMenu.hourList' item-value='value' item-text='value' hide-details solo background-color='transparent' flat height='40' @change='changeCampaignHourMinute(campaign)')

										v-col(cols='6')
											v-select(v-model='employee.startTimeMinute' :items='campaign.timeMenu.minuteList' item-value='value' item-text='value' hide-details solo background-color='transparent' flat height='40' @change='changeCampaignHourMinute(campaign)')
							v-col(cols='auto')
								span 至
							v-col(cols='4')
								v-sheet.px-1(color='#0000000f' rounded v-if='campaign.timeMenu')
									v-row(no-gutters)
										v-col(cols='6')
											v-select(v-model='employee.endTimeHour' :items='campaign.timeMenu.hourList' item-value='value' item-text='value' hide-details solo background-color='transparent' flat height='40' @change='changeCampaignHourMinute(campaign)')
										v-col(cols='6')
											v-select(v-model='employee.endTimeMinute' :items='campaign.timeMenu.minuteList' item-value='value' item-text='value' hide-details solo background-color='transparent' flat height='40' @change='changeCampaignHourMinute(campaign)')
					v-col(cols='6')
						v-row.align-center(v-for='(item, index) in employee.dinnerTime' :key='index')
							v-col.d-flex.align-center(cols='auto')
								span 用餐時間：
							v-col(cols='4')
								v-sheet.px-1(color='#0000000f' rounded v-if='item.timeMenu')
									v-row(no-gutters)
										v-col(cols='6')
											v-select(v-model='item.timeMenu.startTimeHour' :items='item.timeMenu.hourList' item-value='value' item-text='value' hide-details solo background-color='transparent' flat height='40' @change='changeHourMinute(item)')
										v-col(cols='6')
											v-select(v-model='item.timeMenu.startTimeMinute' :items='item.timeMenu.minuteList' item-value='value' item-text='value' hide-details solo background-color='transparent' flat height='40' @change='changeHourMinute(item)')
							v-col(cols='auto')
								span 至
							v-col(cols='4')
								v-sheet.px-1(color='#0000000f' rounded v-if='item.timeMenu')
									v-row(no-gutters)
										v-col(cols='6')
											v-select(v-model='item.timeMenu.endTimeHour' :items='item.timeMenu.hourList' item-value='value' item-text='value' hide-details solo background-color='transparent' flat height='40' @change='changeHourMinute(item)')
										v-col(cols='6')
											v-select(v-model='item.timeMenu.endTimeMinute' :items='item.timeMenu.minuteList' item-value='value' item-text='value' hide-details solo background-color='transparent' flat height='40' @change='changeHourMinute(item)')
							v-col(cols='1')
								v-btn(v-if='index > 0' icon @click='onRemoveCampaignDinnerTimes(index)')
									v-icon(size='30') mdi-minus-circle-outline
								v-btn(v-else-if='item.startTime && item.endTime' icon @click='onAddCampaignDinnerTimes')
									v-icon(size='30') mdi-plus-circle-outline
						.red--text.text-caption.mt-4 *建議用餐時間可設置為：12:00-13:00、18:00-19:00
					v-col.mt-1(cols='2') 共計 #[span(:class='getTotalHourOver(getEmpTotalHour)') {{ getEmpTotalHour }}] 小時
				v-divider.my-3
				v-row
					v-col(cols='12')
						span 活動地點：
						v-btn(:href="'https://www.google.com/maps/dir//'+campaign.locationName+'('+campaign.city+campaign.area+campaign.address+')'" target='_blank' color='primary' dense depressed small height='30' text)
							span {{ campaign.locationName }} ( {{ campaign.city + campaign.area + campaign.address}} )
							v-icon(size='24') mdi-map-marker
					v-col(cols='12')
						span 活動附件：
						v-btn.pa-0(v-for='(item, index) in campaign.campaignAttachments' :href='item.filePath' color='primary' target='_blank' dense depressed small height='30' text :key='index' :download='item.fileName')
							span.ml-2 {{ item.fileName }}
							v-icon.ml-2(size='24') mdi-paperclip
					v-col(cols='12')
						span 活動說明：
						v-card.pa-4.mt-2(color='white' flat v-html='campaign.description')
		v-card-actions.pb-4.pt-0
			v-row.justify-center
				v-col(cols='3' v-if='showCancelCampaignBtn')
					v-btn(@click='onCancelCampaign' color='danger' outlined rounded width='100%' height='50') 取消報名
				v-col(cols='3' v-if='showSaveBtn')
					v-btn(@click='onSave' color='primary' depressed rounded width='100%' height='50') 儲存
				v-col(cols='3')
					v-btn(@click='onCancel' color='primary' outlined rounded width='100%' height='50') 關閉視窗
	v-dialog(v-model='isApplyConfirm' overlay-opacity='0.6' max-width='400' persistent no-click-animation)
		apply-confirm(v-if='isApplyConfirm' @emitConfirm='onOverTimeConfirm' @emitCancel='isApplyConfirm = false' :is-over-time='overTime' :over-time-option='eventObj.employeeCalendarCompensationTypes')
	v-dialog(v-model='isConfirmDialog' overlay-opacity='0.6' max-width='360' persistent no-click-animation)
		confirm-dialog(v-if='isConfirmDialog' @emitConfirm='onCancelCampaignConfirm' @emitCancel='isConfirmDialog = false' :message-obj='messageObj')
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import { mapActions } from 'vuex';
import { messageType } from "@/utils/constant";
import { apiCampaignDetail, apiCalendarCancelCampaign, apiCalendarRegisterCampaign } from "@/api/api";
import ApplyConfirm from './ApplyConfirm.vue';
import ConfirmDialog from '@/components/Dialog/ConfirmDialog';

export default {
	props: {
		eventObj: {
			type: Object,
			required: true
		}
	},
	components: {
		ApplyConfirm,
		ConfirmDialog
	},
	data() {
		return {
			valid: false,
			toDay: moment().format('YYYY-MM-DD'),
			campaign: {},
			registerCampaign: {},
			leaveDateOptions: [],
			empStartTimeMenu: false,
			empEndTimeMenu: false,
			isApplyConfirm: false,
			isConfirmDialog: false,
			messageObj: {},
			overTime: false,
			employee: {
				startTimeHour: '',
				startTimeMinute: '',
				endTimeHour: '',
				endTimeMinute: '',
				dinnerTime: [],
			}
		};
	},
	computed: {
		campaignId() {
			return this.eventObj.campaignId;
		},
		campaignDate() {
			return this.eventObj.campaignDate;
		},
		employeeCalendarCampaignId() {
			return this.eventObj.employeeCalendarCampaignId === 0 ? '': this.eventObj.employeeCalendarCampaignId;
		},
		statusColor() {
			return this.campaign.status === '尚未報名' ? 'red':'green';
		},
		registered() {
			return this.campaign.status === '已報名' ? true : false;
		},
		beforeCampaignDate() {
			const isBefore = moment(this.eventObj.campaignDate).isBefore(this.toDay);
			return isBefore;
		},
		showCancelCampaignBtn() {
			return this.registered &&
			!this.beforeCampaignDate &&
			this.eventObj.calendarStatus === 'Approved' ||
			this.eventObj.calendarStatus === 'Active' ||
			this.eventObj.calendarStatus === 'Rejected' ||
			this.eventObj.calendarStatus === 'Editing'
		},
		showSaveBtn() {
			return !this.beforeCampaignDate &&
			this.eventObj.calendarStatus === 'Approved' ||
			this.eventObj.calendarStatus === 'Active' ||
			this.eventObj.calendarStatus === 'Rejected' ||
			this.eventObj.calendarStatus === 'Editing'
		},
		employeeStartTime() {
			return `${this.employee.startTimeHour}:${this.employee.startTimeMinute}`
		},
		employeeEndTime() {
			return `${this.employee.endTimeHour}:${this.employee.endTimeMinute}`
		},
		getEmpTotalHour() {
			if(!this.employee.dinnerTime) return 0;

			// (與會結束時間 - 與會開始時間) - 所有用餐時間 ＝ 共計時數
			let startTime = moment(this.employeeStartTime, "HH:mm a");
			let endTime = moment(this.employeeEndTime, "HH:mm a");
			let duration = moment.duration(endTime.diff(startTime));
			let campaignHour = duration.asHours();

			let dinnerTotalHour = 0;
			dinnerTotalHour = this.employee.dinnerTime.reduce((acc, val) => {
				let dinnerHour = 0
				if(val.endTime && val.startTime) {
					const dinnerEndTime = moment(val.endTime, "HH:mm a");
					const dinnerStartTime = moment(val.startTime, "HH:mm a");
					const dinnerDuration = moment.duration(dinnerEndTime.diff(dinnerStartTime));
					dinnerHour = dinnerDuration.asHours();
				}
				return acc + dinnerHour;
			}, 0)

			// 以半小時為單位，無條件進位不足0.5小時的時數
			const totalHour = campaignHour - dinnerTotalHour;
			const intTotalHour = parseInt(totalHour);

			let finallyTotalHour;
			let diffHour = totalHour - intTotalHour;
			if(diffHour === 0) {
				finallyTotalHour = totalHour;
			}
			else if(diffHour > 0.5) {
				finallyTotalHour = intTotalHour + 1;
			}
			else if (diffHour <= 0.5) {
				finallyTotalHour = intTotalHour + 0.5;
			}
			else {
				finallyTotalHour = totalHour;
			}
			return finallyTotalHour;
		}
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapActions(['setMessageBar']),

		init() {
			this.getLeaveDateOptions();
			this.getData();
		},

		getLeaveDateOptions() {
			const options = [];
			_.forEach(this.eventObj.campaignLeaveDateOptions, (item) => {
				const data = {
					date: item,
					disabled: moment(item).isBefore(this.toDay),
				}
				options.push(data);
			})
			this.leaveDateOptions = options;
		},

		async getData() {
			const res = await apiCampaignDetail(this.campaignId, this.campaignDate, this.employeeCalendarCampaignId);
			if (res.isSuccess === true) {
				const data = res.data;
				this.handleData(data);
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.setMessageBar({
					message: sysMsg,
					type: messageType.WARNING,
				});
			}
		},

		handleData(data) {
			//- 獲取會員參與活動時間選單
			const campaignSelectList = this.getHourMinuteList(data.startTime, data.endTime);
			const timeMenu = {
				startTimeHour: data.startTime.slice(0, 2),
				startTimeMinute: data.startTime.slice(3, 5),
				endTimeHour: data.endTime.slice(0, 2),
				endTimeMinute: data.endTime.slice(3, 5),
				hourList: campaignSelectList.hourLists,
				minuteList: campaignSelectList.minuteList,
			}
			Object.assign(data, { timeMenu });
			_.forEach(data.campaignDinnerTimes, (item) => {
				const campaignDinnerSelectList = this.getHourMinuteList(item.startTime, item.endTime);
				//- 獲取用餐時間選單
				const timeMenu = {
					startTimeHour: item.startTime.slice(0, 2),
					startTimeMinute: item.startTime.slice(3, 5),
					endTimeHour: item.endTime.slice(0, 2),
					endTimeMinute: item.endTime.slice(3, 5),
					hourList: campaignDinnerSelectList.hourLists,
					minuteList: campaignDinnerSelectList.minuteList,
				}
				const pushData = {
					startTime: item.startTime,
					endTime: item.endTime,
					timeMenu,
				}
				this.employee.dinnerTime.push(pushData)
			})

			//- 會員時間篩入預設時間
			this.campaign = data;
			this.employee.startTimeHour = !data.empStartTime ? data.startTime.split(':')[0] : data.empStartTime.split(':')[0];
			this.employee.startTimeMinute = !data.empStartTime ? data.startTime.split(':')[1] : data.empStartTime.split(':')[1];
			this.employee.endTimeHour = !data.empEndTime ? data.endTime.split(':')[0] : data.empEndTime.split(':')[0];
			this.employee.endTimeMinute = !data.empStartTime ? data.endTime.split(':')[1] : data.empEndTime.split(':')[1];
			data.empCampaignDinnerTimes = data.empCampaignDinnerTimes || [];
			_.forEach(data.empCampaignDinnerTimes, (dataItem) => {
				_.forEach(this.employee.dinnerTime, (item) => {
					item.timeMenu.startTimeHour = dataItem.startTime.split(':')[0];
					item.timeMenu.startTimeMinute = dataItem.startTime.split(':')[1];
					item.timeMenu.endTimeHour = dataItem.endTime.split(':')[0];
					item.timeMenu.endTimeMinute = dataItem.endTime.split(':')[1];
				})
			})
		},

		getHourMinuteList(startTime, endTime) {
			const startHour = _.toNumber(startTime.substr(0, 2));
			const endHour = _.toNumber(endTime.substr(0, 2));
			let hourLists = [];
			let minuteList = [];
			const totalMinute = 60;
			for (let h = startHour; h <= endHour; h++) {
				let value = '';
				if (_.inRange(h, 10)) {
					value = '0' + _.toString(h);
				} else {
					value = _.toString(h);
				}
				hourLists.push({ value });
			}
			for (let m = 0; m < totalMinute; m++) {
				let value = '';
				if (_.inRange(m, 10)) {
					value = '0' + _.toString(m);
				} else {
					value = _.toString(m);
				}
				minuteList.push({ value });
			}
			return { hourLists, minuteList }
		},

		getTotalHourOver(totalHour) {
			return totalHour > 8 ? 'orange--text' : 'primary--text';
		},

		changeCampaignHourMinute(data) {
			data.empStartTime = data.timeMenu.startTimeHour +':'+ data.timeMenu.startTimeMinute;
			data.empEndTime = data.timeMenu.endTimeHour +':'+ data.timeMenu.endTimeMinute;
		},

		changeHourMinute(data) {
			data.startTime = data.timeMenu.startTimeHour +':'+ data.timeMenu.startTimeMinute;
			data.endTime = data.timeMenu.endTimeHour +':'+ data.timeMenu.endTimeMinute;
		},

		onAddCampaignDinnerTimes() {
			const selectList = this.getHourMinuteList(this.campaign.startTime, this.campaign.endTime);
			const addItem = {
				startTime: '12:00',
				endTime: '13:00',
				timeMenu: {
					startTimeHour: '12',
					startTimeMinute: '00',
					endTimeHour: '13',
					endTimeMinute: '00',
					hourList: selectList.hourLists,
					minuteList: selectList.minuteList,
				},
			}
			this.employee.dinnerTime.push(addItem);
		},

		onRemoveCampaignDinnerTimes(index) {
			if (index != 0) {
				this.employee.dinnerTime.splice(index, 1);
			}
		},

		onShowOrHidePassword() {
            this.hidePassword = !this.hidePassword;
        },

		onCancelCampaign() {
			this.isConfirmDialog = true;
			this.messageObj = {
				message: '您確定要取消報名？'
			}
		},

		onCancelCampaignConfirm() {
			this.isConfirmDialog = false;
			this.doCancelCampaign();
		},

		async doCancelCampaign() {
			const res = await apiCalendarCancelCampaign(this.employeeCalendarCampaignId);
			if (res.isSuccess === true) {
				this.setMessageBar({
					type: messageType.SUCCESS,
					message: '已成功取消報名'
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

		onSave() {
			if(!this.campaign.campaignLeaveDate) {
				this.setMessageBar({
					type: messageType.WARNING,
					message: '未選擇補休日期，請確認！'
				});
				return;
			}
			this.overTime = this.getEmpTotalHour > 8 ? true : false;
			if (this.overTime) {
				this.isApplyConfirm = true;
			} else {
				this.handleDataSaveData();
			}
		},

		handleDataSaveData(overTimeType) {
			const overTime = this.getEmpTotalHour - 8;
			const data = {
				calendarYear: this.eventObj.calendarYear,
				calendarMonth: this.eventObj.calendarMonth,
				employeeCalendarId: this.eventObj.employeeCalendarId ? this.eventObj.employeeCalendarId : '',
				employeeId: this.eventObj.employeeId,
				campaignId: this.eventObj.campaignId,
				campaignDate: this.eventObj.campaignDate,
				campaignLeaveDate: this.campaign.campaignLeaveDate,
				campaignStartTime: this.employeeStartTime,
				campaignEndTime: this.employeeEndTime,
				campaignOverTimeCompensationType: overTimeType ? overTimeType : '',
				campaignOverTimeHour: this.overTime ? overTime : 0,
				campaignTotalHour: this.getEmpTotalHour
			}
			const empDinnerTimes = [];
			_.forEach(this.employee.dinnerTime, (item) => {
				const pushData = {
					startTime: item.startTime,
					endTime: item.endTime,
				}
				empDinnerTimes.push(pushData);
			})
			Object.assign(data, { campaignDinnerTimes: empDinnerTimes});
			this.registerCampaign = data;
		},

		async doSave() {
			const res = await apiCalendarRegisterCampaign(this.registerCampaign);
			if (res.isSuccess == true) {
				this.setMessageBar({
					type: messageType.SUCCESS,
					message: '已成功報名活動'
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

		onOverTimeConfirm(overTimeType) {
			this.isApplyConfirm = false;
			this.handleDataSaveData(overTimeType);
		},

		onCancel() {
			this.$emit('emitCancel');
		}
	},
	watch: {
		registerCampaign() {
			this.doSave();
		}
	}
}
</script>