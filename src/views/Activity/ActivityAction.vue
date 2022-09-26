<template lang="pug">
.activity-apply
	v-card.activity-apply_content.pb-10(tile)
		v-toolbar(dark color='lightPrimary')
			v-btn(icon dark @click='onCancel')
				v-icon mdi-close
			v-toolbar-title.text-h5.font-weight-bold {{ pageTitle }}
		v-card.ma-12.pa-4(color='grey lighten-3' flat)
			v-form(ref='form' v-model='valid' @submit.native.prevent='')
				v-row(no-gutters)
					span.mr-2.mt-2.mt-xl-1
						span.red--text *
						span 活動名稱：
					v-text-field(v-model='campaignObj.campaignName' height='30' background-color='white' dense solo flat :readonly='viewMode' :rules='campaignNameRules' required)
				v-card.pa-4.mb-5(outline flat v-for='(item, index) in campaignObj.campaignDetails' :key='index')
					v-row
						v-col(cols='12')
							v-row(no-gutters)
								v-col.mt-2.mt-xl-1(cols='auto')
									span.red--text *
									span 活動日期：
								v-col(cols='4')
									v-menu(v-if='!viewMode' v-model='item.campaignDateMenu' :close-on-content-click='false' transition='scale-transition' offset-y max-width='290px' min-width='auto' :disabled='pastCampaignDate(item.campaignDate)')
										template(v-slot:activator='{ on, attrs }')
											v-text-field(v-model='item.campaignDate' persistent-hint v-bind='attrs' v-on='on' height='30' dense filled flat :readonly='pastCampaignDate(item.campaignDate)' :rules='campaignDateRules')
										v-date-picker(v-model='item.campaignDate' no-title @input='onSelectCampaignDate(item)' :min="!viewMode ? today:''")
									v-text-field(v-else v-model='item.campaignDate' persistent-hint height='30' dense filled flat hide-details :readonly='viewMode')
								v-col.ml-auto.text-right(cols='1')
									v-btn(v-if='!viewMode && futureCampaignDate(item.campaignDate)' icon color='red' @click='onDeleteActivity(index)')
										v-icon(size='30') mdi-close-circle-outline
					v-divider.mb-4
					v-row(no-gutters)
						v-col(cols='6')
							v-row.align-center
								v-col.d-flex.align-center(cols='auto')
									span 活動時間：
								v-col(cols='4')
									v-sheet.px-1(color='#0000000f' v-if='!viewMode' rounded)
										v-row(no-gutters)
											v-col(cols='6')
												v-select(v-model='item.timeMenu.startTimeHour' :items='item.timeMenu.hourList' item-value='value' item-text='value' :disabled='pastCampaignDate(item.campaignDate)' hide-details solo background-color='transparent' flat height='40' @change='changeHourMinute(item)')
											v-col(cols='6')
												v-select(v-model='item.timeMenu.startTimeMinute' :items='item.timeMenu.minuteList' item-value='value' item-text='value' :disabled='pastCampaignDate(item.campaignDate)' hide-details solo background-color='transparent' flat height='40' @change='changeHourMinute(item)')
									v-text-field(v-else v-model='item.startTime' dense filled flat hide-details :readonly='viewMode')
								v-col(cols='auto')
									span 至
								v-col(cols='4')
									v-sheet.px-1(color='#0000000f' v-if='!viewMode' rounded)
										v-row(no-gutters)
											v-col(cols='6')
												v-select(v-model='item.timeMenu.endTimeHour' :items='item.timeMenu.hourList' item-value='value' item-text='value' :disabled='pastCampaignDate(item.campaignDate)' hide-details solo background-color='transparent' flat height='40' @change='changeHourMinute(item)')
											v-col(cols='6')
												v-select(v-model='item.timeMenu.endTimeMinute' :items='item.timeMenu.minuteList' item-value='value' item-text='value' :disabled='pastCampaignDate(item.campaignDate)' hide-details solo background-color='transparent' flat height='40' @change='changeHourMinute(item)')
									v-text-field(v-else v-model='item.endTime' dense filled flat hide-details :readonly='viewMode')
						v-col(cols='6')
							v-row.align-center(v-for='(subItem, subIndex) in item.campaignDinnerTimes' :key='subIndex')
								v-col.d-flex.align-center(cols='auto')
									span 用餐時間：
								v-col(cols='4')
									v-sheet.px-1(color='#0000000f' v-if='!viewMode' rounded)
										v-row(no-gutters)
											v-col(cols='6')
												v-select(v-model='subItem.timeMenu.startTimeHour' :items='subItem.timeMenu.hourList' item-value='value' item-text='value' :disabled='pastCampaignDate(item.campaignDate)' hide-details solo background-color='transparent' flat height='40' @change='changeHourMinute(item)')
											v-col(cols='6')
												v-select(v-model='subItem.timeMenu.startTimeMinute' :items='subItem.timeMenu.minuteList' item-value='value' item-text='value' :disabled='pastCampaignDate(item.campaignDate)' hide-details solo background-color='transparent' flat height='40' @change='changeHourMinute(item)')
									v-text-field(v-else v-model='subItem.startTime' dense filled flat hide-details :readonly='viewMode')
								v-col(cols='auto')
									span 至
								v-col(cols='4')
									v-sheet.px-1(color='#0000000f' v-if='!viewMode' rounded)
										v-row(no-gutters)
											v-col(cols='6')
												v-select(v-model='subItem.timeMenu.endTimeHour' :items='subItem.timeMenu.hourList' item-value='value' item-text='value' :disabled='pastCampaignDate(item.campaignDate)' hide-details solo background-color='transparent' flat height='40' @change='changeHourMinute(item)')
											v-col(cols='6')
												v-select(v-model='subItem.timeMenu.endTimeMinute' :items='subItem.timeMenu.minuteList' item-value='value' item-text='value' :disabled='pastCampaignDate(item.campaignDate)' hide-details solo background-color='transparent' flat height='40' @change='changeHourMinute(item)')
									v-text-field(v-else v-model='subItem.endTime' dense filled flat hide-details :readonly='viewMode')
								v-col.d-flex.align-center(cols='1' v-if='!viewMode && futureCampaignDate(item.campaignDate)')
									v-btn(v-if='subIndex >= 1' icon @click='onRemoveCampaignDinnerTimes(index, subIndex)')
										v-icon(size='30') mdi-minus-circle-outline
									v-btn(v-if='subItem.startTime && subItem.endTime' icon @click='onAddCampaignDinnerTimes(index)')
										v-icon(size='30') mdi-plus-circle-outline
							.red--text.text-caption.mt-4 *建議用餐時間可設置為：12:00-13:00、18:00-19:00
						v-col.mt-1(cols='12') 活動時間共計 #[span(:class='getTotalHourOver(item.totalHour)') {{ item.totalHour }}] 小時
				v-btn(v-if='!viewMode' @click='onAddActivity' color='primary' depressed) 新增活動日期
				v-row.mt-4(no-gutters)
					span.mr-2.mt-2.mt-xl-1
						span.red--text *
						span 活動地點：
					v-text-field(v-model='campaignObj.locationName' height='30' background-color='white' dense solo flat :readonly='viewMode' :rules='campaignLocationRules')
				v-row.align-center.mt-0
					v-col(cols='1')
						span 活動地址：
					v-col(cols='2')
						v-select(v-model='campaignObj.city' :items='cityList' item-text='city' item-value='city' background-color='white' label='選擇城市' dense solo flat hide-details :readonly='viewMode' @change='getAreaList')
					v-col(cols='2')
						v-select(v-model='campaignObj.area' :items='areaList' background-color='white' label='選擇區域' dense solo flat hide-details :readonly='viewMode')
					v-col(cols='7')
						v-text-field(v-model='campaignObj.address' height='30' background-color='white' dense solo flat hide-details :readonly='viewMode')
				v-row.mt-4
					v-col.mt-2.mt-xl-1(cols='1')
						span.red--text *
						span 活動附件：
					v-col(cols='4' v-if='!viewMode')
						v-file-input(v-model='file' prepend-icon='mdi-paperclip' background-color='white' label='上傳附件' height='35' dense solo flat clearable :rules='campaignFileRules' @change='onUploadFile')
					v-col.mt-n5(cols='12')
						v-card.pa-2(v-if='!viewMode' background-color='white' width='100%' flat min-height='45' )
							v-chip.ma-1(v-for='(item, index) in campaignObj.campaignAttachments' :key='index' color='primary' small label close @click:close='onRemoveFile(index)') {{ item.fileName }}
						v-card.pa-2(v-else background-color='white' width='100%' flat min-height='45' )
							v-btn.ma-1(v-for='(item, index) in campaignObj.campaignAttachments' :key='index' :href='item.filePath' color='primary' target='_blank' dense depressed small height='30' :download='item.fileName') {{ item.fileName }}

				v-row.align-center.mt-4
					v-col(cols='1')
						span 建議與會者：
					v-col(cols='2')
						v-select(v-model='selectDept' :items='depts' item-value='id' item-text='deptName' label='選擇單位' background-color='white' dense solo flat hide-details :readonly='viewMode' @change='getAttendeesList')
					v-col(cols='2')
						v-select(v-model='selectAttendee' :items='attendeesList' item-value='id' item-text='empName' label='選擇同仁' background-color='white' dense solo flat hide-details :readonly='viewMode' return-object)
					v-col(cols='2')
						v-btn(v-if='!viewMode' color='primary' depressed @click='onAddAttendee' :disabled='addAttendeeDisabled') 增加
				v-row.align-center
					v-col(cols='12')
						v-card.pa-2(background-color='white' width='100%' flat min-height='45' )
							v-chip.ma-2(v-for='(item, index) in campaignObj.attendees' :key='index' color='primary' @click:close='onRemoveAttendee(index)' close :readonly='viewMode') {{ getAttendeeName(item) }}
				div.mt-5 活動說明：
				v-card.mt-2.mb-5(background-color='white' width='100%' flat min-height='45')
					vue-editor(v-if='!viewMode' v-model='campaignObj.description')
					v-card.pa-4.mt-2(v-else color='white' flat v-html='campaignObj.description')
		v-card-actions.pb-4.pt-0(v-if='!viewMode')
			v-row.justify-center
				v-col(cols='2')
					v-btn(@click='onCancel' color='danger' outlined width='100%' height='50')
						span(v-if='addMode') 放棄建立
						span(v-if='editMode') 放棄修改
				v-col(cols='2')
					v-btn(@click='onConfirm' color='primary' depressed width='100%' height='50' :disabled='confirmDisabled')
						span(v-if='addMode') 建立活動
						span(v-if='editMode') 確認修改
	v-dialog(v-model='isApplyConfirm' overlay-opacity='0.6' max-width='400' persistent no-click-animation)
		apply-confirm(v-if='isApplyConfirm'  @emitConfirm='onApplyConfirm'  @emitCancel='isApplyConfirm = false' :is-edit-work='editMode' :is-over-time='overTime')
</template>

<script>
import _ from 'lodash';
import {
	VueEditor
} from "vue2-editor";
import {
	mapActions
} from 'vuex';
import moment from 'moment';
import {
	messageType
} from "@/utils/constant";
import {
	apiCampaignContent,
	apiCampaignAttachment,
	apiCampaignAdd,
	apiCampaignUpdate,
	apiGetCampaignConfig
} from "@/api/api";
import ApplyConfirm from './ApplyConfirm.vue';
import taiwanArea from './../../assets/data/TaiwanArea.json'

export default {
	props: {
		toWork: {
			type: String,
			require: true
		},
		campaignId: {
			type: String,
			require: true
		},
	},
	components: {
		ApplyConfirm,
		VueEditor
	},
	data() {
		return {
			valid: false,
			cityList: taiwanArea,
			areaList: [],
			isApplyConfirm: false,
			campaignNameRules: [(v) => !!v || '活動名稱為必填資料'],
			campaignDateRules: [(v) => !!v || '活動日期為必填資料'],
			campaignLocationRules: [(v) => !!v || '活動地點為必填資料'],
			//-
			pageTitle: '',
			today: moment().format('YYYY-MM-DD'),
			campaignObj: {
				id: '',
				campaignName: '',
				locationName: '',
				city: '',
				area: '',
				address: '',
				description: '',
				campaignDetails: [{
					campaignDateMenu: false,
					campaignDate: moment().format('YYYY-MM-DD'),
					startTime: '09:00',
					endTime: '09:00',
					timeMenu: {
						startTimeHour: '00',
						startTimeMinute: '00',
						endTimeHour: '00',
						endTimeMinute: '00',
						hourList: [],
						minuteList: [],
					},
					campaignDinnerTimes: [{
						startTime: '09:00',
						endTime: '09:00',
						timeMenu: {
							startTimeHour: '00',
							startTimeMinute: '00',
							endTimeHour: '00',
							endTimeMinute: '00',
							hourList: [],
							minuteList: [],
						},
					}, ],
					totalHour: 0,
					empStartTime: '09:00',
					empEndTime: '09:00',
					empCampaignDinnerTimes: [{
						startTime: '09:00',
						endTime: '09:00'
					}],
					empTotalHour: 0
				}],
				campaignAttachments: [],
				attendees: []
			},
			changeCampaignObj: {},
			file: null,
			depts: [],
			selectDept: '',
			selectAttendee: '',
			currentAttendees: [],
			attendeesList: [],
			overTime: false,
			repeatDate: false,
			overTime12Hour: false,
			hourList: [],
			minuteList: []
		}
	},
	computed: {
		addMode() {
			return this.toWork == 'Add' ? true : false;
		},
		editMode() {
			return this.toWork == 'Edit' ? true : false;
		},
		viewMode() {
			return this.toWork == 'View' ? true : false;
		},
		addAttendeeDisabled() {
			return !this.selectAttendee ? true : false;
		},
		addFileDisabled() {
			return _.isEmpty(this.file) ? true : false;
		},
		confirmDisabled() {
			let disabled = false;
			if (this.overTime12Hour == true || this.repeatDate == true || this.overTime12Hour == true && this.repeatDate == true) {
				disabled = true
			}
			return disabled;
		},
		campaignFileRules() {
			if(this.campaignObj.campaignAttachments <= 0) {
				return [(v) => !!v || '活動附件為必填資料']
			} else {
				return []
			}
		}
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapActions(['setLoading', 'setMessageBar']),

		async init() {
			this.getTitle();
			this.getHourMinuteList();
			await this.getCampaignOptions();
			await this.getData();
			this.getAreaList();
		},

		getHourMinuteList() {
			const totalHour = 24;
			const totalMinute = 60;
			for (let h = 0; h < totalHour; h++) {
				let value = '';
				if (_.inRange(h, 10)) {
					value = '0' + _.toString(h);
				} else {
					value = _.toString(h);
				}
				this.hourList.push({ value });
			}
			for (let m = 0; m < totalMinute; m++) {
				let value = '';
				if (_.inRange(m, 10)) {
					value = '0' + _.toString(m);
				} else {
					value = _.toString(m);
				}
				this.minuteList.push({ value });
			}
			if (this.addMode) {
				this.campaignObj.campaignDetails[0].timeMenu.hourList = JSON.parse(JSON.stringify(this.hourList));
				this.campaignObj.campaignDetails[0].timeMenu.minuteList = JSON.parse(JSON.stringify(this.minuteList));
				this.campaignObj.campaignDetails[0].campaignDinnerTimes[0].timeMenu.hourList = JSON.parse(JSON.stringify(this.hourList));
				this.campaignObj.campaignDetails[0].campaignDinnerTimes[0].timeMenu.minuteList = JSON.parse(JSON.stringify(this.minuteList));
			}
		},

		getTitle() {
			if (this.addMode) {
				this.pageTitle = '新增活動';
			} else if (this.editMode) {
				this.pageTitle = '編輯活動';
			} else {
				this.pageTitle = '檢視活動';
			}
		},

		getAreaList() {
			if (!_.isEmpty(this.campaignObj.city)) {
				this.areaList = _.find(this.cityList, {
					'city': this.campaignObj.city
				}).area;
			}
		},

		async getCampaignOptions() {
			const res = await apiGetCampaignConfig();
			if (res.isSuccess === true) {
				this.depts = res.data.depts;
				this.attendees = res.data.attendees;
			}
		},

		async getData() {
			if (this.editMode || this.viewMode) {
				const res = await apiCampaignContent(this.campaignId);
				if (res.isSuccess === true) {
					const data = res.data;
					this.handleData(data);
				}
			}
		},

		handleData(data) {
			_.forEach(data.campaignDetails, (item) => {
				const timeMenu = {
					startTimeHour: item.startTime.slice(0, 2),
					startTimeMinute: item.startTime.slice(3, 5),
					endTimeHour: item.endTime.slice(0, 2),
					endTimeMinute: item.endTime.slice(3, 5),
					hourList: JSON.parse(JSON.stringify(this.hourList)),
					minuteList: JSON.parse(JSON.stringify(this.minuteList)),
				}
				Object.assign(item, {
					campaignDateMenu: false,
					timeMenu
				});
				_.forEach(item.campaignDinnerTimes, (subItem) => {
					const dinnerTimeMenu = {
						startTimeHour:subItem.startTime.slice(0, 2),
						startTimeMinute: subItem.startTime.slice(3, 5),
						endTimeHour: subItem.endTime.slice(0, 2),
						endTimeMinute: subItem.endTime.slice(3, 5),
						hourList: JSON.parse(JSON.stringify(this.hourList)),
						minuteList: JSON.parse(JSON.stringify(this.minuteList)),
					}
					Object.assign(subItem, {
						timeMenu: dinnerTimeMenu
					});
				})
			});
			_.forEach(data.attendees, (item) => {
				const attendeeObj = _.find(this.attendees, {
					'id': item
				});
				this.currentAttendees.push(attendeeObj);
			});
			this.campaignObj = data;
		},

		onSelectCampaignDate(data) {
			data.campaignDateMenu = false;
			this.handleSelectCampaignDates();
		},

		handleSelectCampaignDates() {
			this.repeatDate = false;
			const selectCampaignDates = [];
			_.forEach(this.campaignObj.campaignDetails, (item) => {
				selectCampaignDates.push(item.campaignDate);
			});
			//- 過濾掉重複的日期後的數量
			const uniqDateLen = _.uniq(selectCampaignDates).length;
			const campaignDetailsLen = this.campaignObj.campaignDetails.length;
			if (uniqDateLen != campaignDetailsLen) {
				this.repeatDate = true;
				this.setMessageBar({
					type: messageType.WARNING,
					message: '請勿選擇重複的日期，請確認！'
				});
			}
		},

		onAddActivity() {
			const addItem = {
				campaignDateMenu: false,
				campaignDate: moment().add(1, 'days').format('YYYY-MM-DD'),
				startTime: '09:00',
				endTime: '09:00',
				timeMenu: {
					startTimeHour: '00',
					startTimeMinute: '00',
					endTimeHour: '00',
					endTimeMinute: '00',
					hourList: JSON.parse(JSON.stringify(this.hourList)),
					minuteList: JSON.parse(JSON.stringify(this.minuteList)),
				},
				campaignDinnerTimes: [{
					startTime: '09:00',
					endTime: '09:00',
					timeMenu: {
						startTimeHour: '00',
						startTimeMinute: '00',
						endTimeHour: '00',
						endTimeMinute: '00',
						hourList: JSON.parse(JSON.stringify(this.hourList)),
						minuteList: JSON.parse(JSON.stringify(this.minuteList)),
					}
				}],
				totalHour: 0,
				empStartTime: '09:00',
				empEndTime: '09:00',
				empCampaignDinnerTimes: [{
					startTime: '09:00',
					endTime: '09:00',
				}],
				empTotalHour: 0
			};
			this.campaignObj.campaignDetails.push(addItem);
			this.handleSelectCampaignDates();
		},
		onDeleteActivity(index) {
			this.campaignObj.campaignDetails.splice(index, 1);
			this.handleSelectCampaignDates();
		},
		onAddCampaignDinnerTimes(index) {
			const addItem = {
				startTime: '',
				endTime: '',
				timeMenu: {
					startTimeHour: '00',
					startTimeMinute: '00',
					endTimeHour: '00',
					endTimeMinute: '00',
					hourList: JSON.parse(JSON.stringify(this.hourList)),
					minuteList: JSON.parse(JSON.stringify(this.minuteList)),
				},
			}
			this.campaignObj.campaignDetails[index].campaignDinnerTimes.push(addItem);
		},
		onRemoveCampaignDinnerTimes(index, subIndex) {
			if (subIndex != 0) {
				this.campaignObj.campaignDetails[index].campaignDinnerTimes.splice(subIndex, 1);
			}
		},
		changeHourMinute(data) {
			data.startTime = data.timeMenu.startTimeHour +':'+ data.timeMenu.startTimeMinute;
			data.endTime = data.timeMenu.endTimeHour +':'+ data.timeMenu.endTimeMinute;
			_.forEach(data.campaignDinnerTimes, (item) => {
				item.startTime = item.timeMenu.startTimeHour +':'+ item.timeMenu.startTimeMinute;
				item.endTime = item.timeMenu.endTimeHour +':'+ item.timeMenu.endTimeMinute;
			})
			setTimeout(() => { this.getTotalHour(data); }, 0);
		},
		getTotalHour(data) {
			setTimeout(() => { this.getOverTime12Hour(); }, 0);
			let campaignHour = this.getHour(data);
			let dinnerTotalHour = 0;
			_.forEach(data.campaignDinnerTimes, (item) => {
				const dinnerHour = this.getHour(item);
				dinnerTotalHour = dinnerTotalHour + dinnerHour;
			})
			if(dinnerTotalHour < 0) {
				dinnerTotalHour = 0;
			}
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
			data.totalHour = finallyTotalHour;
			return finallyTotalHour;
		},
		getHour(item) {
			let startTime = moment(item.startTime, "HH:mm a");
			let endTime = moment(item.endTime, "HH:mm a");
			let duration = moment.duration(endTime.diff(startTime));
			let hours = duration.asHours();
			return hours;
		},
		getTotalHourOver(totalHour) {
			return totalHour > 8 ? 'orange--text' : 'red--text';
		},

		getOverTime12Hour() {
			this.overTime12Hour = !_.isUndefined(_.find(this.campaignObj.campaignDetails, function (o) {
				return o.totalHour > 12;
			}));
			if (this.overTime12Hour) {
				this.setMessageBar({
					type: messageType.WARNING,
					message: '活動總時數已超過12小時，請確認！'
				});
			}
		},

		async onUploadFile() {
			if(!_.isNull(this.file)) {
				const data = {
					type: 'Campaign',
					file: this.file,
				}
				const res = await apiCampaignAttachment(data);
				if (res.isSuccess === true) {
					const addFile = {
						fileName: res.data.fileName,
						filePath: res.data.filePath
					}
					setTimeout(this.campaignObj.campaignAttachments.push(addFile), 0);
				} else {
					this.setMessageBar({
						message: '匯入檔案有誤，請重新確認',
						type: messageType.WARNING,
					});
				}
				this.file = null;
			}
		},
		onRemoveFile(index) {
			this.campaignObj.campaignAttachments.splice(index, 1);
		},
		getAttendeesList() {
			this.attendeesList = [];
			const deptObj = _.find(this.depts, {
				'id': this.selectDept
			});
			const currentAttendeesID = _.map(this.currentAttendees, 'id');
			if (!_.isEmpty(currentAttendeesID)) {
				_.forEach(deptObj.employees, (item) => {
					if (!_.includes(currentAttendeesID, item.id)) {
						this.attendeesList.push(item);
					}
				});
			} else {
				_.forEach(deptObj.employees, (item) => {
					this.attendeesList.push(item);
				});
			}
		},
		getAttendeeName(item) {
			return _.find(this.attendees, {
				'id': item
			}).empName;
		},
		onAddAttendee() {
			const selectIndex = _.findIndex(this.attendeesList, {
				'id': this.selectAttendee.id
			});
			this.attendeesList.splice(selectIndex, 1);
			this.currentAttendees.push(this.selectAttendee);
			this.campaignObj.attendees.push(this.selectAttendee.id);
			this.selectAttendee = '';
		},
		async onRemoveAttendee(index) {
			this.currentAttendees.splice(index, 1);
			this.campaignObj.attendees.splice(index, 1);
			this.getAttendeesList();
		},
		onConfirm() {
			this.valid = this.$refs.form.validate();
			this.overTime = !_.isUndefined(_.find(this.campaignObj.campaignDetails, function (o) {
				return o.totalHour > 8;
			}));
			if (this.valid) {
				this.handleSaveData();
				this.isApplyConfirm = true;
			}
		},
		async onApplyConfirm() {
			this.isApplyConfirm = false;
			if (this.editMode) {
				await this.doEdit();
			} else if (this.addMode) {
				await this.doCreate();
			}
		},
		handleSaveData() {
			const data = JSON.parse(JSON.stringify(this.campaignObj));
			_.forEach(data.campaignDetails, (item) => {
				item.empCampaignDinnerTimes = '';
				item.empEndTime = '';
				item.empStartTime = '';
				item.empTotalHour = 0;
				item.empCampaignDinnerTimes = [{
					startTime: '',
					endTime: ''
				}]
				delete item.campaignDateMenu;
				delete item.timeMenu;
				_.forEach(item.campaignDinnerTimes, (subItem) => {
					delete subItem.timeMenu;
				})
			});
			delete data.createUserId;
			delete data.campaignLeaveDate;
			delete data.campaignOverTimeCompensationType;
			delete data.employeeCampaignId;
			this.changeCampaignObj = data;
		},
		async doEdit() {
			const res = await apiCampaignUpdate(this.changeCampaignObj);
			if (res.isSuccess == true) {
				this.setMessageBar({
					type: messageType.SUCCESS,
					message: '已成功修改活動'
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
			const res = await apiCampaignAdd(this.changeCampaignObj);
			if (res.isSuccess == true) {
				this.setMessageBar({
					type: messageType.SUCCESS,
					message: '已成功新增活動'
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
		},
		futureCampaignDate(date) {
			return moment(this.today).isSameOrBefore(date, 'day');
		},
		pastCampaignDate(date) {
			return moment(date).isBefore(this.today, 'day');
		},
	},
}
</script>
