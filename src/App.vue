<template>
  <div id="app">
    <!-- <div id="toolbar" class="param-container tool-bar"><table><tbody><tr><td>亮度</td><td><input type="range" min="-20" max="20" step="0.02" data-bind="value: brightness, valueUpdate: 'input'" /></td></tr><tr><td>对比度</td><td><input type="range" min="-20" max="20" step="0.02" data-bind="value: contrast, valueUpdate: 'input'" /></td></tr><tr><td>色调</td><td><input type="range" min="-20" max="20" step="0.02" data-bind="value: hue, valueUpdate: 'input'" /></td></tr><tr><td>饱和度</td><td><input type="range" min="-20" max="20" step="0.02" data-bind="value: saturation, valueUpdate: 'input'" /></td></tr><tr><td>伽马</td><td><input type="range" min="-20" max="20" step="0.02" data-bind="value: gamma, valueUpdate: 'input'" /></td></tr></tbody></table></div> -->
    <vc-viewer
      :selection-indicator="false"
      :removeCesiumScript="false"
      :showRenderLoopErrors="false"
      @ready="ready"

      :shadows="false"
      :info-box="false"
      :animation="false"
      :baseLayerPicker="false"
      :geocoder="false"
      @moveEnd="onMoveEnd"
      :showCredit="false"
      :skyBox="false"
      :skyAtmosphere="false"
      :sceneMode="2"
      :mapMode2D="0"
      :orderIndependentTranslucency="true"
      :terrainShadows="0"
      :requestRenderMode="true"
      :targetFrameRate="60"
    >
      <!-- :homeButton="true"
      :geocoder="true"
      :fullscreenButton="true"
      :resolutionScale="0.5" -->
      <vc-layer-imagery></vc-layer-imagery>

      <!-- <vc-layer-imagery>
        <vc-provider-imagery-urltemplate
          :alpha="imagery.alpha"
          :brightness="imagery.brightness"
          :contrast="imagery.contrast"
          url="http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}"
          :projection-transforms="{
            form: 'GCJ02',
            to: 'WGS84'
          }"
        >
        </vc-provider-imagery-urltemplate>
      </vc-layer-imagery> -->

      <vc-layer-imagery>
        <vc-provider-imagery-amap
          :projection-transforms="{
            form: 'GCJ02',
            to: 'WGS84'
          }"
          mapStyle="6"
          ltype="0"
          :minimumLevel="0"
          :maximumLevel="15"
          ref="provider"
        ></vc-provider-imagery-amap>
      </vc-layer-imagery>

      <!-- <vc-layer-imagery>
        <vc-provider-imagery-urltemplate
          url="https://cxjg.91jt.net:9090/smartpc/map_tiles/{z}/{x}/{y}.png"
        ></vc-provider-imagery-urltemplate>
      </vc-layer-imagery> -->
    </vc-viewer>
    <div style="position: fixed; top: 20px; left: 30px">
      <input v-model="imagery.brightness" @change="click('color')" />
      <span>imagery.brightness</span>
      <input v-model="imagery.contrast" @change="click('color')" />
      <span>imagery.contrast</span>
      <input v-model="imagery.alpha" @change="click('color')" />
      <span>imagery.alpha</span>
      <button @click="click('visible')">visible</button>
      <button @click="click('home')">home</button>
      <button @click="click('rotate')">rotate</button>
      <button @click="click('look')">look</button>
      <button @click="click('color')">调整颜色</button>
    </div>
  </div>
</template>

<script setup>
  /**
   * import
   */
  import {
    ref,
    reactive,
    onMounted,
    getCurrentInstance,
    readonly,
    watch,
    nextTick
  } from 'vue'
  import {
    Cartesian3toWGS84,
    showMouseLngLat,
    resolvePosition,
    tileLevel,
    isDev,
    isPro
  } from './snippets'

  /**
   * variables & refs & run
   */
  let viewer = null
  let scene = null
  let Cesium = null
  const CONST_VARIABLES = readonly({
    DEF_VIEW_POSITION: [120.08186133480375, 30.345510139270118], // 初始化中心点
    // DEF_VIEW_POSITION: [119.59086500000002, 30.923496667000016], // 开发环境 初始化中心点
    INIT_CAMEAR_HEIGHT: 133.69380406630486, // 相机初始化高度
    // INIT_CAMEAR_HEIGHT: 350000, // 相机初始化高度
    // INIT_CAMEAR_HEIGHT: 149.9999999984135, // 开发环境 相机初始化高度
    ENTITY_PICK_HEIGHT: 2000, // 选择标注移动高度 1000-50m
    POINT_HEIGHT: 0 //标注距离地面高度
  })
  const lastMove = ref([
    [...CONST_VARIABLES.DEF_VIEW_POSITION, CONST_VARIABLES.NIT_CAMEAR_HEIGHT]
  ])

  let modelLayer = null
  const imagery = ref({
    brightness: 4.8,
    contrast: 1.36,
    alpha: 1
  })
  let sceneLayer = null

  /**
   * lifecycle
   */
  onMounted(() => {})

  /**
   * events & funs
   */
  const ready = cesiumInstance => {
    viewer = cesiumInstance.viewer
    scene = viewer.scene
    Cesium = cesiumInstance.Cesium
    // const { Cesium, viewer } = cesiumInstance
    // const scene = viewer.scene
    console.log(Cesium, viewer)
    viewer.imageryLayers.get(0).show = false
    // viewer.imageryLayers.addImageryProvider(
    //   new Cesium.BingMapsImageryProvider({
    //     url: 'https://dev.virtualearth.net',
    //     mapStyle: Cesium.BingMapsStyle.AERIAL,
    //     key: 'AuZhjW6H0pb4-3NSK_dDK4WeHwdrjQn_T-6PVQrY17HGVHwn5McFdEZiFoUYKCF0'
    //   })
    // )

    sceneLayer = null
    var promise = scene.open(
      // 'http://116.136.156.57:8090/iserver/services/3D-DL1120/rest/realspace'
      'https://bj.91jt.net:9094/iserver/services/3D-DL1120/rest/realspace'
      // 'http://www.supermapol.com/realspace/services/3D-suofeiya_church/rest/realspace'
    )
    Cesium.when(promise, function (layers) {
      console.log(layers, '模型加载完成')
      sceneLayer = layers[0]
      modelLayer = sceneLayer
      // scene.layers.find('Config')

      var viewModel = {
        brightness: 4.8,
        contrast: 1.36,
        hue: 0,
        saturation: 1.24,
        gamma: 1.18
      }
      Object.assign(sceneLayer, viewModel)
      console.log(sceneLayer, 'sceneLayer')
      console.log(sceneLayer.imageryProvider, 'imageryProvider')
      sceneLayer.style3D.bottomAltitude = 10
      setTimeout(() => {
        // var style3D = new Cesium.Style3D()
        // style3D.bottomAltitude = 0
        console.log(sceneLayer)
        console.log(sceneLayer.style3D.bottomAltitude)
        sceneLayer.style3D.bottomAltitude = 0
        console.log(sceneLayer.style3D.bottomAltitude)
      }, 5000)

      // Cesium.knockout.track(viewModel)
      // var toolbar = document.getElementById('toolbar')
      // Cesium.knockout.applyBindings(viewModel, toolbar)
      // // Make the active imagery layer a subscriber of the viewModel.
      // function subscribeLayerParameter(name) {
      //   Cesium.knockout.getObservable(viewModel, name).subscribe(function (newValue) {
      //     var layer = sceneLayer
      //     console.log('layer ', layer)
      //     layer[name] = parseFloat(newValue)
      //     console.log(name, parseFloat(newValue))
      //     //sceneLayers[0].refresh();
      //   })
      // }

      // subscribeLayerParameter('brightness')
      // subscribeLayerParameter('contrast')
      // subscribeLayerParameter('hue')
      // subscribeLayerParameter('saturation')
      // subscribeLayerParameter('gamma')
      // setTimeout(() => {
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(
          CONST_VARIABLES.DEF_VIEW_POSITION[0],
          CONST_VARIABLES.DEF_VIEW_POSITION[1],
          CONST_VARIABLES.ENTITY_PICK_HEIGHT
        ),
        orientation: {
          // 1.195511608282552 -0.3779724704301761
          heading: Cesium.Math.toRadians(0), // east, default value is 0.0 (north) //东西南北朝向
          pitch: Cesium.Math.toRadians(-90), // default value (looking down)  //俯视仰视视觉
          roll: 0.0 // default value
        }
      })
      // }, 3000)
    })

    // viewer.scene.requestRenderMode = true
    // if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
    //   var vtxf_dpr = window.devicePixelRatio
    //   // 适度降低分辨率
    //   while (vtxf_dpr >= 2.0) {
    //     vtxf_dpr /= 2.0
    //   }
    //   //alert(dpr);
    //   viewer.resolutionScale = vtxf_dpr
    // }

    // var canvas = viewer.scene.canvas
    // //具体事件的实现
    // var ellipsoid = viewer.scene.globe.ellipsoid
    // var handler = new Cesium.ScreenSpaceEventHandler(canvas)
    // let that = this
    // handler.setInputAction(function (movement) {
    //   //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标，返回球体表面的点
    //   var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid)
    //   if (cartesian) {
    //     //将笛卡尔三维坐标转为地图坐标（弧度）
    //     var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(
    //       cartesian
    //     )
    //     //将地图坐标（弧度）转为十进制的度数
    //     var lat_String = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4)
    //     var log_String = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4)
    //     var alti_String = (viewer.camera.positionCartographic.height / 1000).toFixed(
    //       2
    //     )
    //     that.longitude = log_String
    //     that.latitude = lat_String
    //     that.altitude = alti_String
    //   }
    // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    viewer.cesiumWidget.creditContainer.style.display = 'none'

    // 关闭天空盒，否则会显示天空颜色
    // viewer.scene.skyBox.show = false
    // 隐藏版权
    // viewer._cesiumWidget._creditContainer.style.display = 'none'
    // viewer.camera._suspendTerrainAdjustment = false // 是否允许相机进入地下
    // // 只显示地球一块区域，其余裁剪 即墨范围
    // let coffeeBeltRectangle = Cesium.Rectangle.fromDegrees(114,31.5, 123, 40.5)
    // viewer.scene.globe.cartographicLimitRectangle = coffeeBeltRectangle

    // // 只显示地球一块区域，其余裁剪 浙江学校范围 120.08186133480375, 30.345510139270118
    console.log(CONST_VARIABLES,'CONST_VARIABLES')
    let coffeeBeltRectangle = Cesium.Rectangle.fromDegrees(
      CONST_VARIABLES.DEF_VIEW_POSITION[0] - 0.07736900939497104,
      CONST_VARIABLES.DEF_VIEW_POSITION[1] - 0.07736900939497104,
      CONST_VARIABLES.DEF_VIEW_POSITION[0] + 0.07736900939497104,
      CONST_VARIABLES.DEF_VIEW_POSITION[1] + 0.07736900939497104
    )
    viewer.scene.globe.cartographicLimitRectangle = coffeeBeltRectangle
    // 显示帧率
    // scene.debugShowFramesPerSecond = true
  }
  const click = type => {
    console.log(type)
    switch (type) {
      case 'visible':
        console.log(modelLayer)
        modelLayer.visible !== undefined && (modelLayer.visible = !modelLayer.visible)
        break

      case 'home':
        let { heading, pitch, roll } = viewer.camera
        console.log(heading, pitch, roll)
        heading = Cesium.Math.toDegrees(heading)
        pitch = Cesium.Math.toDegrees(pitch)
        roll = Cesium.Math.toDegrees(roll)

        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(
            CONST_VARIABLES.DEF_VIEW_POSITION[0],
            CONST_VARIABLES.DEF_VIEW_POSITION[1],
            CONST_VARIABLES.ENTITY_PICK_HEIGHT
          ),
          orientation: {
            heading: Cesium.Math.toRadians(0), // east, default value is 0.0 (north) //东西南北朝向
            pitch: Cesium.Math.toRadians(-90), // default value (looking down)  //俯视仰视视觉
            roll: 0.0 // default value
            // heading: Cesium.Math.toRadians(0.1097327390419407),
            // pitch: Cesium.Math.toRadians(-0.9906321127318103),
            // roll: 0.0

            // heading,
            // pitch,
            // roll
          }
        })
        break
      case 'rotate':
        viewer.camera.rotate(
          Cesium.Cartesian3.fromDegrees(
            ...CONST_VARIABLES.DEF_VIEW_POSITION,
            CONST_VARIABLES.ENTITY_PICK_HEIGHT
          ),
          360
        )
        break
      case 'look':
        viewer.camera.look(
          Cesium.Cartesian3.fromDegrees(
            ...CONST_VARIABLES.DEF_VIEW_POSITION,
            CONST_VARIABLES.ENTITY_PICK_HEIGHT
          ),
          360
        )
        break
      case 'color':
        Object.assign(sceneLayer, imagery.value)
        console.log(sceneLayer)
        console.table(imagery.value)

        break
    }
  }
  const onMoveEnd = e => {
    // sceneLayer.style3D.bottomAltitude = 10
    // setTimeout(() => {
    //  sceneLayer.style3D.bottomAltitude = 0
    // });

    console.log(
      Cartesian3toWGS84(scene.camera.position, Cesium),
      tileLevel({ viewer, Cesium })
    )
    console.log(scene.camera.heading, scene.camera.pitch)
    lastMove.value.push(Cartesian3toWGS84(scene.camera.position, Cesium))
    if (lastMove.value.length >= 3) {
      lastMove.value.shift()
    }
  }
</script>

<style lang="scss" scoped>
  // body,
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
