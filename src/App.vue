<template>
  <div id="app">
    <vc-viewer @ready="ready" :info-box="false">
      <vc-layer-imagery></vc-layer-imagery>
    </vc-viewer>
  </div>
</template>

<script>
  export default {
    name: 'App',
    components: {},
    methods: {
      ready(cesiumInstance) {
        const { Cesium, viewer } = cesiumInstance
        viewer.imageryLayers.addImageryProvider(
          new Cesium.BingMapsImageryProvider({
            url: 'https://dev.virtualearth.net',
            mapStyle: Cesium.BingMapsStyle.AERIAL,
            key: 'AuZhjW6H0pb4-3NSK_dDK4WeHwdrjQn_T-6PVQrY17HGVHwn5McFdEZiFoUYKCF0'
          })
        )
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(117.13, 36.68, 10000000),
          // orientation: {
          //   heading: Cesium.Math.toRadians(),
          //   pitch: Cesium.Math.toRadians(),
          //   roll: Cesium.Math.toRadians()
          // }
        })
        viewer._cesiumWidget._creditContainer.style.display = 'none'
      }
    }
  }
</script>

<style lang="scss">
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    // margin-top: 60px;
    margin: 0;
    padding: 0;
  }
  .viewer {
    width: 100%;
    height: 400px;
  }
</style>
