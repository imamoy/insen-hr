<template lang="pug">
.page.fill-height.py-10
	v-layout(align-center justify-center)
		v-card.pb-5(color='transparent' width='500' flat)
			.secondary--text.text-h4.font-weight-bold.text-center.mb-12 修改個人資訊
			v-row
				v-col(cols='2')
					v-btn.mr-4(@click='onEditUserName' color='primary' outlined) 修改
				v-col(cols='8')
					span.text-h6 使用者：{{ member.empName }}
			v-row
				v-col(cols='2')
				v-col(cols='8')
					span.text-h6 員編：{{ member.empNumber }}
			v-row
				v-col(cols='2')
				v-col(cols='8')
					span.text-h6 信箱：{{ member.email }}
			v-row
				v-col(cols='2')
				v-col(cols='8')
					span.text-h6 使用者單位：{{ member.deptName }}
			v-row
				v-col(cols='2')
					v-btn.mr-4(@click='onEditPassword' color='primary' outlined) 修改
				v-col(cols='8')
					span.text-h6 密碼：********
	v-dialog(v-model='isEditUsername' overlay-opacity='0.6' max-width='500' persistent no-click-animation z-index='50')
		edit-username(v-if='isEditUsername' @emitConfirm='onEditNameConfirm' @emitCancel='isEditUsername = false' :member='member')
	v-dialog(v-model='isEditPassword' overlay-opacity='0.6' max-width='500' persistent no-click-animation z-index='50')
		edit-password(v-if='isEditPassword' @emitCancel='isEditPassword = false' :member-id='member.id')
</template>
<script>
import _ from 'lodash';
import { mapActions } from 'vuex';
import { messageType } from "@/utils/constant";
import EditUsername from './EditUsername.vue';
import EditPassword from './EditPassword.vue';
import { apiEmployeeProfile } from "@/api/api";

export default {
	components: {
		EditUsername,
		EditPassword
	},
	data() {
		return {
			member: {},
			isEditPassword: false,
			isEditUsername: false
		};
	},
	mounted() {
		this.init();
	},
	methods: {
		...mapActions(['setLoading', 'setMessageBar']),

		async init() {
			await this.getProfile();
		},

		async getProfile() {
			const res = await apiEmployeeProfile();
			if (res.isSuccess === true) {
				this.member = res.data;
			} else {
				let sysMsg = '';
				sysMsg = !_.isUndefined(res.sysMsg) ? res.sysMsg : res.response.data.sysMsg;
				this.setMessageBar({
					message: sysMsg,
					type: messageType.WARNING,
				});
			}
		},

		onEditUserName() {
			this.isEditUsername = true;
		},

		onEditPassword() {
			this.isEditPassword = true;
		},

		onEditNameConfirm() {
			this.isEditUsername = false;
			this.getProfile();
		}
	}
}
</script>