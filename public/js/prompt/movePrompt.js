//构建鼠标提示
/**
 * 
 * @param {*} viewer 
 * @param {*} opt 
 *      opt.type：类型，默认为1，即为鼠标移动提示框；type=2 ，定点提示框
 *      opt.popupCartesian : 定点提示框的位置（Cartesian3），仅当opt.type=2时可用
 *      opt.content ： 框内所展示的信息 （可传入html标签、也可以传入文本）
 *      opt.style : 为框体的相关样式 （即css样式）
 *      opt.show ： 是否显示框体
 */
var MovePrompt = function (viewer, opt) {
    if (!opt) opt = {};
    var randomId = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
    //console.log(randomId)
    this.id = randomId;
    this.name=opt.name;
    this.style = opt.style;
    this.viewer = viewer;
    if (!this.viewer) return;
    this.scene = this.viewer.scene;
    this.camera = this.viewer.camera;
    this.mapContainer = this.viewer.container.id;
    this.rendHandler = null;
    if (!this.mapContainer) return;

    this.trackPopUpId = "trackPopUp" + randomId;
    this.promptContentId = "promptContent" + randomId;
    this.promptDivId = "promptDiv" + randomId;
    this.trackPopUpContentId = "trackPopUpContent" + randomId;
    this.closeBtnId = "closeBtn" + randomId;

    var infoDiv;
    var max_width = 300;
    var max_height = 500;
    infoDiv = window.document.createElement("div");
    infoDiv.id = this.trackPopUpId;
    infoDiv.className = "trackPopUp";

    this.content = opt.content || ""; //提示框内容
    if (!opt.type || opt.type == 1) {
        infoDiv.innerHTML = '<div id="' + this.trackPopUpContentId + '" class="cesium-popup" style="top:0;left:0;">' +
            '<div class="cesium-prompt-content-wrapper" id="' + this.promptDivId + '">' +
            '<div id="trackPopUpLink" class="cesium-popup-content" style="max-width: ' + max_width + 'px;max-height: ' + max_height + 'px">' +
            '<span class="promptContent" id="' + this.promptContentId + '">' + this.content + '</span>' +
            '</div>' +
            '</div>' +
            '</div>';
    } else {
        infoDiv.innerHTML = '<div id="' + this.trackPopUpContentId + '" class="cesium-popup" style="top:0;left:0;">' +
            '<a class="cesium-popup-close-button" href="javascript:void(0)" id="' + this.closeBtnId + '">×</a>' +
            '<div class="cesium-popup-content-wrapper" id="' + this.promptDivId + '">' +
            '<div id="trackPopUpLink" class="cesium-popup-content" style="max-width: ' + max_width + 'px;max-height: ' + max_height + 'px">' +
            '<span class="popupContent" id="' + this.promptContentId + '">' + this.content + '</span>' +
            '</div>' +
            '</div>' +
            '<div class="cesium-popup-tip-container">' +
            '<div class="cesium-popup-tip"></div>' +
            '</div>' +
            '</div>';
    }

    window.document.getElementById(this.mapContainer).appendChild(infoDiv);
    window.document.getElementById(this.trackPopUpId).style.display = "block";

    this.offset = opt.offset || {};

    this.infoDiv = window.document.getElementById(this.trackPopUpId);
    this.trackPopUpContent = window.document.getElementById(this.trackPopUpContentId);

    this.promptDiv = window.document.getElementById(this.promptDivId);
    this.promptContent = window.document.getElementById(this.promptContentId);
    this.trackPopUpLink = window.document.getElementById(this.promptContentId);

    this.popupCartesian = opt.popupCartesian;
    this.rendHandler = null;
    this.show = (opt.show == undefined ? true : opt.show);
    if (opt.type == 2) {
        if (!this.popupCartesian) {
            console.warn("缺少空间坐标！");
            return;
        }
    }
    if (opt.type && opt.type != 1 && this.popupCartesian) {
        // this.popupCartesian = this.getPosition(this.popupCartesian) || this.popupCartesian;
        var clsBtn = window.document.getElementById(this.closeBtnId);
        var that = this;
        clsBtn.addEventListener("click", function () {
            that.setVisible(false);
        });
        this.rendHandler = this.viewer.scene.postRender.addEventListener(function () {
            if (that.popupCartesian) {
                var px = Cesium.SceneTransforms.wgs84ToWindowCoordinates(that.scene, that.popupCartesian);
                that.trackPopUpContent.style.left = px.x + (that.offset.x || 0) + (Math.ceil(-that.trackPopUpContent.offsetWidth / 2)) + "px";
                that.trackPopUpContent.style.top = px.y + (that.offset.y || 0) + (-that.trackPopUpContent.offsetHeight) + "px";
                var res = false;
                var e = that.popupCartesian,
                    i = that.camera.position,
                    n = that.scene.globe.ellipsoid.cartesianToCartographic(i).height;
                if (!(n += 1 * that.scene.globe.ellipsoid.maximumRadius, Cesium.Cartesian3.distance(i, e) > n)) {
                    res = true;
                }
                if (res && that.show) {
                    if (that.infoDiv) that.infoDiv.style.display = "block";
                } else {
                    if (that.infoDiv) that.infoDiv.style.display = "none";
                }
            }
        });
    }
}
MovePrompt.prototype = {
    //设置提示框的文本内容
    setHtml: function (html) {
        if (!html) {
            return;
        }
        if (this.trackPopUpLink) {
            this.trackPopUpLink.innerText = html;
        }
    },
    // 设置弹窗位置 获取当前点 如果当前位置有模型 获取模型高度后 重设该点坐标
    // getPosition: function (cartesian) {
    //     if(!cartesian) return null;
    //     var cg = Cesium.Cartographic.fromCartesian(cartesian);
    //     var tileH ;
    //     this.viewer.scene.globe.depthTestAgainstTerrain = true;
    //     if (this.viewer.scene.sampleHeightSupported && cg) {
    //         tileH = this.viewer.scene.sampleHeight(cg);
    //     }else{
    //         tileH = cg.height || 0;
    //     }
        
    //     var popupCartesian = Cesium.Cartesian3.fromDegrees(
    //         Cesium.Math.toDegrees(cg.longitude),
    //         Cesium.Math.toDegrees(cg.latitude),
    //         tileH
    //     );
    //     return popupCartesian;
    // },

    //销毁提示框对象
    destroy: function () {
        if (this.infoDiv && this.mapContainer) {
            this.infoDiv.style.display = "none";
            window.document.getElementById(this.mapContainer).removeChild(this.infoDiv);
            this.infoDiv = null;
        }
        if (this.rendHandler) {
            this.rendHandler();
            this.rendHandler = null;
        }
    },

    displayPrompt: function (display) {
        if (this.infoDiv) this.infoDiv.style.display = display ? "block" : "none";
    },
    //修改提示框样式
    updateStyle: function (opt) {
        if (!opt) opt = {};
        this.promptDiv.style.background = opt.rgba || "rgba(0,0,0,.4)";
        this.promptContent.style.color = opt.fontColor || "white";
    },
    //更新提示框的内容和位置
    updatePrompt: function (px, html) {
        if (!px) return;
        this.infoDiv.style.display = "block";
        this.trackPopUpContent.style.left = px.x + (this.offset.x || 30) + "px";
        this.trackPopUpContent.style.top = px.y + (this.offset.y || 30) + "px";
        this.setHtml(html);
    },
    //  控制提示框的显示隐藏
    setVisible: function (isOpen) {
        if (isOpen == undefined) isOpen = true;
        if (isOpen) {
            this.infoDiv.style.display = "block";
            this.show = true;
        } else {
            this.infoDiv.style.display = "none";
            this.show = false;
        }
    }
}