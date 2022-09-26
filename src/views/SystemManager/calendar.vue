<template lang="pug">
.page.fill-height.py-10
	v-card.d-flex.flex-column.justify-space-between.fill-height.mx-auto(color='transparent' min-width='1400' max-width='1400' flat)
		v-card-text
			.secondary--text.text-h4.font-weight-bold.text-center.mb-12 行事曆設定
			v-form(ref='form' v-model='valid' @submit.native.prevent='')
				v-row.justify-start.mb-4
					v-col(cols='auto')
						.text-h6.py-2 設定年份：
					v-col(cols='4')
						v-select(v-model='year' :items='yearList' required background-color='white' solo hide-details rounded flat)
				v-row.justify-start.mb-4
					v-col(cols='auto')
						.text-h6.py-2 匯入行事曆：
					v-col(cols='10')
						v-file-input(v-model='file' background-color='white' accept='.xls, .xlsx, .csv' :rule='fileRule' solo hide-details rounded flat)
		v-card-actions
			v-row.justify-center
				v-col(cols='2')
					v-btn(@click='' color='primary' outlined rounded width='100%' height='50') 取消
				v-col(cols='2')
					v-btn(@click='onSet' color='primary' depressed rounded width='100%' height='50') 設定
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import { mapActions } from 'vuex';
import { messageType } from "@/utils/constant";
import { apiSystemUploadExcel } from "@/api/api";

export default {
	data() {
		return {
			valid: false,
			yearCount: null,
			year: null,
			yearList: [],
			file: {},
			fileRule: [(v) => !v || '請匯入行事曆'],
		};
	},
	mounted() {
		this.getYearLists();
	},
	methods: {
		...mapActions(['setMessageBar']),

		getYearLists() {
			this.year = moment().year();
			const yearCount = this.year + 10;
			for(let year = this.year; year <= yearCount; year++) {
				this.yearList.push(year);
			}
		},
		onSet() {
			this.valid = this.$refs.form.validate();
			if (this.valid) {
				this.doSet();
			}
		},
		async doSet() {
			const year = _.toNumber(this.year);
			const data = {
				file: this.file,
			}
			const res = await apiSystemUploadExcel(year, data);
			if (res.isSuccess === true) {
				this.setMessageBar({
					message: '行事曆設定成功！',
					type: messageType.SUCCESS,
				});
			} else {
				this.setMessageBar({
					message: '匯入檔案有誤，請重新確認',
					type: messageType.WARNING,
				});
			}
		}
	}
}
</script>