<template>
  <div class="imgUrl">
    <el-image
      style="width: 100%; height: 100%"
      :src="imgUrlSrc[0].url"
      fit="fill"
      :preview-src-list="srcList"
    ></el-image>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 图片地址
      imgUrlSrc: [
        {
          url: 'https://m3.pivotalweather.com/maps/models/gfs/2020042100/000/200wh.conus.png'
        },
        {
          url: 'https://m3.pivotalweather.com/maps/models/gfs/2020042100/006/200wh.conus.png'
        },
        {
          url: 'https://m3.pivotalweather.com/maps/models/gfs/2020042100/012/200wh.conus.png'
        },
        {
          url: 'https://m3.pivotalweather.com/maps/models/gfs/2020042100/018/200wh.conus.png'
        }
      ],
      // 预览图片
      srcList: [
        "https://i1.pivotalweather.com/sounding_images/gfs_2020042200_006_46.75--102.75.png",
        "https://i1.pivotalweather.com/sounding_images/gfs_2020042200_006_46.75--102.75.png"
      ]
    }
  }
};
</script>

<style scoped>
.imgUrl {
  width: 100%;
  height: 714px;
}
</style>