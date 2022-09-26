<template lang="pug">
v-card
	v-card-title.d-flex.flex-nowrap.justify-center.px-4.pt-6.pb-0
		span.text-h6.secondary--text.font-weight-bold {{ title }}
	v-card-text.pa-4
		.text-subtitle-1.text-center.red--text.mb-4(v-if='isOverTime') 本活動時數有超過每日基本工時8小時
	v-card-actions.pb-6
		v-row
			v-col(cols='6')
				v-btn(@click='onCancel' color='primary' outlined rounded width='100%' height='50') {{ cancelText }}
			v-col(cols='6')
				v-btn(@click='onConfirm' color='primary' depressed rounded width='100%' height='50') {{ confirmText }}
</template>
<script>
import { mapActions } from 'vuex';

export default {
	props: {
		isEditWork: {
			type: Boolean,
			require: true
		},
		isOverTime: {
			type: Boolean,
			require: true
		}
	},
	data() {
		return {
			valid: false,
			feedback: '換休',
			feedbackRules: [(v) => !!v || '此欄位為必填資料'],
			feedbackList: ['換休','換加班費']
		};
	},
	computed: {
		title() {
			return this.isEditWork ? '是否確定修改/取消活動?': '是否確定新增活動?';
		},
		confirmText() {
			return this.isEditWork ? '確認修改': '確認建立';
		},
		cancelText() {
			return this.isEditWork ? '放棄修改': '放棄建立';
		}
	},
	methods: {
		...mapActions(['setLoading']),

		onShowOrHidePassword() {
            this.hidePassword = !this.hidePassword;
        },

		onConfirm() {
			this.$emit('emitConfirm');
		},

		onCancel() {
			this.$emit('emitCancel');
		}
	}
}
</script>