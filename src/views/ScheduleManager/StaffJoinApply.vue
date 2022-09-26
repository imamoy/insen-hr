<template lang="pug">
.activity-apply
	v-card
		v-card-title.align-center.justify-space-between.px-4.pt-6.pb-0
			.text-h5.secondary--text.font-weight-bold {{ campaign.campaignName }}
			v-chip.ml-3(:color='statusColor' dark) {{ campaign.status }}
		v-card.ma-4.pa-4(color='grey lighten-3' flat)
			v-row
				v-col(cols='3')
					.mt-1 活動日期：{{ eventObj.campaignDate }}
				v-col(cols='9')
					v-row.align-center(no-gutters)
						v-col(cols='auto')
							span 補修日期：
						v-col(cols='4')
							span {{ campaign.campaignLeaveDate }}
						v-col.mt-2(cols='8')
							.red--text.text-caption *選定之排休日期，請務必避開於 Apollo 上已申請之特休或其他假別
			v-divider.my-3
			v-row.align-center
				v-col(cols='5')
					span 活動時間：{{ campaign.startTime }} ~ {{ campaign.endTime }}
				v-col(cols='5')
					span 用餐時間：
					div.d-flex.flex-column
						span.ml-4(v-for='(item, index) in campaign.campaignDinnerTimes' :key='index') {{ item.startTime }} ~ {{ item.endTime }}
				v-col(cols='2') 共計 #[span(:class='getTotalHourOver(campaign.totalHour)') {{ campaign.totalHour }}] 小時
			v-row
				v-col(cols='5')
					span 預計與會時間：{{ campaign.empStartTime }} ~ {{ campaign.empEndTime }}
				v-col(cols='5')
					div.d-flex.flex-column
						span.ml-4(v-for='(item, index) in campaign.empCampaignDinnerTimes' :key='index') {{ item.startTime }} ~ {{ item.endTime }}
					.red--text.text-caption.mt-4 *建議用餐時間可設置為：12:00-13:00、18:00-19:00
				v-col.mt-1(cols='2') 共計 #[span(:class='getTotalHourOver(campaign.empTotalHour)') {{ campaign.empTotalHour }}] 小時
			v-divider.my-3
			v-row(no-gutters)
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
		v-card-actions.justify-center.pb-4.pt-0
			v-btn(@click='onCancel' color='primary' outlined rounded width='140' height='50') 關閉視窗
</template>
<script>
import _ from 'lodash';
// import moment from 'moment';
import { mapActions } from 'vuex';
import { messageType } from "@/utils/constant";
import { apiCampaignDetail } from "@/api/api";

export default {
	props: {
		eventObj: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			campaign: {},
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
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapActions(['setLoading']),

		init() {
			this.getData();
		},

		async getData() {
			const res = await apiCampaignDetail(this.campaignId, this.campaignDate, this.employeeCalendarCampaignId);
			if (res.isSuccess === true) {
				this.campaign = res.data;
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.setMessageBar({
					message: sysMsg,
					type: messageType.WARNING,
				});
			}
		},

		getTotalHourOver(totalHour) {
			return totalHour > 8 ? 'orange--text' : 'primary--text';
		},

		onShowOrHidePassword() {
            this.hidePassword = !this.hidePassword;
        },
		onCancel() {
			this.$emit('emitCancel');
		}
	}
}
</script>