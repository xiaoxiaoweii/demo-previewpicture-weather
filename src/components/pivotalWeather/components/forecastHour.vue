<template>
  <el-row>
    <el-col :span="24">
      <el-card class="box-card" shadow="always">
        <div slot="header" class="clearfix">
          <h3>Forecast Hour</h3>
        </div>
        <div>
          <el-tag type="sucess">000</el-tag>
          <el-tag type="sucess">006</el-tag>
          <el-tag type="sucess">012</el-tag>
          <el-tag type="sucess">018</el-tag>
          <el-tag type="sucess">024</el-tag>
          <el-tag type="sucess">030</el-tag>
          <el-tag type="sucess">036</el-tag>
          <el-tag type="sucess">042</el-tag>
          <el-tag type="sucess">048</el-tag>
          <el-tag type="sucess">054</el-tag>
        </div>
        <div class="data_info">
          <span>Valid:</span>
          <i class="el-icon-caret-left"></i>
          <span class="data_info_content">Wed 2020-04-22 06z</span>
          <i class="el-icon-caret-right"></i>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
export default {};
</script>

<style scoped>
.data_info {
  margin-top: 15px;
}
</style>