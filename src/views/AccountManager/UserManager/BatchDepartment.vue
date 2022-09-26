<template lang="pug">
v-card
	v-card-title.justify-center.text-h5.secondary--text.font-weight-bold.px-4.pt-6 批次編輯單位
	v-card-text.pa-4
		v-form(ref='form' v-model='valid' @submit.native.prevent='')
			v-row
				v-col.text-right(cols='2')
					.text-subtitle-1 同仁：
				v-col(cols='10')
					p.text-subtitle-1.secondary--text(v-for='(item,index) in lists' :key='index') {{ item.empName }}
			v-select.required(label='修改單位為' v-model='deptId' :items='departmentList' item-value='id' item-text='deptName' required filled rounded)
	v-card-actions.pb-6
		v-row
			v-col(cols='6')
				v-btn(@click='onCancel' color='primary' outlined rounded width='100%' height='50') 放棄
			v-col(cols='6')
				v-btn(@click='onConfirm' color='primary' depressed rounded width='100%' height='50') 儲存
</template>
<script>
import _ from 'lodash';
import { mapActions, mapGetters } from 'vuex';
import { messageType } from "@/utils/constant";
import { apiEmployeeUsersDepts, apiGetDepts } from "@/api/api";

export default {
	props: {
		lists: {
			type: Array,
			require: true
		}
	},
	data() {
		return {
			valid : false,
			emps: [],
			nameRules: [(v) => !!v || '名稱為必填資料'],
			numberingRules: [(v) => !!v || '員編必填資料'],
			emailRules: [
				v => !!v || 'E-mail為必填資料',
				v => /.+@.+\..+/.test(v) || 'E-mail必需有效',
			],
			deptId: '',
		};
	},
	computed: {
		...mapGetters(['getDepts']),

		departmentList() {
			return _.filter(this.getDepts, { 'status': "Active" });
		},
	},
	mounted(){
		this.init();
	},
	methods: {
		...mapActions(['setDepts']),

		init() {
			const data = [];
			_.forEach(this.lists, (item) => { data.push(item.id); });
			this.emps = data;
			this.getDepartmentList();
		},

		async getDepartmentList() {
			const res = await apiGetDepts();
			if (res.isSuccess == true) {
				this.setDepts(res.data);
			}
		},

		onConfirm() {
			this.valid = this.$refs.form.validate();
			if (this.valid) {
				this.doBatchDept();
			}
		},

		async doBatchDept() {
			const data = {
				empIds: this.emps,
				deptId: _.toString(this.deptId)
			}
			const res = await apiEmployeeUsersDepts(data);
			if (res.isSuccess == true) {
				this.$emit('emitConfirm');
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