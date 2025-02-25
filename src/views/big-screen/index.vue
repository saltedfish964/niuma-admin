<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import autofit from 'autofit.js';
import * as echarts from 'echarts/core';
import { MapChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { mapData, zhongshanData } from './chain';

echarts.use([MapChart, TitleComponent, TooltipComponent, GridComponent, CanvasRenderer]);

echarts.registerMap('china', mapData);
echarts.registerMap('zhongshan', zhongshanData);

const mapRef = ref();

onMounted(() => {
  autofit.init({
    el: '#app',
  });

  const myChart = echarts.init(mapRef.value);

  myChart.setOption({
    backgroundColor: '#20232a',
    //配置属性
    series: [
      {
        name: '数据',
        type: 'map',
        map: 'zhongshan',
        roam: false,
        label: {
          show: true, //省份名称
        },
        itemStyle: {
          areaColor: '#1a1a1a', //地图区域的颜色
        },
        data: [], //数据
      },
    ],
  });

  window.addEventListener(
    'resize',
    () => {
      myChart.resize();
    },
    { passive: true },
  );
});

onBeforeUnmount(() => {
  autofit.off();
});
</script>

<template>
  <div class="container">
    <div class="map">
      <div ref="mapRef" style="width: 100%; height: 100%"></div>
    </div>
    <div class="area"></div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  position: relative;
}
.map {
  width: 100%;
  height: 100%;
}

.area {
  width: 200px;
  height: 200px;
  background: red;
  position: absolute;
  left: 10px;
  top: 10px;
}
</style>
