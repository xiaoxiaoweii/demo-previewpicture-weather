import axios from 'axios'
export default {
    data(){
        return {
            stationData:[], //站点数据
          imageCode:null,//探空站点图片
          mapView:null,
          cameraHeight:null,
          zoom:{
              value:[1,1.8,3,5,9,11],
              index:0
          } 
        }
    },
    mounted() {
        Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwODc0NzJkOS1jNTJkLTRmZjAtOTRiOC02MzliZDdhYWE3MDgiLCJpZCI6MjM3NDcsInNjb3BlcyI6WyJhc3IiLCJhc3ciLCJnYyJdLCJpYXQiOjE1ODM5MzgzMDB9.43324p5Q5zhfHpfrt8bHeZmmoK2stZAVgPB8d1WO8Iw';

  //影像底图切换
    var img_tdt_yx = new Cesium.ProviderViewModel({
        name: "影像底图",
        tooltip: "影像底图",
        //显示切换的图标
        iconUrl: "./images/img_tdt_yx.png",
        creationFunction: function () {
            var esri = new Cesium.UrlTemplateImageryProvider({
                url: 'http://192.168.2.112:8301/map/server/tianditu-satellite/{x}/{y}/{z}'
            });
            //影像标注
            addImageryProvider("http://192.168.2.112:8301/map/server/tianditu-satellite/{x}/{y}/{z}");
            return esri;
        }
    });
    //矢量底图切换
    var img_tdt_sl = new Cesium.ProviderViewModel({
        name: "矢量底图",
        tooltip: "矢量底图",
        iconUrl: "./images/img_tdt_sl.png",
        creationFunction: function () {
            var esri = new Cesium.UrlTemplateImageryProvider({
                url: 'http://192.168.2.112:8301/map/server/tianditu-satellite/{x}/{y}/{z}'
            });
            addImageryProvider("http://192.168.2.112:8301/map/server/tianditu-satellite/{x}/{y}/{z}")
            return esri;
        }
    });

    //地形底图切换
    var img_tdt_dx = new Cesium.ProviderViewModel({
        name: "地形底图",
        tooltip: "地形底图",
        iconUrl: "./images/img_tdt_dx.png",
        creationFunction: function () {
            var esri = new Cesium.UrlTemplateImageryProvider({
                url: 'http://192.168.2.112:8301/map/server/tianditu-satellite/{x}/{y}/{z}'
            });
            addImageryProvider("http://192.168.2.112:8301/map/server/tianditu-satellite/{x}/{y}/{z}")
            return esri;
        }
    });

    //ui入口
    let viewer = new Cesium.Viewer('cesiumContainer',{
        animation:false, //是否创建动画小器件，左下角仪表 
        timeline: false,//是否显示时间轴    
        sceneModePicker: false,//是否显示3D/2D选择器    
        baseLayerPicker: false,//是否显示图层选择器   
        geocoder: false,//是否显示geocoder小器件，右上角查询按钮
        scene3DOnly: true,//如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源 
        navigationHelpButton: false,//是否显示右上角的帮助按钮
        homeButton: false,//是否显示Home按钮
        infoBox: true,//是否显示信息框    
        showRenderLoopErrors: false,//如果设为true，将在一个HTML面板中显示错误信息 
        contextOptions:{
            webgl:{
                preserveDrawingBuffer: true
            }
        }
    //      imageryProvider : new Cesium.OpenStreetMapImageryProvider({
    //     url : 'https://a.tile.openstreetmap.org/'
    // })
        /*************************************************************/
        // imageryProvider : new Cesium.ArcGisMapServerImageryProvider( {
        // url : 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
        // } ),
        // baseLayerPicker : false
    });
    this.mapView = viewer
    this.mapView.camera.setView({destination:Cesium.Cartesian3.fromDegrees(116,30,15000000)});
    //影像标注加载
    let addImageryProvider = function(url){
        viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
            url: url,
            layer: "tdtImgAnnoLayer",
            style: "default",
            format: "image/jpg",
            tileMatrixSetID: "GoogleMapsCompatible",
            show: false
        }))
    }
   
    //隐藏cesium左下角logo
    viewer._cesiumWidget._creditContainer.style.display = 'none';
    //请求测试数据
    //this.getStationData()

    //初始化的镜头、视角
    //viewer.camera.setView({destination:Cesium.Cartesian3.fromDegrees(116.39,39.9,1500000)});
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    var pop=[];
    var p=undefined;
    handler.setInputAction( (evt)=> {
    	 var trackPop = undefined; //记录鼠标捕获实体的坐标
    	//添加单击监听事件
    	    var pick = viewer.scene.pick(evt.position);
    	    if(this.stationData.length){
                let setData = this.stationData
                for(let i = 0; i < setData.length; i ++){
                    if (Cesium.defined(pick) &&pick.id.comments == 'event'+setData[i].id) {
                        var popup = new MovePrompt(viewer, {
                                    name:"RED",
                                    type: 2,
                                    popupCartesian: Cesium.Cartesian3.fromDegrees(setData[i].longitude, setData[i].latitude),
                                            content: `
                                                        <div class="s-dialog-wrap">
                                                        <span>${setData[i].shizhan + '&nbsp;' + setData[i].quzhan}<span/>
                                                        </div>
                                                    `            
                                            }) ;
                                p=popup;
                                pop.push(p);
                        
                    }
                }
            }
    	     
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // 如果为真，则允许用户旋转相机。如果为假，相机将锁定到当前标题。此标志仅适用于2D和3D。
    this.mapView.scene.screenSpaceCameraController.enableRotate = false;
    // 如果为true，则允许用户平移地图。如果为假，相机将保持锁定在当前位置。此标志仅适用于2D和Columbus视图模式。
    this.mapView.scene.screenSpaceCameraController.enableTranslate = false;
    // 如果为真，允许用户放大和缩小。如果为假，相机将锁定到距离椭圆体的当前距离
    this.mapView.scene.screenSpaceCameraController.enableZoom = false;
    // 如果为真，则允许用户倾斜相机。如果为假，相机将锁定到当前标题。这个标志只适用于3D和哥伦布视图。
    this.mapView.scene.screenSpaceCameraController.enableTilt = false;

    // 获取当前镜头位置的笛卡尔坐标
        let cameraPos = this.mapView.camera.position;

        // 获取当前坐标系标准
        let ellipsoid = this.mapView.scene.globe.ellipsoid;

        // 根据坐标系标准，将笛卡尔坐标转换为地理坐标
        this.cartographic = ellipsoid.cartesianToCartographic(cameraPos);

        // 获取镜头的高度
        this.cameraHeight = this.cartographic.height; 

        var handler2 = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        handler2.setInputAction((event)=> {
            if(event > 0){//放大
                if(this.zoom.index + 1 >this.zoom.value.length - 1){
                    return
                }
                this.zoom.index ++
                this.$refs.zm.zoomUpOfMap()
                //this.mapMutipleAllUp(this.zoom)
            }else{
                if(this.zoom.index - 1 <0){
                    return
                }

                this.zoom.index --
                this.$refs.zm.zoomDownOfMap()
                //this.mapMutipleAllDown(this.zoom)
            }
        }, Cesium.ScreenSpaceEventType.WHEEL);
    },
    methods: {
        mapMutipleAllDown(zoom){
            let centerLon = parseFloat(Cesium.Math.toDegrees(this.cartographic.longitude).toFixed(8));
            let centerLat = parseFloat(Cesium.Math.toDegrees(this.cartographic.latitude).toFixed(8));
    
            //console.log('down',this.cameraHeight,v)
            this.zoom = zoom
            // 镜头拉远
            this.mapView.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, this.cameraHeight * (1/zoom.value[zoom.index])),
                duration: 1.0
            });
        },
        mapMutipleAllUp(zoom){
              let centerLon = parseFloat(Cesium.Math.toDegrees(this.cartographic.longitude).toFixed(8));
                let centerLat = parseFloat(Cesium.Math.toDegrees(this.cartographic.latitude).toFixed(8));
    
                //console.log('up',this.cameraHeight,v)
                this.zoom = zoom
                // 镜头拉近
                this.mapView.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, this.cameraHeight / zoom.value[zoom.index]),
                    duration: 1.0
                });
    
        },
        getCodeImage() {
            let codeUrl = 'tankong/LBoDuan?zhanhao=南京&time=20160623&hourMin=2311'
            return axios({
                method: 'GET',
                url: `${codeUrl}`,
                responseType: 'arraybuffer'
            })
        },
          getStationData(){
              axios({
                    method: 'GET',
                    url: 'tenwind/Query?daytime=2019-10-29 11:30:00&shizhan=全省&type=基本站',
                    responseType: 'json'
                }).then(res => {
                   this.stationData = res.data.data
                   //初始化镜头
                   if(this.stationData.length)
                    this.mapView.camera.setView({destination:Cesium.Cartesian3.fromDegrees(this.stationData[0].longitude,this.stationData[0].latitude,1500000)});
                    //搜索探空图片
                    this.getCodeImage()
                    .then(res => {
                        return 'data:image/png;base64,' + btoa(
                        new Uint8Array(res.data)
                            .reduce((data, byte) => data + String.fromCharCode(byte), '')
                        )
                    }).then((res) => {
                        this.imageCode = res
                         //设置站点
                        this.stationData.forEach(
                            (e,i,arr) => {
                                this.mapView.entities.add({
                                    name:e.shizhan+" "+e.quzhan+"站点信息",
                                    description:'<div style="margin:30px"><img src="'+this.imageCode+'" width="600" height="500" /></div>',             
                                    position:Cesium.Cartesian3.fromDegrees(e.longitude, e.latitude),
                                    point : {
                                        pixelSize : 5,
                                        color : Cesium.Color.white
                                    },
                                    comments:'event'+e.id
                                })
                            }
                        )
                    }).catch((e) => {
                    })
                }).catch((e) => {
                })
          },
          imgPlayRootOn(countIndex){
              this.getStationData()
          }  
    }
}