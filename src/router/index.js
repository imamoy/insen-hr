import Vue from "vue";
import Layout from "@/layout/Layout.vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const page = (file) => () => import(`@/views/${file}`);

const routes = [
  {
    path: "/",
    name: "Login",
    component: page("Login/Index"),
  },
  {
    path: "/signup",
    name: "SignUp",
    component: page("SignUp"),
  },
  {
    path: "/schedule",
    name: "Schedule",
    component: Layout,
    children: [
      {
        path: "",
        name: "ScheduleWork",
        component: page("Schedule/Index"),
      },
    ],
  },
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "/scheduleManager",
        name: "ScheduleManager",
        component: page("ScheduleManager/Manager"),
      },
      {
        path: "/scheduleVerify",
        name: "scheduleVerify",
        component: page("ScheduleManager/Verify"),
      },
    ],
  },
  {
    path: "/activity",
    name: "Activity",
    component: Layout,
    children: [
      {
        path: "",
        name: "ActivityManager",
        component: page("Activity/Index"),
      },
    ],
  },
  {
    path: "/",
    name: "AccountManager",
    component: Layout,
    children: [
      {
        path: "/editProfile",
        component: page("AccountManager/EditProfile/Index"),
      },
      {
        path: "/accountReview",
        component: page("AccountManager/AccountReview/Index"),
      },
      {
        path: "/userManager",
        component: page("AccountManager/UserManager/Index"),
      },
      {
        path: "/groupManager",
        component: page("AccountManager/GroupManager/Index"),
      },
    ],
  },
  {
    path: "/",
    name: "SystemManager",
    component: Layout,
    children: [
      {
        path: "/settlement",
        component: page("SystemManager/settlement"),
      },
      {
        path: "/calendar-setting",
        component: page("SystemManager/calendar"),
      },
    ],
  },
  {
    path: "/reset-password/:token",
    name: "ResetPassword",
    component: page("Login/ResetPassword"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.VUE_APP_BASE_URL,
  routes,
});

export default router;
