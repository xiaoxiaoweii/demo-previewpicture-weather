<template>
  <div id="app2">
    <div id="cesiumContainer"></div>
    <canvas id="bg_canvas"></canvas>
    <pivotal-weather></pivotal-weather>
  </div>
</template>

<script>

// 侧边栏
import pivotalWeather from '@/components/pivotalWeather/pivotalWeather'

import Map from '@/components/mixin/map.js'
import '@/styles/indexPage.scss'
export default {
  name: 'app',
  components: {
    pivotalWeather
  },
  mixins: [Map]
}
</script>
<style lang="scss">
</style>
