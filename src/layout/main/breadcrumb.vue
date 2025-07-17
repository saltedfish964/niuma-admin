<script setup>
import { useLayoutStore } from '@src/store/modules/layout';

const layoutStore = useLayoutStore();
</script>

<template>
  <nav class="breadcrumb">
    <transition-group name="breadcrumb-transition" tag="ol">
      <li v-for="(item, index) in layoutStore.breadcrumbList" :key="item.key">
        <div class="breadcrumb-item">
          <component :is="item.icon"></component>
          <div class="breadcrumb-item-label">{{ item.label }}</div>
        </div>
        <span v-if="index < layoutStore.breadcrumbList.length - 1" class="breadcrumb-separator"
          >/</span
        >
      </li>
    </transition-group>
  </nav>
</template>

<style scoped>
.breadcrumb {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  line-height: 1.5714285714285714;
  list-style: none;
}
.breadcrumb ol {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
  list-style: none;
}
.breadcrumb ol li {
  display: flex;
}
.breadcrumb ol li:last-child {
  color: rgba(0, 0, 0, 0.88);
}
.breadcrumb ol li .breadcrumb-separator {
  margin-inline: 8px;
  color: rgba(0, 0, 0, 0.45);
  cursor: default;
}
.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  cursor: default;
}
.breadcrumb-item-label {
  margin-left: 8px;
}
/* 定义过渡动画 */
.breadcrumb-transition-enter-active {
  transition:
    transform 0.4s cubic-bezier(0.76, 0, 0.24, 1),
    opacity 0.4s cubic-bezier(0.76, 0, 0.24, 1);
}

.breadcrumb-transition-leave-active {
  display: none;
}

.breadcrumb-transition-enter-from {
  opacity: 0;
  transform: translateX(30px) skewX(-30deg);
}
</style>
