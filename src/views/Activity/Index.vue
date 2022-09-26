<template lang="pug">
.page
	v-card.page-header(color='lightPrimary' tile flat dark)
		v-container.pb-2(fluid)
			.d-flex.align-center
				h2.text-h4.font-weight-bold 活動管理
			v-form.mt-4(ref='form' v-model='valid')
				v-row
					v-col(cols='9')
						v-row.filter-bar(no-gutters)
							v-col(cols)
								v-text-field(label='活動名稱' name='name' type='text' v-model='campaignName' background-color='white' filled light hide-details)
							v-col(cols)
								v-select(v-model='campaignStatus' :items='campaignStatuses' item-value='dataCode' item-text='dataName' label='活動狀態' background-color='white' filled light hide-details)
							v-col(cols)
								v-select(v-model='year' :items='yearList' label='活動年份' item-value='id' item-text='text' background-color='white' filled light hide-details)
							v-col(cols)
								v-select(v-model='month' :items='monthList' label='活動月份' item-value='id' item-text='text' background-color='white' filled light hide-details)
					v-col(cols='3')
						v-row(no-gutters)
							v-col.pr-2(cols='4')
								v-btn(@click='getData' color='secondary' depressed width='100%' height='56' light) 查詢
							v-col.px-2(cols='4')
								v-btn(@click='onClean' color='white' outlined width='100%' height='56' light) 清除查詢
							v-col.px-2(cols='4')
								v-btn(@click='onAddActivity' color='light-green' depressed width='100%' height='56' dark) 新增活動
	v-container(fluid)
		v-card.page-card.d-flex.flex-column.justify-space-between(color='white' height='100%' flat)
			v-data-table.has-pagination-table(:headers='headers' :items='desserts' :items-per-page='itemsPerPage' height='100%' fixed-header hide-default-footer)
				template(v-slot:item.campaignDates='{ item }')
					p.my-2(v-for='(subItem, index) in item.campaignDates' :key='index') {{ subItem }}
				template(v-slot:item.campaignTimes='{ item }')
					p.my-2(v-for='(subItem, index) in item.campaignTimes' :key='index') {{ subItem }}
				template(v-slot:item.campaignStatus='{ item }')
					v-chip.my-1(v-for='(subItem, index) in item.campaignStatus' :key='index' :color='getStatusColor(subItem)' outlined small) {{ subItem }}
				template(v-slot:item.action='{ item }')
					v-btn(v-if='checkExpired(item.campaignStatus)' @click='onViewActivity(item)' color='primary' outlined dense width='80' height='35' light) 檢視
					v-btn(v-else @click='onEditActivity(item)' color='primary' depressed dense width='80' height='35' light) 編輯
			v-pagination.mb-5(v-model='page' :length='pageCount' :total-visible='totalPage' circle color='primary')
	v-dialog(v-if='isActivityAction' v-model='isActivityAction' fullscreen persistent hide-overlay no-click-animation)
		activity-action(v-if='isActivityAction' @emitConfirm='onActivityConfirm' @emitCancel='onActivityCancel' :to-work='toWork' :campaign-id='campaignId')
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import { mapActions } from 'vuex';
import { messageType } from "@/utils/constant";
import { apiGetCampaignConfig, apiCampaignList } from "@/api/api";
import ActivityAction from './ActivityAction.vue';

export default {
	components: {
		ActivityAction
	},
	data() {
		return {
			valid: false,
			year: 0,
			yearList: [
				{ id: 0, text: '請選擇' }
			],
			month: 0,
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
			campaignName: '',
			campaignStatus: 'CampaignRegisterting',
			page: 1,
            pageCount: 0,
			itemsPerPage: 30,
			totalPage: 18,
			headers: [
				{ text: '活動日期', value: 'campaignDates', align: 'center' },
				{ text: '活動時間', value: 'campaignTimes', align: 'center' },
				{ text: '活動名稱', value: 'campaignName', align: 'left' },
				{ text: '活動狀態', value: 'campaignStatus', align: 'center', width: 140 },
				{ text: '操作', value: 'action', align: 'center' },
			],
			desserts: [],
			isActivityAction: false,
			toWork: '',
			attendees: [],
			campaignStatuses: [],
			depts: [],
			campaignId: '',
			options: {}
		};
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapActions(['setLoading', 'setLoading']),

		async init() {
			await this.getCampaignOptions();
			this.getYearLists();
			this.getMonth();
			await this.getData();
		},

		getYearLists() {
			this.year = moment().year();
			const yearCount = this.year + 1;
			for(let year = this.year; year <= yearCount; year++) {
				this.yearList.push(
					{
						id: year,
						text: _.toString(year),
					}
				);
			}
		},

		getMonth() {
			const month = moment().format('MM');
			this.month = _.parseInt(month);
		},

		async getData() {
			const data = {
				pageNumber: _.toString(this.page),
				pageSize: _.toString(this.itemsPerPage),
				campaignName: _.toString(this.campaignName),
				campaignStatus: _.toString(this.campaignStatus),
				campaignYear: _.toNumber(this.year),
				campaignMonth: _.toNumber(this.month),
			};
			const res = await apiCampaignList(data);
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

		async getCampaignOptions() {
			const res = await apiGetCampaignConfig();
			if (res.isSuccess === true) {
				this.attendees = res.data.attendees;
				this.campaignStatuses = res.data.campaignStatuses;
				this.campaignStatuses.unshift({ dataCode: '', dataName: '全部' });
				this.depts = res.data.depts;
			}
		},

		getStatusColor(val) {
			let color = '';
			switch (val) {
				case '啟用':
					color = 'green'
					break;
				case '已過期':
					color = 'blue-grey lighten-1'
					break;
				case '報名中':
					color = 'orange'
					break;
				case '已取消':
					color = 'default'
					break;
			}
			return color;
		},
		checkExpired(data) {
			let expiredList = [];
			_.forEach(data, (item) => {
				if (item === '已過期') {
					expiredList.push(item);
				}
			});
			return data.length === expiredList.length;
		},
		onClean() {
			this.year = '請選擇';
			this.month = '請選擇';
			this.activityName = '';
			this.activityStatus = '全部';
		},
		onAddActivity() {
			this.toWork = 'Add';
			this.campaignId = '';
			this.isActivityAction = true;
		},
		onEditActivity(item) {
			this.toWork = 'Edit';
			this.campaignId = item.id;
			this.isActivityAction = true;
		},
		onViewActivity(item) {
			this.toWork = 'View';
			this.campaignId = item.id;
			this.isActivityAction = true;
		},
		onActivityCancel() {
			this.isEditWork = false;
			this.isActivityAction = false;
		},
		onActivityConfirm() {
			this.onActivityCancel();
			this.getData();
		}
	},
	watch: {
		page() {
			this.getData();
		}
	}
}
</script>