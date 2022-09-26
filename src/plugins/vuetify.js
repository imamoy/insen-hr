import Vue from "vue";
import Vuetify from "vuetify";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        background: "#E9ECFF",
        primary: "#0f80ee",
        lightPrimary: "#3b8edf",
        secondary: "#003B7C",
        gold: "#B47021",
        danger: "#FB0707",
        teal: "#009FA8"
      },
    },
  },
});
