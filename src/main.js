import Vue from 'vue'
import App from './App.vue'
import router from "./router";
import "material-icons/iconfont/material-icons.css";
import lodash from "lodash";
import VueLodash from "vue-lodash";
import vuetify from "./plugins/vuetify";
import store from "./store";
Vue.use(VueLodash, lodash);
Vue.config.productionTip = false

new Vue({
  router,
  vuetify,
  store,
  render: (h) => h(App)
}).$mount("#app");
