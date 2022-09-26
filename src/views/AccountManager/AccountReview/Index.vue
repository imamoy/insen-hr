<template lang="pug">
.page
	v-card.page-header(color='lightPrimary' tile flat dark)
		v-container.pb-2(fluid)
			h2.text-h4.font-weight-bold 帳號申請待審核
	v-container(fluid)
		v-card.page-card.overflow-y-auto(color='white' height='100%' flat)
			v-data-table(v-model='dataSelected' :headers='headers' :items='desserts' :items-per-page='itemsPerPage' item-key='id' selectable-key='id' show-select)
				template(v-slot:item.action='{ item }')
					v-btn(@click='onEditApply(item)' color='primary' dense width='80' height='35' light) 編輯
			v-row.justify-center.mt-4
				v-col(cols='2')
					v-btn(@click='onReject' color='red' depressed rounded width='100%' height='50' dark) 拒絕申請
				v-col(cols='2')
					v-btn(@click='onApprove' color='secondary' depressed rounded width='100%' height='50' dark) 通過申請
	v-dialog(v-model='isEditApply' overlay-opacity='0.6' max-width='500' persistent no-click-animation)
		edit-apply(v-if='isEditApply' @emitConfirm='onEditUpdateConfirm' @emitCancel='isEditApply = false' :edit-obj='editObj')
	v-dialog(v-model='isConfirmDialog' overlay-opacity='0.6' max-width='360' persistent no-click-animation)
		confirm-dialog(v-if='isConfirmDialog' @emitConfirm='onRejectConfirm' @emitCancel='isConfirmDialog = false' :message-obj='messageObj')
</template>
<script>
import _ from 'lodash';
import { mapActions } from 'vuex';
import { messageType } from "@/utils/constant";
import { apiEmployeeApproveList, apiEmployeeReject, apiEmployeeApprove } from "@/api/api";
import EditApply from './EditApply.vue';
import ConfirmDialog from '@/components/Dialog/ConfirmDialog';

export default {
	components: {
		EditApply,
		ConfirmDialog
	},
	data() {
		return {
			valid: false,
			itemsPerPage: 30,
			headers: [
				{ text: '申請者', value: 'empName', align: 'center' },
				{ text: '申請者員編', value: 'empNumber', align: 'center' },
				{ text: '申請者單位', value: 'deptName', align: 'center' },
				{ text: '申請者E-mail', value: 'email', align: 'left' },
				{ text: '操作', value: 'action', align: 'center' },
			],
			desserts: [],
			isEditApply: false,
			isConfirmDialog: false,
			messageObj: {},
			editObj: {},
			dataSelected: []
		};
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapActions(['setMessageBar']),

		init() {
			this.getData();
		},

		async getData() {
			const res = await apiEmployeeApproveList();
			if (res.isSuccess === true) {
				this.desserts = res.data;
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.setMessageBar({
					message: sysMsg,
					type: messageType.WARNING,
				});
			}
		},

		onEditApply(item) {
			this.editObj = item;
			this.isEditApply = true;
		},

		onEditUpdateConfirm() {
			this.isEditApply = false;
			this.getData();
		},

		onReject() {
			this.messageObj = {
				message: '您確定要拒絕申請？'
			}
			this.isConfirmDialog = true;
		},

		onRejectConfirm(){
			this.isConfirmDialog = false;
			this.doReject();
		},

		async doReject() {
			const data = [];
			_.forEach(this.dataSelected, (item) => { data.push(item.id); });
			const res = await apiEmployeeReject(data);
			if (res.isSuccess === true) {
				this.getData();
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.setMessageBar({
					message: sysMsg,
					type: messageType.WARNING,
				});
			}
		},

		async onApprove() {
			const data = [];
			_.forEach(this.dataSelected, (item) => { data.push(item.id); });
			const res = await apiEmployeeApprove(data);
			if (res.isSuccess === true) {
				this.getData();
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.setMessageBar({
					message: sysMsg,
					type: messageType.WARNING,
				});
			}
		}
	}
}
</script>