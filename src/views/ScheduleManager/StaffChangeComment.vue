<template lang="pug">
v-card
	v-card-title.justify-center.text-h5.secondary--text.font-weight-bold.px-4.pt-6 {{ title }}
	v-card-text.pa-4
		v-textarea(v-model='comment' required filled hide-details readonly)
	v-card-actions.justify-center.pb-6
		v-btn(@click='onCancel' color='primary' outlined rounded width='140' height='50') 關閉視窗
</template>
<script>
export default {
	props: {
		changeObj: {
			type: Object,
			require: true,
		},
	},
	computed: {
    title() {
			switch (this.changeObj.status) {
				case 'PendingApproval':
					return '班表異動原因'

				case 'PendingReject':
					return '班表申請退回原因'

				case 'Rejected':
					return '班表退回原因'

				default:
					return '班表異動原因'
			}
		},
		comment() {
			switch (this.changeObj.status) {
				case 'PendingApproval':
					return this.changeObj.modifyReason

				case 'PendingReject':
					return this.changeObj.applyRejectReason

				case 'Rejected':
					return this.changeObj.rejectReason

				default:
					return this.changeObj.modifyReason
			}
		}
	},
	methods: {
		onCancel() {
			this.$emit('emitCancel');
		}
	}
}
</script>