import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
import VueCesium from 'vue-cesium'

Vue.use(VueCesium, {
  cesiumPath: 'https://www.supermapol.com/earth/Build/Cesium/Cesium.js'
})
window.CESIUM_BASE_URL = "http://www.supermapol.com/earth/vue-iEarth/static/Cesium/"

new Vue({
  render: h => h(App),
}).$mount('#app')
