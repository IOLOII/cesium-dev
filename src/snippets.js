// import nProgress from 'nprogress'
// nProgress.configure({ showSpinner: false, rickle: true })

//rsa加密
// import JSEncrypt from "jsencrypt/bin/jsencrypt"
// export const enryptor = new JSEncrypt()
// // 设置公钥
// let publicKey = `MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCTtI/+8zlqkY9cNwNgecza+tUqvr4dl4WBouHbGQKhHWhGIHCkb0YM5NX+eI56JQCMKSonH4EDABAP7hJMrcflY7xdtDv2/t3WifbAAGMhxhPnoWhwm9SaLoLagMsYmB7k3YGpyKri87jHOcJIt0bYPoyQ3XJ+jT2IoSWierXXhwIDAQAB`
// enryptor.setPublicKey(publicKey)
// // 设置私钥
// let privateKey = `MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAJO0j/7zOWqRj1w3A2B5zNr61Sq+vh2XhYGi4dsZAqEdaEYgcKRvRgzk1f54jnolAIwpKicfgQMAEA/uEkytx+VjvF20O/b+3daJ9sAAYyHGE+ehaHCb1JougtqAyxiYHuTdganIquLzuMc5wki3Rtg+jJDdcn6NPYihJaJ6tdeHAgMBAAECgYAwAe8PiZRu29LBwSu6zrvTrNVeKFL4oUgGY5+PK+jb3wgGSwLxny0ggbxAEoUUlDRCWhrWTnoLNJkD5HhULeObXoV1WhyMaJkBpsP0frTN6duz8EqM13BC0+SkZqeXqVqaLL8ju3xefmFYBC/CQ6wW+8rnUU4jpnIvmV8pemFY0QJBAOBS2fLkRDBc9S/CKAPAn7yGkWbXa/NoL3JuhAjjzV33waZa7ogjy/AupKHI5A/umMzTGQOWmP0BovDPodzGar8CQQCokAKyYY8lmC48UiSzP3uA4rRkPWHASlqnB6evFEY0RdZ2ge6TCBHTMTg4VgAIMfxodbVJHjzhd5EumijV2605AkEAzZ8ESuG0I4TB9sII/c+OXDgZheRG/nnsq/7jpmZxtAXLixpk9YOih4mpvOaxLm1twKprjl934sqiOgyI+R8jbwJAZsUur71lfkFTZzmZ4KOC1CjkXP1DnO54aL/1D3yn9PTjdetwHrrby0yF/2sHp/d58eJaPhMugTTaEnSxEvpVmQJBANiqGVqIBRmUdZd+GCzMPjzRmsN/I1dEmT4qSFT4zLrwW4fsL08feEhb6fNvOg3PQagTasWSe+mydG5NyfMgW5g=`
// enryptor.setPrivateKey(privateKey)

// import nProgress from 'nprogress'
// isDev(() => {
//   return false
// })
const isDev = (fun, t = 'development') => {
  const tf = process.env.VUE_APP_NODE_ENV === t
  // if (!tf) return tf
  let res = undefined
  if (tf) fun && (res = fun())
  return res !== undefined ? res : tf
}
const isPro = (fun, t = 'production') => {
  const tf = process.env.VUE_APP_NODE_ENV === t
  if (!tf) return tf
  let res = undefined
  if (tf) fun && (res = fun())
  return res !== undefined ? res : tf
}
/**
 * @description 展示鼠标指向点的经纬度 返回WGS84坐标系
 */
const showMouseLngLat =
  ({ viewer, Cesium, scene }) => {
    let handler
    const entity = viewer.entities.add({
      label: {
        show: false,
        showBackground: true,
        font: '14px monospace',
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        pixelOffset: new Cesium.Cartesian2(15, 0)
      }
    })

    // Mouse over the globe to see the cartographic position
    handler = new Cesium.ScreenSpaceEventHandler(scene.canvas)
    handler.setInputAction(function (movement) {
      const cartesian = viewer.camera.pickEllipsoid(
        movement.endPosition,
        scene.globe.ellipsoid
      )
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        const longitudeString = Cesium.Math.toDegrees(cartographic.longitude)
        const latitudeString = Cesium.Math.toDegrees(cartographic.latitude)

        entity.position = cartesian
        entity.label.show = true
        entity.label.text =
          `Lng: ${`   ${longitudeString}`}\u00B0` +
          `\nLat: ${`   ${latitudeString}`}\u00B0`
      } else {
        entity.label.show = false
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

/**
 * @return Cartesian3
 */
const resolvePosition = (position) => {
  try {
    if (position instanceof Cesium.Cartesian3) {
      return position
    } else {
      return position.getValue()
    }
  } catch (error) {
    console.error("resolve position error", error)
  }
}

/**
 * @description Cartesian3坐标转为Wgs84
 * @param {Cartesian3} positon
 * @param {Cesium} Cesium
 * @returns {Array} lng, lat, height
 */
function Cartesian3toWGS84(positon, Cesium) {
  try {

    let cartographic = Cesium.Cartographic.fromCartesian(positon) // 从笛卡尔位置创建一个新的制图实例。中的值结果对象将以弧度表示。
    let lng = Cesium.Math.toDegrees(cartographic.longitude)
    let lat = Cesium.Math.toDegrees(cartographic.latitude)
    let height = cartographic.height
    return [lng, lat, height]
  } catch (e) {
    return false
  }
}
function tileLevel({ viewer, Cesium }) {
  let tiles = new Set()
  let tilesToRender = viewer.scene.globe._surface._tilesToRender
  if (Cesium.defined(tilesToRender)) {
    for (let i = 0; i < tilesToRender.length; i++) {
      tiles.add(tilesToRender[i].level)
    }
    return Array.from(tiles)
  }
}

// let progresspx = 0
// function progress(type, setVal, isForLoading = false, loading = { value: false }) {
//   switch (type) {
//     case "start":
//     default:
//       if (progresspx !== 0) {
//         if (!isForLoading) progress('add')

//       } else {
//         if (!isForLoading) nProgress.start()
//         if (isForLoading) loading.value = true
//       }
//       progresspx++
//       break
//     case 'add':
//     case 'inc':
//       nProgress.inc()
//       break
//     case "end":
//     case "done":
//       progresspx = progresspx - 1
//       if (progresspx <= 0) {
//         progresspx = 0
//         if (!isForLoading) nProgress.done()
//         if (isForLoading) loading.value = false
//       } else {
//         if (!isForLoading) progress('add')
//       }
//       break
//     case "set":
//       typeof setVal === 'number' && nProgress.set(setVal)
//       break
//     case "clear":
//       progresspx = 0
//       if (!isForLoading) nProgress.done()
//       if (isForLoading) loading.value = false
//       break
//   }

// }

// 插入文件渲染
// import { createApp } from 'vue'
// import pop from '@/lib/pop.vue'
// const toTemplate = (originData) => { createApp(<pop originData={originData} />) }

const mount = (vnode, container) => {
  //1、 将vnode变为elemnt，创建出真实的dom，并且在vnode上保存一份el
  const el = vnode.el = document.createElement(vnode.type)
  //    2、处理props
  if (vnode.props) {
    for (const key in vnode.props) {
      const value = vnode.props[key]
      // 判断传递过来的是否是方法，比如onClick
      if (key.startsWith("on")) {
        el.addEventListener(key.slice(2).toLowerCase(), value)
      }
      // 设置属性
      el.setAttribute(key, value)
    }
  }
  // 3、处理children
  if (vnode.children) {
    // 如果子节点存在并且子节点是字符串，说明是其中的内容
    if (typeof vnode.children === 'string') {
      // 将内容放进去
      el.textContent = vnode.children
    } else {
      // 说明子节点中是一个数组，其内部还有子节点
      vnode.children.forEach((item) => {
        // 再次调用挂载到el上
        mount(item, el)
      })
    }
  }
  // 4、将el挂载到container上
  // container.appendChild(el)
  return el
}

export {
  isDev,// 环境校验
  isPro,
  showMouseLngLat,// 显示当前指针经纬度
  resolvePosition,// 处理cesium中元素位置
  Cartesian3toWGS84,// 转换笛卡尔3D坐标为84
  tileLevel,// 返回当前图层高度
  // progress,// 统一进度条
}


//定义一些常量
var x_PI = 3.14159265358979324 * 3000.0 / 180.0
var PI = 3.1415926535897932384626
var a = 6378245.0
var ee = 0.00669342162296594323

/**
 * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
 * 即 百度 转 谷歌、高德
 * @param bd_lon
 * @param bd_lat
 * @returns {*[]}
 */
function bd09togcj02(bd_lon, bd_lat) {
  var x_pi = 3.14159265358979324 * 3000.0 / 180.0
  var x = bd_lon - 0.0065
  var y = bd_lat - 0.006
  var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi)
  var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi)
  var gg_lng = z * Math.cos(theta)
  var gg_lat = z * Math.sin(theta)
  return [gg_lng, gg_lat]
}

/**
 * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
 * 即谷歌、高德 转 百度
 * @param lng
 * @param lat
 * @returns {*[]}
 */
function gcj02tobd09(lng, lat) {
  var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI)
  var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI)
  var bd_lng = z * Math.cos(theta) + 0.0065
  var bd_lat = z * Math.sin(theta) + 0.006
  return [bd_lng, bd_lat]
}

/**
 * WGS84转GCj02
 * @param lng
 * @param lat
 * @returns {*[]}
 */
function wgs84togcj02(lng, lat) {
  if (out_of_china(lng, lat)) {
    return [lng, lat]
  } else {
    var dlat = transformlat(lng - 105.0, lat - 35.0)
    var dlng = transformlng(lng - 105.0, lat - 35.0)
    var radlat = lat / 180.0 * PI
    var magic = Math.sin(radlat)
    magic = 1 - ee * magic * magic
    var sqrtmagic = Math.sqrt(magic)
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI)
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI)
    var mglat = lat + dlat
    var mglng = lng + dlng
    return [mglng, mglat]
  }
}

/**
 * GCJ02 转换为 WGS84
 * @param lng
 * @param lat
 * @returns {*[]}
 */
function gcj02towgs84(lng, lat) {
  if (out_of_china(lng, lat)) {
    return [lng, lat]
  } else {
    var dlat = transformlat(lng - 105.0, lat - 35.0)
    var dlng = transformlng(lng - 105.0, lat - 35.0)
    var radlat = lat / 180.0 * PI
    var magic = Math.sin(radlat)
    magic = 1 - ee * magic * magic
    var sqrtmagic = Math.sqrt(magic)
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI)
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI)
    mglat = lat + dlat
    mglng = lng + dlng
    return [lng * 2 - mglng, lat * 2 - mglat]
  }
}

function transformlat(lng, lat) {
  var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng))
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0
  ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0
  return ret
}

function transformlng(lng, lat) {
  var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0
  ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0
  return ret
}

/**
 * 判断是否在国内，不在国内则不做偏移
 * @param lng
 * @param lat
 * @returns {boolean}
 */
function out_of_china(lng, lat) {
  return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false)
}