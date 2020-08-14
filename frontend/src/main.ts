import Vue from 'vue'
import VueHighlightJS from 'vue-highlightjs' // eslint-disable-line
import App from './App.vue'

Vue.use(VueHighlightJS);
Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app')
