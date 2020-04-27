
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-mixed-spaces-and-tabs */
<template>
  <div class="left-container">
    <!-- 整体 -->
    <el-container>
      <!-- header部分 -->
      <el-header>
        <div>
          <span>
            model
            <i class="el-icon-caret-right"></i>
            <el-button
              type="primary"
              round
              size="mini"
              @click.native="showModelDialog"
            >{{buttonModelName}}</el-button>
          </span>
          <span>
            Zoom
            <i class="el-icon-caret-right"></i>
            <el-button
              type="primary"
              round
              size="mini"
              @click.native="showModelDialog"
            >Continental US</el-button>
          </span>
          <span>
            Animation
            <i class="el-icon-caret-right"></i>
            <el-button type="primary" round size="mini" @click.native="showModelDialog">GFS</el-button>
          </span>
        </div>
      </el-header>
      <el-container>
        <el-aside>
          <!-- Forecast Hour 预报小时 -->
          <el-row>
            <el-col :span="24">
              <el-card class="box-card" shadow="always">
                <div slot="header" class="clearfix">
                  <h3>Forecast Hour</h3>
                </div>
                <div class="tag_hour">
                  <el-tag
                    effect="dark"
                    type="success"
                    v-for="(item, index) in this.ProgressBarScale"
                    :key="index"
                    :class="{active : activeIndex == index}"
                    @click.native="clickHourItem(index)"
                  >{{ProgressBarScale[index].hour}}</el-tag>
                </div>
                <div class="data_info">
                  <span>Valid:</span>
                  <i class="el-icon-caret-left" @click="clickLeftHourItem"></i>
                  <span class="data_info_content">{{activeData}}</span>
                  <i class="el-icon-caret-right" @click="clickRightHourItem"></i>
                </div>
              </el-card>
            </el-col>
          </el-row>
          <!-- Parameter 参数 -->
          <el-row>
            <el-col :span="24" shadow="always">
              <el-card class="box-card">
                <div slot="header" class="clearfix">
                  <h3>Parameter</h3>
                </div>
                <div>
                  <el-tree
                    :data="data"
                    :props="defaultProps"
                    @node-click="handleNodeClick"
                    highlight-current
                  ></el-tree>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-aside>

        <!-- 图片区域 -->
        <div class="imgUrl">
          <el-image
            style="width: 100%; height: 100%"
            :src="imgSrc"
            fit="fill"
            :preview-src-list="srcList"
          >
            <div slot="placeholder" class="el-icon-loading img_placeholder"></div>
          </el-image>
        </div>
      </el-container>
    </el-container>
    <!-- 显示model对话框 -->
    <el-card v-if="showModel" class="model_dialog">
      <div class="content">
        <!-- 第一列 -->
        <div class="contents">
          <h3>Globle</h3>
          <p @click="clickModel(item)" v-for="(item, index) in this.modelDate" :key="index">
            <span>
              <i class="el-icon-s-open"></i>
              {{modelDate[index].model}}
            </span>
            <span></span>
            <span>{{modelDate[index].hour}}</span>
          </p>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="contents">
          <h3>Regional</h3>
          <p @click="clickModel(item)" v-for="(item, index) in this.modelDate" :key="index">
            <span>
              <i class="el-icon-s-open"></i>
              {{modelDate[index].model}}
            </span>
            <span></span>
            <span>{{modelDate[index].hour}}</span>
          </p>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="contents">
          <h3>Convection Allowing</h3>
          <p @click="clickModel(item)" v-for="(item, index) in this.modelDate" :key="index">
            <span>
              <i class="el-icon-s-open"></i>
              {{modelDate[index].model}}
            </span>
            <span></span>
            <span>{{modelDate[index].hour}}</span>
          </p>
        </div>
      </div>
    </el-card>

    <!-- 时间轴 -->
    <div class="progress_time">
      <div class="number_time">
        <span
          v-for="(item, index) in this.ProgressBarScale"
          :key="index"
        >{{ProgressBarScale[index].hour}}</span>
      </div>
      <div @click="clickProgress">
        <el-progress
          :percentage="percentage"
          :color="customColor"
          :show-text="false"
          :stroke-width="20"
        ></el-progress>
      </div>
      <div class="time-icon">
        <el-button class="el-icon-d-arrow-left" type="primary" round @click="deDecrease"></el-button>
        <el-button class="el-icon-arrow-left" @click="decrease" type="primary" round></el-button>
        <el-button :class="playPauseButtonIcon" type="primary" round @click="playPauseTimeline"></el-button>
        <el-button class="el-icon-arrow-right" @click="increase" type="primary" round></el-button>
        <el-button class="el-icon-d-arrow-right" type="primary" round @click="inIncrease"></el-button>
      </div>
    </div>
  </div>
</template>

<script>
// import forecastHour from "../pivotalWeather/components/forecastHour";
// import parameter from "../pivotalWeather/components/Parameter";
// import imgPivotal from "../pivotalWeather/components/imgPivotal";
import showModel from "../pivotalWeather/components/showModel";
import timelineProgress from "../pivotalWeather/components/timelineProgress";
import pic1 from "../../assets/images/pic/200mbHeightWindGFS/200mbHeightWind-000-GFS.png";
import pic2 from "../../assets/images/pic/200mbHeightWindGFS/200mbHeightWind-006-GFS.png";
import pic3 from "../../assets/images/pic/200mbHeightWindGFS/200mbHeightWind-012-GFS.png";
import pic4 from "../../assets/images/pic/200mbHeightWindGFS/200mbHeightWind-018-GFS.png";
import pic5 from "../../assets/images/pic/200mbHeightWindGFS/200mbHeightWind-024-GFS.png";
import pic6 from "../../assets/images/pic/200mbHeightWindGFS/200mbHeightWind-030-GFS.png";
import pic7 from "../../assets/images/pic/200mbHeightWindGFS/200mbHeightWind-036-GFS.png";
import pic8 from "../../assets/images/pic/200mbHeightWindGFS/200mbHeightWind-042-GFS.png";
import pic9 from "../../assets/images/pic/200mbHeightWindGFS/200mbHeightWind-048-GFS.png";
import pic10 from "../../assets/images/pic/200mbHeightWindGFS/200mbHeightWind-054-GFS.png";
import pic11 from "../../assets/images/pic/200mbHeightWindGFS/200mbHeightWind-060-GFS.png";
import pic12 from "../../assets/images/pic/200mbHeightWindGFS/200mbHeightWind-072-GFS.png";
import pic13 from "../../assets/images/pic/200mbHeightWindGFS/300mbHeightWind-GFS-details.png";
export default {
  components: {
    // forecastHour,
    // parameter,
    // imgPivotal,
    // showModel,
    timelineProgress
  },
  data() {
    return {
      // 显示model
      showModel: false,
      // Parameter 参数 树节点数据
      data: [
        {
          label: "Upper-Air: Height, Wind, Temperature",
          children: [
            {
              label: "Height and Wind",
              children: [
                {
                  label: "200 mb Height, Wind"
                },
                {
                  label: "300 mb Height, Wind"
                },
                {
                  label: "500 mb Height, Wind"
                },
                {
                  label: "700 mb Height, Wind"
                },
                {
                  label: "850 mb Height, Wind"
                },
                {
                  label: "925 mb Height, Wind"
                }
              ]
            },
            {
              label: "Temperature and Wind",
              children: [
                {
                  label: "500 mb Temperature, Height, Wind"
                },
                {
                  label: "700 mb Temperature, Height, Wind"
                },
                {
                  label: "825 mb Temperature, Height, Wind"
                },
                {
                  label: "925 mb Temperature, Height, Wind"
                }
              ]
            },
            {
              label: "Anomalies",
              children: [
                {
                  label: "500 mb Height Anomaly"
                },
                {
                  label: "850 mb Temperature Anomaly"
                }
              ]
            }
          ]
        },
        {
          label: "Surface and Precipitation",
          children: [
            {
              label: "Surface",
              children: [
                {
                  label: "2 m AGL Relative Humidity"
                },
                {
                  label: "2 m AGL Temperature"
                },
                {
                  label: "2 m AGL Temperature, Wind Barbs"
                },
                {
                  label: "2 m AGL Wind Chill/Heat Index"
                },
                {
                  label: "2 m AGL Dew Point"
                },
                {
                  label: "2 m AGL Dew Point, Wind Barbs"
                },
                {
                  label: "MSLP, 10 m AGL Wind"
                }
              ]
            },
            {
              label: "Precipitation Type",
              children: [
                {
                  label: "Precipitation Type, Rate"
                }
              ]
            },
            {
              label: "Quantitative Precipitation",
              children: [
                {
                  label: "3-hr Accumulated QPF"
                },
                {
                  label: "6-hr Accumulated QPF"
                },
                {
                  label: "12-hr Accumulated QPF"
                },
                {
                  label: "24-hr Accumulated QPF"
                },
                {
                  label: "48-hr Accumulated QPF"
                },
                {
                  label: "120-hr Accumulated QPF"
                },
                {
                  label: "Total Accumulated QPF"
                }
              ]
            },
            {
              label: "Integrated Moisture and Satellite",
              children: [
                {
                  label: "Cloud Cover"
                },
                {
                  label: "Precipitable Water (PWAT)"
                }
              ]
            },
            {
              label: "Radar Products",
              children: [
                {
                  label: "Composite Reflectivity"
                }
              ]
            },
            {
              label: "Anomalies",
              children: [
                {
                  label: "PWAT Anomaly"
                },
                {
                  label: "2 m AGL Temperature Anomaly"
                }
              ]
            }
          ]
        },
        {
          label: "Quantitative Precipitation",
          children: [
            {
              label: "二级 1-1"
            }
          ]
        },
        {
          label: "Upper-Air: Moisture",
          children: [
            {
              label: "二级 1-1"
            }
          ]
        },
        {
          label: "Upper-Air: Dynamics",
          children: [
            {
              label: "二级 1-1"
            }
          ]
        },
        {
          label: "Severe Weather",
          children: [
            {
              label: "二级 1-1"
            }
          ]
        },
        {
          label: "Winter Weather",
          children: [
            {
              label: "二级 1-1"
            }
          ]
        }
      ],
      defaultProps: {
        children: "children",
        label: "label"
      },
      formInline: {
        user: "",
        region: ""
      },
      // 正在显示的图片
      imgSrc: pic1,
      // 预览图片
      srcList: [pic13, pic13],
      ProgressBarScale300: [
        {
          hour: "000",
          data: "2020-4-17-00z",
          imgSrc: pic1
        },
        {
          hour: "006",
          data: "2020-4-21-06z",
          imgSrc: pic2
        },
        {
          hour: "012",
          data: "2020-4-21-12z",
          imgSrc: pic3
        },
        {
          hour: "018",
          data: "2020-4-21-18z",
          imgSrc: pic4
        },
        {
          hour: "024",
          data: "2020-4-22-00z",
          imgSrc: pic5
        },
        {
          hour: "030",
          data: "2020-4-22-06z",
          imgSrc: pic6
        },
        {
          hour: "036",
          data: "2020-4-22-12z",
          imgSrc: pic7
        },
        {
          hour: "042",
          data: "2020-4-22-18z",
          imgSrc: pic8
        },
        {
          hour: "048",
          data: "2020-4-23-00z",
          imgSrc: pic9
        },
        {
          hour: "054",
          data: "2020-4-23-06z",
          imgSrc: pic10
        }
      ],
      ProgressBarScale: [
        {
          hour: "000",
          data: "2020-4-21-00z",
          imgSrc: pic1
        },
        {
          hour: "006",
          data: "2020-4-21-06z",
          imgSrc: pic2
        },
        {
          hour: "012",
          data: "2020-4-21-12z",
          imgSrc: pic3
        },
        {
          hour: "018",
          data: "2020-4-21-18z",
          imgSrc: pic4
        },
        {
          hour: "024",
          data: "2020-4-22-00z",
          imgSrc: pic5
        },
        {
          hour: "030",
          data: "2020-4-22-06z",
          imgSrc: pic6
        },
        {
          hour: "036",
          data: "2020-4-22-12z",
          imgSrc: pic7
        },
        {
          hour: "042",
          data: "2020-4-22-18z",
          imgSrc: pic8
        },
        {
          hour: "048",
          data: "2020-4-23-00z",
          imgSrc: pic9
        },
        {
          hour: "054",
          data: "2020-4-23-06z",
          imgSrc: pic10
        },
        {
          hour: "060",
          data: "2020-4-23-12z",
          imgSrc: pic11
        },
        {
          hour: "066",
          data: "2020-4-23-18z",
          imgSrc: pic12
        }
      ],
      ProgressBarScale200: [
        {
          hour: "000",
          data: "2020-4-21-00z",
          imgSrc: pic3
        },
        {
          hour: "006",
          data: "2020-4-21-06z",
          imgSrc: pic4
        },
        {
          hour: "012",
          data: "2020-4-21-12z",
          imgSrc: pic5
        },
        {
          hour: "018",
          data: "2020-4-21-18z",
          imgSrc: pic6
        },
        {
          hour: "024",
          data: "2020-4-22-00z",
          imgSrc: pic7
        },
        {
          hour: "030",
          data: "2020-4-22-06z",
          imgSrc: pic8
        },
        {
          hour: "036",
          data: "2020-4-22-12z",
          imgSrc: pic9
        },
        {
          hour: "042",
          data: "2020-4-22-18z",
          imgSrc: pic10
        },
        {
          hour: "048",
          data: "2020-4-23-00z",
          imgSrc: pic11
        },
        {
          hour: "054",
          data: "2020-4-23-06z",
          imgSrc: pic12
        },
        {
          hour: "060",
          data: "2020-4-23-12z",
          imgSrc: pic5
        },
        {
          hour: "066",
          data: "2020-4-23-18z",
          imgSrc: pic6
        }
      ],
      // 进度条
      percentage: 0,
      customColor: "#409eff",
      // 暂停播放按钮图标
      playPauseButtonIcon: "el-icon-video-play",
      // 当前激活的hour
      activeIndex: 0,
      // 当前data
      activeData: "2020-4-21-00z",
      // 选择模型按钮名字
      buttonModelName: "GFS",
      // 模型选择数据
      modelDate: [
        {
          model: "GFS",
          hour: "12z(224/224)"
        },
        {
          model: "ECMWF",
          hour: "06z(224/224)"
        }
      ]
    };
  },
  methods: {
    // 显示model选择框
    showModelDialog() {
      console.log("111");
      this.showModel = !this.showModel;
    },
    // 点击树节点触发事件
    handleNodeClick(data) {
      console.log(data);
      console.log(this.ProgressBarScale);
      console.log(this.ProgressBarScale200.length);
      console.log(this.ProgressBarScale300.length);

      if (this.ProgressBarScale === this.ProgressBarScale300) {
        this.ProgressBarScale = this.ProgressBarScale200;
      } else {
        this.ProgressBarScale = this.ProgressBarScale300;
      }
      this.imgSrc = this.ProgressBarScale[0].imgSrc;
    },
    // 进度条
    // 点击跳两张
    inIncrease() {
      this.percentage += 200 / this.ProgressBarScale.length;
      if (this.percentage > 100) {
        this.percentage = 100;
      }
      this.imgSrc = this.ProgressBarScale[
        parseInt((this.percentage / 100) * this.ProgressBarScale.length)
      ].imgSrc;
      this.activeIndex =
        parseInt((this.percentage / 100) * this.ProgressBarScale.length) - 1;
      this.activeData = this.ProgressBarScale[
        parseInt((this.percentage / 100) * this.ProgressBarScale.length) - 1
      ].data;
    },
    // 点击跳到下一张
    increase() {
      this.percentage += 100 / this.ProgressBarScale.length;
      if (this.percentage > 100) {
        this.percentage = 100;
      }
      this.imgSrc = this.ProgressBarScale[
        parseInt((this.percentage / 100) * this.ProgressBarScale.length)
      ].imgSrc;
      this.activeIndex =
        parseInt((this.percentage / 100) * this.ProgressBarScale.length) - 1;
      this.activeData = this.ProgressBarScale[
        parseInt((this.percentage / 100) * this.ProgressBarScale.length) - 1
      ].data;
    },
    // 点击上两张图
    deDecrease() {
      this.percentage -= 200 / this.ProgressBarScale.length;
      if (this.percentage < 0) {
        this.percentage = 0;
      }
      this.imgSrc = this.ProgressBarScale[
        parseInt((this.percentage / 100) * this.ProgressBarScale.length)
      ].imgSrc;
      this.activeIndex =
        parseInt((this.percentage / 100) * this.ProgressBarScale.length) - 1;
      this.activeData = this.ProgressBarScale[
        parseInt((this.percentage / 100) * this.ProgressBarScale.length) - 1
      ].data;
    },
    // 点击上一张图
    decrease() {
      this.percentage -= 100 / this.ProgressBarScale.length;
      if (this.percentage < 0) {
        this.percentage = 0;
      }
      this.imgSrc = this.ProgressBarScale[
        parseInt((this.percentage / 100) * this.ProgressBarScale.length)
      ].imgSrc;
      this.activeIndex =
        parseInt((this.percentage / 100) * this.ProgressBarScale.length) - 1;
      this.activeData = this.ProgressBarScale[
        parseInt((this.percentage / 100) * this.ProgressBarScale.length) - 1
      ].data;
    },
    // 播放暂停时间线
    playPauseTimeline() {
      // 切换播放按钮图标
      if (this.playPauseButtonIcon === "el-icon-video-play") {
        this.playPauseButtonIcon = "el-icon-video-pause";
        console.log(this);
        const that = this;
        const Interval = setInterval(function() {
          myTimer();
        }, 1000);
        function myTimer() {
          that.percentage += 100 / that.ProgressBarScale.length;
          that.imgSrc =
            that.ProgressBarScale[
              parseInt((that.percentage / 100) * that.ProgressBarScale.length) - 1
            ].imgSrc;
          that.activeIndex = parseInt(
            (that.percentage / 100) * that.ProgressBarScale.length
          ) - 1;
          that.activeData =
            that.ProgressBarScale[
              parseInt((that.percentage / 100) * that.ProgressBarScale.length) - 1
            ].data;
          console.log(that.percentage);
        }
        if (that.percentage > 100) {
          clearInterval(Interval);
        }
      } else {
        this.playPauseButtonIcon = "el-icon-video-play";
      }
    },
    // 进度条播放
    playProgress() {
      this.percentage += 10;
    },
    // 点击进度条
    clickProgress(e) {
      // 获取鼠标点击的x坐标 范围为200 - 1600 进度条总长为1400 则点击的进度比例为 (x-200)/1400 百分比为 (x-200)/14
      console.log(e.x);
      console.log(e)
      // 百分比
      let percentX = (e.x - 200) / 14;
      console.log(percentX);
      // 将点击的百分比赋值给进度条
      this.percentage = percentX;
      console.log(parseInt((percentX / 100) * this.ProgressBarScale.length));
      const L = parseInt((percentX / 100) * this.ProgressBarScale.length) + 1;
      this.percentage = (L * 100) / this.ProgressBarScale.length;
      // 进度条百分比对应的照片
      // 切换图片
      this.imgSrc = this.ProgressBarScale[
        parseInt((this.percentage / 100) * this.ProgressBarScale.length)
      ].imgSrc;
      this.activeIndex =
        parseInt((this.percentage / 100) * this.ProgressBarScale.length) - 1;
      this.activeData = this.ProgressBarScale[
        parseInt((this.percentage / 100) * this.ProgressBarScale.length) - 1
      ].data;
    },
    // 当前点击的hourtag
    clickHourItem(index) {
      console.log(index);
      this.activeIndex = index;
      this.activeData = this.ProgressBarScale[index].data;
      this.imgSrc = this.ProgressBarScale[index].imgSrc;
      this.percentage = (index * 100) / this.ProgressBarScale.length;
    },
    // 点击左侧hour
    clickLeftHourItem() {
      if (this.activeIndex > 0) {
        this.activeIndex -= 1;
        this.activeData = this.ProgressBarScale[this.activeIndex].data;
        this.imgSrc = this.ProgressBarScale[this.activeIndex].imgSrc;
        this.percentage =
          (this.activeIndex * 100) / this.ProgressBarScale.length;
      }
    },
    // 点击右侧hour
    clickRightHourItem() {
      if (this.activeIndex < this.ProgressBarScale.length - 1) {
        this.activeIndex += 1;
        this.activeData = this.ProgressBarScale[this.activeIndex].data;
        this.imgSrc = this.ProgressBarScale[this.activeIndex].imgSrc;
        this.percentage =
          (this.activeIndex * 100) / this.ProgressBarScale.length;
      }
    },
    // 选择模型
    clickModel(item) {
      this.showModel = !this.showModel;
      console.log(item);
      this.buttonModelName = item.model;
    }
  },
  mounted() {
    // this.activeData = this.ProgressBarScale[0].data
  }
};
</script>

<style scoped style="scss">
/* 布局 */
.left-container {
  position: absolute;
  top: 20px;
  left: 200px;
  /* border-radius: 5px; */
  opacity: 0.8;
  /* -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  -ms-border-radius: 5px;
  -o-border-radius: 5px; */
}
.el-header,
.el-footer {
  width: 1400px;
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
  line-height: 60px;
}
.el-aside {
  width: 400px;
  height: 750px;
  /* background-color: #d3dce6; */
  color: #333;
  /* text-align: center; */
  line-height: 20px;
}
body > .el-container {
  margin-bottom: 150px;
}
/* .el-row {
  margin-top: 20px;
} */
/* 布局结束 */
/* aside开始 */
.text {
  font-size: 14px;
}
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}
.el-select {
  text-align: center;
  line-height: 60px;
}
.el-card__header {
  background: chocolate;
}
.tag_hour .el-tag {
  text-align: left;
  margin-top: 5px;
  margin-left: 4px;
  cursor: pointer;
}
.data_info {
  margin-top: 20px;
}
.data_info i {
  cursor: pointer;
}
.data_info_content {
  font-size: 16px;
  border: 1px solid rgb(121, 116, 116);
}
.active {
  background: chocolate;
}
/* aside结束 */

/* model对话框 */
.model_dialog {
  position: absolute;
  top: 65px;
  width: 1083px;
  height: 266px;
  background: #909aa8;
}
.model_dialog .content {
  flex: 1 1 auto;
  flex-direction: reverse;
  display: flex;
  width: 100%;
  height: 100%;
  opacity: 0.8;
}
.model_dialog .content .contents {
  align-items: center;
  flex: 1;
}
.model_dialog .content .contents p {
  display: flex;
  line-height: 35px;
  text-align: center;
  cursor: pointer;
}
.model_dialog .content .contents p:hover {
  background: cadetblue;
}
.model_dialog .content .contents p span {
  align-items: left;
  flex: 1;
}
.imgUrl {
  width: 100%;
  height: 714px;
}
.img_placeholder {
  font-size: 50px;
  color: aquamarine;
  margin-top: 300px;
}
/* model对话框结束 */
/* 进度条开始 */
.number_time {
  display: flex;
}
.number_time span {
  align-items: center;
  text-align: right;
  flex: 1;
  color: #3b8fe6;
  font-weight: bold;
}
.time-icon {
  margin-top: 15px;
  text-align: center;
}
.time-icon .el-button {
  font-size: 20px;
}
/* 进度条结束 */
</style>