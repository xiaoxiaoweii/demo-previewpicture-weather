<template>
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
</template>

<script>
export default {
  data() {
    return {
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
      }
    };
  },
  methods: {
    // 点击树节点触发事件
    handleNodeClick(data) {
      console.log(data);
    }
  }
};
</script>

<style scoped>
.el-tree-node.is-current > .el-tree-node__content {
  background-color: #b82335 !important;
}
</style>