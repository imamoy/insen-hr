<template lang="pug">
v-card.menu-bar(:class='menuCollapseActive' color='white' flat)
	v-card-title.pa-0
		h1.menu-bar_logo.pl-2
			v-img(src='../assets/images/logo.png' max-width='140')
		v-btn(icon tile depressed :ripple='false' @click='toggleMenu')
			v-icon(size='30') mdi-menu
	.menu-bar_nav.d-flex.flex-column.justify-space-between
		.menu-bar_nav-top
			v-list.pa-0(color='transparent' :ripple='false')
				template(v-for='item in menuNav')
					// group with subitems
					v-list-group.mb-2(v-if='item.display && item.children' :value='checkActive(item.children)' :ripple='false' no-action eager)
						v-list-item.py-0(slot='activator' active-class='active-menu' :ripple='false')
							v-icon(size='24') {{item.meta.icon}}
							span.pl-2 {{ item.meta.name }}
						template(v-for='subItem in item.children')
							// child item
							v-list-item(v-if='subItem.display' :to='subItem.path' link :ripple='false' :draggable='false')
								span.pl-1 {{ subItem.name }}
					v-list-item.mb-2(v-if='item.display && !item.children' :to='item.path' link :ripple='false' :draggable='false')
						v-icon(size='24') {{item.meta.icon}}
						span.pl-2 {{ item.meta.name }}
		.menu-bar_nav-bottom
			v-btn.pa-1(@click='logout' color='primary' outlined rounded width='100%' min-width='40' height='40') 登出
</template>

<script lang="ts">
import _ from 'lodash';
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

export default Vue.extend({
	data() {
		return {
			dark: false,
			menuCollapse: false,
			operatorInfo: {
				operator_ID: 1,
				operatorName: 'Andy Lau',
				operatorAccount: 'andy',
				password: 'aSdFGh',
				status: 1,
				createTime: '2022-01-01T00:00:00Z',
				modifyTime: '2022-01-02T00:00:00Z'
			},
			menuNav: [
				{
					path: '/schedule',
					meta: { name: '排班作業', icon: 'mdi-calendar-month' },
					menuCode: 'ScheduleWork',
					display: false,
				},
				{
					path: '/scheduleManager',
					meta: { name: '排班管理', icon: 'mdi-account-check' },
					menuCode: 'ScheduleManagement',
					display: false,
					children: [
						{
							path: '/scheduleManager',
							name: '班表管理',
							menuCode: 'CalendarManagement',
							display: false,
						},
						{
							path: '/scheduleVerify',
							name: '班表審核',
							menuCode: 'CalendarVerify',
							display: false,
						},
					]
				},
				{
					path: '/activity',
					meta: { name: '活動管理', icon: 'mdi-calendar-multiple-check' },
					menuCode: 'CampaignManagement',
					display: false,
				},
				{
					path: '/accountManager',
					meta: { name: '使用者管理', icon: 'mdi-account-box' },
					menuCode: 'UserManagement',
					display: false,
					children: [
						{
							path: '/editProfile',
							name: '修改個人資訊',
							menuCode: 'PersonalModify',
							display: false,
						},
						{
							path: '/accountReview',
							name: '帳號申請待審核列表',
							menuCode: 'UserVerify',
							display: false,
						},
						{
							path: '/userManager',
							name: '使用者管理',
							menuCode: 'UserModify',
							display: false,
						},
						{
							path: '/groupManager',
							name: '組織管理',
							menuCode: 'DeptModify',
							display: false,
						},
					]
				},
				{
					path: '/systemManager',
					meta: { name: '系統設定', icon: 'mdi-cog' },
					menuCode: 'SysConfig',
					display: false,
					children: [
						{
							path: '/settlement',
							name: '班表結算設定',
							menuCode: 'ScheduleConfig',
							display: false,
						},
						{
							path: '/calendar-setting',
							name: '行事曆設定',
							menuCode: 'CalendarConfig',
							display: false,
						},
					]
				},
			]
		};
	},
	computed: {
		...mapGetters(['getAccount']),

		menuCollapseActive() {
			return this.menuCollapse ? 'active' : '';
		},

		menuAuthCodes() {
			return _.map(this.getAccount.menus, 'menuCode');
		}
	},
	created() {
		this.getMenu();
	},
	methods: {
		...mapActions(['setAccount']),

		getMenu() {
			_.forEach(this.menuNav, (item) => {
				item.display = _.includes(this.menuAuthCodes, item.menuCode);
				if (!_.isUndefined(item.children)) {
					_.forEach(item.children, (subItem) => {
						subItem.display = _.includes(this.menuAuthCodes, subItem.menuCode);
					});
				}
			});
		},
		toggleMenu() {
			this.menuCollapse = !this.menuCollapse;
		},
		logout() {
			if (this.$route.path != '/') {
				this.$router.push({ path: '/' });
			}
			localStorage.setItem('jwtToken', '');
			sessionStorage.setItem('store', JSON.stringify(this.$store.state));
			this.setAccount({});
		},
		checkActive(menu) {
			let menuActive = false;
			_.forEach(menu, (item) => {
				if (item.path === this.$route.path) {
					menuActive = true;
				}
			});
			return menuActive;
		},
	}
});
</script>