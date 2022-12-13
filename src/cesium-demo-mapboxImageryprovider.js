// This is an example of using Cesium "Offline", meaning disconnected from the
// external Internet.  It must still be served from a local web server, but
// does not rely on any outside resources or services.  For more info, see:
// https://github.com/CesiumGS/cesium/wiki/Offline-Guide

const viewer = new Cesium.Viewer("cesiumContainer", {

});
var baseColor = viewer.scene.globe.baseColor;
// 先把所有的影像图层的透明度设置为0
viewer.imageryLayers._layers.forEach(layer => {
  layer.alpha = 0.0;
});
// 再设置baseColor
viewer.scene.globe.baseColor = new Cesium.Color(0, 0, 0, 0);
const CONST_VARIABLES = {
    DEF_VIEW_POSITION: [119.86990602148325, 30.92938388225079], // 初始化中心点
    // DEF_VIEW_POSITION: [119.59086500000002, 30.923496667000016], // 开发环境 初始化中心点
    INIT_CAMEAR_HEIGHT: 133.69380406630486, // 相机初始化高度
    // INIT_CAMEAR_HEIGHT: 350000, // 相机初始化高度
    // INIT_CAMEAR_HEIGHT: 149.9999999984135, // 开发环境 相机初始化高度
    ENTITY_PICK_HEIGHT: 2000, // 选择标注移动高度 1000-50m
    POINT_HEIGHT: 0 //标注距离地面高度
  };

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
          }
        });


viewer.imageryLayers.addImageryProvider(new Cesium.TileMapServiceImageryProvider({
    url: Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
  }));
//viewer.imageryLayers.addImageryProvider(new Cesium.MapboxImageryProvider({
//  url:'https://api.mapbox.com/styles/v1/ioloii/clbdccy0s000x14umel3js54s.html?title=view&access_token=pk.eyJ1IjoiaW9sb2lpIiwiYSI6ImNsNmtsbzdxeDAyenMzanAwc2ZoNmt0emMifQ.ubHFe4lucaxc-T7jWb-I8w&zoomwheel=true&fresh=true#2/37.75/-92.25',
  // mapId:'streets',
  //username:'ioloii',
//   accessToken: 'pk.eyJ1IjoiaW9sb2lpIiwiYSI6ImNsNmtsbzdxeDAyenMzanAwc2ZoNmt0emMifQ.ubHFe4lucaxc-T7jWb-I8w'
// }));


var streetsLayer = new Cesium.MapboxStyleImageryProvider({
    styleId: 'satellite-streets-v11',
    accessToken: 'pk.eyJ1IjoiaW9sb2lpIiwiYSI6ImNsNmtsbzdxeDAyenMzanAwc2ZoNmt0emMifQ.ubHFe4lucaxc-T7jWb-I8w'
});
const mapbox = new Cesium.MapboxImageryProvider({
    mapId: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiaW9sb2lpIiwiYSI6ImNsNmtsbzdxeDAyenMzanAwc2ZoNmt0emMifQ.ubHFe4lucaxc-T7jWb-I8w'
});

var imageryLayer = viewer.imageryLayers.addImageryProvider(
  streetsLayer
);
//var imageryLayer2 = viewer.imageryLayers.addImageryProvider(
  //mapbox
//);