import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    loading: false,
    account: {},
    messageBar: {},
    depts: [],
    campaignConfig: [],
    employeeListConfig: [],
  },
  getters: {
    getLoading: (state) => state.loading,
    getAccount: (state) => state.account,
    getDepts: (state) => state.depts,
    getCampaignConfig: (state) => state.campaignConfig,
    getEmployeeListConfig: (state) => state.employeeListConfig,
    getMessageBar: (state) => state.messageBar,
  },
  actions: {
    setLoading({ commit }, loading) {
      commit("SET_LOADING", loading);
    },
    setAccount({ commit }, account) {
      commit("SET_ACCOUNT", account);
    },
    setDepts({ commit }, depts) {
      commit("SET_DEPTS", depts);
    },
    setCampaignConfig({ commit }, campaignConfig) {
      commit("SET_CAMPAIGN_CONFIG", campaignConfig);
    },
    setEmployeeListConfig({ commit }, employeeListConfig) {
      commit("SET_EMPLOYEE_LIST_CONFIG", employeeListConfig);
    },
    setMessageBar({ commit }, messageBar) {
      commit("SET_MESSAGE_BAR", messageBar);
    },
  },
  mutations: {
    SET_LOADING: (state, loading) => {
      state.loading = loading;
    },
    SET_ACCOUNT: (state, account) => {
      state.account = account;
    },
    SET_DEPTS: (state, depts) => {
      state.depts = depts;
    },
    SET_CAMPAIGN_CONFIG: (state, campaignConfig) => {
      state.campaignConfig = campaignConfig;
    },
    SET_EMPLOYEE_LIST_CONFIG: (state, employeeListConfig) => {
      state.employeeListConfig = employeeListConfig;
    },
    SET_MESSAGE_BAR: (state, messageBar) => {
      state.messageBar = messageBar;
    },
  },
  modules: {},
});
