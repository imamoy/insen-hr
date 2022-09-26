<template lang="pug">
.calendar
	.calendar-row.py-4(v-for='(item, index) in calendarLists' :key='index')
		v-sheet
			v-calendar(color='primary' type='custom-weekly' min-weeks='2' :start='item.startDate' :end='item.endDate' :events='getEvents(item)' event-start='campaignDate' event-end='campaignDate' event-color='transparent' :weekdays='weekdays')
				template(v-slot:day-label='{ month, day, present }')
					div(:class="present ? 'primary--text font-weight-bold':''")
						span(v-if='day === 1') {{ month }}
						span.mx-1.line(v-if='day === 1') /
						span {{ day }}
				template(v-slot:day='{ date, past }')
					v-card.calendar-day(:color='getDateBgColor(item, date, past)' width='100%' height='100%' flat outlined)
						v-chip.calendar-day_dateType(v-if='dateTypeDisplay(item, date)' :color='getDateTypeColor(item, date)' dark) {{ getDateTypeName(item, date) }}
						v-chip.cancel-text(v-if="showCancelText(item, date)" color="red" outlined dark width='100%') {{ getCancelText(item, date) }}
						span.calendar-day_overTime.orange--text(v-if='overTimeTypeDisplay(item, date)') {{ getOverTimeTypeName(item, date) }}
						span.calendar-day_work-hours(v-if='getWorkHour(item, date) > 0') 上班時數：#[span.mx-1(:class="getWorkHour(item, date) > 8 ? 'orange--text darken-4':''") {{ getWorkHour(item, date) }}]小時
				template(v-slot:event='{ event }')
					v-chip(:color="event.isRegistered ? 'danger' : 'gold'" :outlined='!event.isRegistered' :dark='event.isRegistered' @click='clickEvent(event, event.campaignLeaveDateOptions)') {{ event.campaignName }}
			.text-right.mt-1 合計上班時數：#[span.mx-1(:class="item.totalWorkHours > 80 ? 'orange--text darken-4':''") {{ item.totalWorkHours }}]小時
</template>
<script>
import _ from 'lodash';
import moment from 'moment';

export default {
	props: {
		calendarData: {
			type: Object,
			required: true
		}
	},
	data: () => ({
		value: '',
		dragEvent: null,
		dragStart: null,
		extendOriginal: null,
		//
		weekdays: [
			1,
			2,
			3,
			4,
			5,
			6,
			0,
		],
		events: [
			{
				name: '重症醫學研討會',
				start: '2022-05-14',
				end: '2022-05-14',
			},
			{
				name: 'POA會議',
				start: '2022-05-18 09:00',
				end: '2022-05-18 10:00',
			},
			{
				name: '重症醫學研討會',
				start: '2022-05-25 09:00',
				end: '2022-05-25 10:00',
			},
			{
				name: 'POA會議',
				start: '2022-05-28 09:00',
				end: '2022-05-28 10:00',
			},
		],
	}),
	computed: {
		calendarLists() {
			return _.sortBy(this.calendarData.employeeCalendarWorkBlocks, 'startDate');
		}
	},
	mounted() {
		this.lastEventAddClass();
	},
	updated() {
		this.lastEventAddClass();
	},
	methods: {
		// 每日的最後一個活動要加class，才能往下生長不被文字疊到
		lastEventAddClass() {
			const weeklyDay = document.querySelectorAll('.v-calendar-weekly__day');
			weeklyDay.forEach(item => {
				const event = item.querySelectorAll('.v-event');
				event.forEach((item, idx) => {
					if(idx === event.length - 1) {
						item.classList.add('lastEventStyle')
					}
				})
			})
		},
		getEvents(data) {
			const eventsData = [];
			_.forEach(data.employeeCalendarWorkDates, (item) => {
				_.forEach(item.employeeCalendarCampaigns, (subItem) => {
					eventsData.push({
						...subItem,
						campaignLeaveDateOptions: item.campaignLeaveDateOptions
					});
				});
			});
			return eventsData;
		},
		//- 取得顯示資料
		getDateBgColor(data, date, past) {
			const blockDate = data.employeeCalendarWorkDates;
			const dateBg = _.find(blockDate, { 'calendarDate': date }).dateBackgroubdColor;
			// const canceledCampaignDate = _.find(blockDate, { 'calendarDate': date }).canceledCampaignDate;
			const isCampaignLeaveDateUsed = _.find(blockDate, { 'calendarDate': date }).isCampaignLeaveDateUsed;
			let bgColor = '';
			if (isCampaignLeaveDateUsed) {
				bgColor = dateBg+'20';
			} else if (past) {
				bgColor = '#D5DCE370';
			} else if (!_.isEmpty(dateBg)) {
				bgColor = dateBg+'20';
			}
			return bgColor
		},
		dateTypeDisplay(data, date) {
			const blockDate = data.employeeCalendarWorkDates;
			const dateType =  _.find(blockDate, { 'calendarDate': date }).dateType;
			const dateComment =  _.find(blockDate, { 'calendarDate': date }).dateComment;

			return (dateComment && dateType != 'Work') ? true : false;
		},
		getDateTypeName(data, date) {
			const blockDate = data.employeeCalendarWorkDates;
			return _.find(blockDate, { 'calendarDate': date }).dateComment;
		},
		getDateTypeColor(data, date) {
			const blockDate = data.employeeCalendarWorkDates;
			const dateCommentBackgroubdColor = _.find(blockDate, { 'calendarDate': date }).dateCommentBackgroubdColor;
			return dateCommentBackgroubdColor || '#003B7C';
		},
		overTimeTypeDisplay(data, date) {
			const blockDate = data.employeeCalendarWorkDates;
			return !_.isEmpty(_.find(blockDate, { 'calendarDate': date }).campaignOverTimeCompensationType);
		},
		getOverTimeTypeName(data, date) {
			const blockDate = data.employeeCalendarWorkDates;
			return _.find(blockDate, { 'calendarDate': date }).campaignOverTimeCompensationTypeName;
		},
		getWorkHour(data, date) {
			const blockDate = data.employeeCalendarWorkDates;
			return _.find(blockDate, { 'calendarDate': date }).workHour;
		},
		clickEvent(event, campaignLeaveDateOptions) {
			const calendarYear = this.calendarData.calendarYear;
			const calendarMonth = this.calendarData.calendarMonth;
			const employeeCalendarId = this.calendarData.employeeCalendarId;
			const employeeId = this.calendarData.employeeId;
			const employeeCalendarCompensationTypes = this.calendarData.employeeCalendarCompensationTypes;
			Object.assign(event, { calendarYear, calendarMonth, employeeId, employeeCalendarId, campaignLeaveDateOptions, employeeCalendarCompensationTypes })
			this.$emit('emitClickEvent', event);
		},
		showCancelText(data, date) {
			const blockDate = data.employeeCalendarWorkDates;
			const isCampaignLeaveDateUsed = _.find(blockDate, { 'calendarDate': date }).isCampaignLeaveDateUsed;
			return !!isCampaignLeaveDateUsed;
		},
		getCancelText(data, date) {
			const blockDate = data.employeeCalendarWorkDates;
			const isCampaignLeaveDateUsed = _.find(blockDate, { 'calendarDate': date }).isCampaignLeaveDateUsed;
			const canceledCampaignDate = _.find(blockDate, { 'calendarDate': date }).canceledCampaignDate;
			const canceledDate = moment(new Date(canceledCampaignDate)).format('YYYY.MM.DD');
			if(isCampaignLeaveDateUsed) {
				return canceledDate + '活動取消';
			}
		}
	},
}
</script>