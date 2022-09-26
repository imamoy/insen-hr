<template lang="pug">
.page.fill-height.py-10
	v-card.d-flex.flex-column.justify-space-between.fill-height.mx-auto(color='transparent' max-width='1800' flat)
		v-card-text
			.secondary--text.text-h4.font-weight-bold.text-center.mb-12 班表結算設定
			v-row.justify-start.mb-4
				v-col(cols='auto')
					.text-h6.text-no-wrap.py-2 設定年份：
				v-col(cols='4')
					v-select(v-model='year' :items='yearList' required background-color='white' solo hide-details rounded flat @change='getCheckoutByYearList')
			v-form(ref='form' v-model='valid' @submit.native.prevent='')
				v-row.justify-start.mb-4(v-for='(item, index) in checkoutDateLists' :key='index')
					v-col.d-flex(cols='9')
						.text-h6.text-no-wrap.py-2 {{ item.sysMonth }}月班表區間：
						v-select(v-model='item.sysCheckOutDateRangeSelected[0]' :items='sysCheckOutDateRanges' item-disabled='disabled' item-value='id' required background-color='white' solo hide-details rounded flat :rule='sysCheckOutDateRangesRule' :disabled='item.sysYear <= currentYear && item.sysMonth < currentMonth' @change='checkSelectRange(item, index, item.sysCheckOutDateRangeSelected[0], 0)' style="width: 42%;" clearable)
							template(v-slot:selection='data')
								div(v-bind='data.attrs' :value='data.selected') 區間({{ data.item.startDate }}-{{ data.item.endDate }})
							template(v-slot:item='data')
								div(v-bind='data.attrs' :value='data.selected') 區間({{ data.item.startDate }}-{{ data.item.endDate }})
						.text-h6.text-no-wrap.py-2.mx-2 至
						v-select(v-model='item.sysCheckOutDateRangeSelected[1]' :items='sysCheckOutDateRanges' item-disabled='disabled' item-value='id' required background-color='white' solo hide-details rounded flat :rule='sysCheckOutDateRangesRule' :disabled='item.sysYear <= currentYear && item.sysMonth < currentMonth' @change='checkSelectRange(item, index, item.sysCheckOutDateRangeSelected[1], 1)' style="width: 42%;" clearable)
							template(v-slot:selection='data')
								div(v-bind='data.attrs' :value='data.selected') 區間({{ data.item.startDate }}-{{ data.item.endDate }})
							template(v-slot:item='data')
								div(v-bind='data.attrs' :value='data.selected') 區間({{ data.item.startDate }}-{{ data.item.endDate }})
					v-col.d-flex(cols='3')
						span.text-h6.text-no-wrap.py-2 班表結算日：
						v-menu(ref='menu1' v-model='item.checkOutDateMenu' :close-on-content-click='false' transition='scale-transition' offset-y min-width='auto' left)
							template(v-slot:activator='{ on, attrs }')
								v-text-field(v-model='item.checkOutDate' label='Date' prepend-inner-icon='mdi-calendar' v-bind='attrs' v-on='on' solo hide-details rounded flat :disabled='item.sysYear <= currentYear && item.sysMonth < currentMonth')
							v-date-picker(v-model='item.checkOutDate' no-title @input="item.checkOutDateMenu = false")
		v-card-actions
			v-row.justify-center
				v-col(cols='2')
					v-btn(@click='' color='primary' outlined rounded width='100%' height='50') 取消
				v-col(cols='2')
					v-btn(@click='onSave' color='primary' depressed rounded width='100%' height='50') 設定
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import { mapActions } from 'vuex';
import { messageType } from "@/utils/constant";
import { apiSystemCheckoutDates, apiSystemCheckOutDateByYear, apiSystemSaveCheckoutDates } from "@/api/api";

export default {
	data() {
		return {
			valid: false,
			currentMonth: '',
			currentYear: '',
			year: null,
			yearCount: null,
			yearList: [],
			sysCheckOutDateRangesSelected: [],
			originSysCheckoutDateRanges: [],
			sysCheckOutDateRanges: [],
			sysCheckOutDateRangesRule: {
                Check(range1_id, range2_id) {
					return range1_id > range2_id || '區間必須照時間順序';
                },
			},
			checkoutDateLists: [],
			menu1_settlementMenu: false,
			menu1_settlementDate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
		};
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapActions(['setMessageBar']),

		async init() {
			this.getCurrentMonth();
			this.getCurrentYear();
			this.getYearLists();
			await this.getCheckoutDates();
			await this.getCheckoutByYearList();
		},
		getCurrentMonth() {
			const month = moment().format('MM');
			this.currentMonth = _.parseInt(month);
		},
		getCurrentYear() {
			const year = moment().format('YYYY');
			this.currentYear = _.parseInt(year);
		},
		getYearLists() {
			this.year = moment().year();
			const yearCount = this.year + 1;
			for(let year = this.year; year <= yearCount; year++) {
				this.yearList.push(year);
			}
		},
		async getCheckoutDates() {
			const year = _.toNumber(this.year);
			const res = await apiSystemCheckoutDates(year);
			if (res.isSuccess == true) {
				// const currentMonth = _.parseInt(moment().format('MM'));
				const data = [];
				_.forEach(res.data, (item) => {
					item.id = item.startDate + item.endDate;
					// if (item.sysMonth >= currentMonth || item.sysYear > this.currentYear) {
						data.push(item);
					// }
				});
				this.originSysCheckoutDateRanges = data;
			}
		},
		async getCheckoutByYearList() {
			const year = _.toNumber(this.year);
			const res = await apiSystemCheckOutDateByYear(year);
			if (res.isSuccess == true) {
				const data = res.data;
				_.forEach(data, (item) => {
					//- 物件中加入 checkOutDateMenu 用來開關 Data picker
					Object.assign(item, {checkOutDateMenu: false});
					//- 若是月份已選擇過區間，將選擇的id存入 sysCheckOutDateRangesSelected 之中，以方便過濾
					if (!_.isEmpty(item.sysCheckOutDateRanges)) {
						_.forEach(item.sysCheckOutDateRanges, (range) => { range.id = range.startDate + range.endDate; })
						Object.assign(item, {sysCheckOutDateRangeSelected: [item.sysCheckOutDateRanges[0].id, item.sysCheckOutDateRanges[item.sysCheckOutDateRanges.length - 1].id]});
						_.forEach(item.sysCheckOutDateRanges, (subItem) => {
							this.sysCheckOutDateRangesSelected.push(subItem.id)
						});
					} else {
						Object.assign(item, {sysCheckOutDateRangeSelected: []});
					}
					//- 結算日預設為前一個月15號
					item.checkOutDate = item.checkOutDate ? item.checkOutDate : moment(_.toString(item.sysYear) + '-' + _.toString(item.sysMonth) + '-' + '15').subtract(1,'months').format('YYYY-MM-DD');
				});
				this.checkoutDateLists = data;
				setTimeout(this.handleCheckOutDateRangesSelectLists(), 500);
			}
		},
		handleCheckOutDateRangesSelectLists() {
			//- 過濾已選擇區間及過去的區間->使選項Disabled
			const data = this.originSysCheckoutDateRanges;
			// const max = _.max(this.sysCheckOutDateRangesSelected);
			_.forEach(data, (item) => {
				if (!_.isEmpty(this.sysCheckOutDateRangesSelected) && _.find(this.sysCheckOutDateRangesSelected, (s) => { return s == item.id })) {
					Object.assign(item, {disabled: true});
				} else {
					Object.assign(item, {disabled: false});
				}
				item.id = item.startDate + item.endDate;
			});
			this.sysCheckOutDateRanges = data;
		},
		resetSysCheckOutDateRanges() {
			//- 重新撈取已選擇的區間ID存入，sysCheckOutDateRangesSelected 之中，以方便過濾
			this.sysCheckOutDateRangesSelected = [];
			_.forEach(this.checkoutDateLists, (item) => {
				const startIdx = _.findIndex(this.sysCheckOutDateRanges, { id: item.sysCheckOutDateRangeSelected[0] });
				const endIdx = _.findIndex(this.sysCheckOutDateRanges, { id: item.sysCheckOutDateRangeSelected[1] });
				if (startIdx >= 0 && endIdx >= startIdx) {
					for(let i = startIdx; i <= endIdx; i++) {
						this.sysCheckOutDateRangesSelected.push(this.sysCheckOutDateRanges[i].id);
					}
				}
				else if (startIdx >= 0){
					this.sysCheckOutDateRangesSelected.push(this.sysCheckOutDateRanges[startIdx].id);
				}
				else if (endIdx >= 0){
					this.sysCheckOutDateRangesSelected.push(this.sysCheckOutDateRanges[endIdx].id);
				}
			});
			this.sysCheckOutDateRangesSelected.sort();
			setTimeout(this.handleCheckOutDateRangesSelectLists(), 500);
		},
		// 20220526 新寫法 jim
		checkSelectRange(data, dataIndex, selectValue, selectIndex) {
			if (!selectValue) {
				data.sysCheckOutDateRangeSelected[selectIndex] = selectValue;
				setTimeout(this.resetSysCheckOutDateRanges(), 0);
				return;
			}
			data.sysCheckOutDateRanges = [];

			//- 自動添加後面的選項值;
			let idx = _.findIndex(this.sysCheckOutDateRanges, { id: selectValue });
			if (selectIndex == 0) {
				data.sysCheckOutDateRangeSelected[selectIndex] = selectValue;
				data.sysCheckOutDateRangeSelected[selectIndex+1] = this.sysCheckOutDateRanges[++idx].id;
			}
			if (selectIndex == 1) {
				data.sysCheckOutDateRangeSelected[selectIndex] = selectValue;
			}
			for(let i = dataIndex+1; i < this.checkoutDateLists.length; i++) {
				if (!this.checkoutDateLists[i].sysCheckOutDateRangeSelected[0] || !this.checkoutDateLists[i].sysCheckOutDateRangeSelected[1]) {
					break;
				}
				this.checkoutDateLists[i].sysCheckOutDateRangeSelected[0] = this.sysCheckOutDateRanges[++idx].id;
				this.checkoutDateLists[i].sysCheckOutDateRangeSelected[1] = this.sysCheckOutDateRanges[++idx].id;
			}
			setTimeout(this.resetSysCheckOutDateRanges(), 0);
		},
		// 20220526 原本寫法
		// checkSelectRange(data, dataIndex, selectValue, selectIndex) {
		// 	data.sysCheckOutDateRangeSelected.sort();
		// 	data.sysCheckOutDateRanges = [];

		// 	//- 自動添加後面的選項值;
		// 	let forValue = '';
		// 	if (selectIndex == 0) {
		// 		data.sysCheckOutDateRangeSelected[0] = selectValue;
		// 		data.sysCheckOutDateRangeSelected[1] = selectValue+1;
		// 		forValue = selectValue+1;
		// 	} else if (selectIndex == 1) {
		// 		data.sysCheckOutDateRangeSelected[0] = selectValue-1;
		// 		data.sysCheckOutDateRangeSelected[1] = selectValue;
		// 		forValue = selectValue;
		// 	}
		// 	let addValue = -1;
		// 	let addValue2 = 0;
		// 	for(let i = dataIndex+1; i < this.checkoutDateLists.length; i++) {
		// 		this.checkoutDateLists[i].sysCheckOutDateRangeSelected[0] = forValue+(addValue+=2);
		// 		this.checkoutDateLists[i].sysCheckOutDateRangeSelected[1] = forValue+(addValue2+=2);
		// 	}
		// 	setTimeout(this.resetSysCheckOutDateRanges(), 0);
		// },
		onSave() {
			this.valid = this.$refs.form.validate();
			if (this.valid) {
				this.handleSaveData();
			}
		},
		handleSaveData() {
			const saveTime = moment().format('YYYY-MM-DD HH:mm:ss');
			let isValidate = true;
			let errorMonth = '';
			//- 儲存資料整理
			_.forEach(this.checkoutDateLists, (item) => {

				/* 20220526 原本寫法
				// if(!_.isEmpty(item.sysCheckOutDateRangeSelected)) {
				// 	//- 將以選擇的區間，放入 sysCheckOutDateRanges
				// 	const range_first = _.find(this.sysCheckOutDateRanges, {'id': item.sysCheckOutDateRangeSelected[0]});
				// 	const range_end = _.find(this.sysCheckOutDateRanges, {'id': item.sysCheckOutDateRangeSelected[1]});
				// 	item.sysCheckOutDateRanges.push(range_first,range_end);
				// 	//- lstUpdateTime 更新為目前時間;
				// 	item.lstUpdateTime = saveTime;
				// }
				*/

				// 20220526 新寫法 jim
				let range_first = _.findIndex(this.sysCheckOutDateRanges, {'id': item.sysCheckOutDateRangeSelected[0]});
				let range_end = _.findIndex(this.sysCheckOutDateRanges, {'id': item.sysCheckOutDateRangeSelected[1]});

				item.sysCheckOutDateRanges = [];
				if (range_first >= 0 && range_end >= range_first) {
					let seq = 1;
					for(let i = range_first; i <= range_end; i++) {
						item.sysCheckOutDateRanges.push({...this.sysCheckOutDateRanges[i], id: 0, sysYear: 0, sysMonth: 0, seq: seq++});
					}
				} else if (item.sysMonth > this.currentMonth || item.sysYear > this.currentYear) {
					isValidate = false;
					errorMonth = `${errorMonth ? errorMonth + ',' + item.sysMonth : item.sysMonth}`;
				}
				//- lstUpdateTime 更新為目前時間;
				item.lstUpdateTime = saveTime;

				//- 刪除用來過濾所添加的Key值 sysCheckOutDateRangeSelected 及 判斷開關結算日DatePick的 checkOutDateMenu
				// delete item.sysCheckOutDateRangeSelected;
				// delete item.checkOutDateMenu;
				// _.forEach(item.sysCheckOutDateRanges, (subItem) => {
				// 	delete subItem.disabled;
				// });
			});
			if (isValidate) {
				this.doSave();
			}
			else {
				this.setMessageBar({
					message: `${errorMonth} 月份班表區間設定有誤，請重新設定`,
					type: messageType.WARNING,
				});
			}
		},
		async doSave() {
			const res = await apiSystemSaveCheckoutDates(this.checkoutDateLists);
			if (res.isSuccess == true) {
				this.setMessageBar({
					message: '班表結算設定成功！',
					type: messageType.SUCCESS,
				});
				this.getCheckoutByYearList();
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.setMessageBar({
					message: sysMsg,
					type: messageType.WARNING,
				});
			}
		},
	},
}
</script>