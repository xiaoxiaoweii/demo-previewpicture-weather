<template>
  <div class="progress_time">
    <div class="number_time">
      <span v-for="(item, index) in this.ProgressBarScale" :key='index'>{{ProgressBarScale[index].hour}}</span>
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
</template>

<script>
export default {
  data() {
    return {
      // 进度条刻度
      ProgressBarScale: [
        {
          hour: '000'
        },
        {
          hour: '006'
        },
        {
          hour: '012'
        },
        {
          hour: '018'
        },
        {
          hour: '024'
        },
        {
          hour: '030'
        },
        {
          hour: '036'
        },
        {
          hour: '042'
        },
        {
          hour: '048'
        },
        {
          hour: '054'
        },
        {
          hour: '060'
        },
        {
          hour: '066'
        },
        {
          hour: '072'
        },
        {
          hour: '080'
        }
      ],
      // 进度条
      percentage: 20,
      customColor: "#409eff",
      // 暂停播放按钮图标
      playPauseButtonIcon: "el-icon-video-play"
    };
  },
  methods: {
    // 点击跳两张
    inIncrease() {
      this.percentage += 20;
      if (this.percentage > 100) {
        this.percentage = 100;
      }
    },
    // 点击跳到下一张
    increase() {
      this.percentage += 10;
      if (this.percentage > 100) {
        this.percentage = 100;
      }
    },
    // 点击上两张图
    deDecrease() {
      this.percentage -= 20;
      if (this.percentage < 0) {
        this.percentage = 0;
      }
    },
    // 点击上一张图
    decrease() {
      this.percentage -= 10;
      if (this.percentage < 0) {
        this.percentage = 0;
      }
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
          that.percentage += 5;
          console.log(that.percentage);
          if (that.percentage === 100) {
            clearInterval(Interval);
          }
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
      // 百分比
      let percentX = (e.x - 200) / 14;
      console.log(percentX);
      // 将点击的百分比赋值给进度条
      this.percentage = percentX;
      // 进度条百分比对应的照片
    }
  },
  mounted() {
    console.log(this.ProgressBarScale.length)
  }
};
</script>

<style scoped>
.number_time {
  display: flex;
  z-index: 1000;
}
.number_time span {
  align-items: center;
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
</style>