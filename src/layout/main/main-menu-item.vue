<script setup>
const props = defineProps({
  menu: {
    type: Object,
  },
  menuActiveKey: {
    type: String,
  },
});

const emit = defineEmits(['click']);

function clickHandler(menu) {
  emit('click', menu);
}
</script>

<template>
  <div class="main-menu-item">
    <a
      v-if="menu && menu.outlink"
      class="main-menu-item-link"
      :href="menu.outlink.href"
      :target="menu.outlink.target || '_blank'"
    >
      <div
        class="main-menu-item-content"
        :class="[menuActiveKey === menu.key ? 'main-menu-item-content-active' : '']"
      >
        <div class="main-menu-item-content-container">
          <div class="main-menu-item-content-icon">
            <component :is="menu.icon"></component>
          </div>
          <div class="main-menu-item-content-name">
            {{ menu.title }}
          </div>
        </div>
      </div>
    </a>
    <div
      v-else
      class="main-menu-item-content"
      :class="[menuActiveKey === menu.key ? 'main-menu-item-content-active' : '']"
      @click="clickHandler(menu)"
    >
      <div class="main-menu-item-content-container">
        <div class="main-menu-item-content-icon">
          <component :is="menu.icon"></component>
        </div>
        <div class="main-menu-item-content-name">{{ menu.title }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-menu-item {
  width: 60px;
  display: flex;
  justify-content: center;
  padding-bottom: 8px;
}
.main-menu-item-link {
  text-decoration: none;
}
.main-menu-item-content {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: all 0.3s ease;
}
.main-menu-item-content:hover {
  background: rgba(255, 255, 255, 0.12);
  cursor: pointer;
}
.main-menu-item-content-active,
.main-menu-item-content-active:hover {
  color: #ffffff;
  background: var(--nm-primary-color);
}
.main-menu-item-content-container {
  width: 100%;
}
.main-menu-item-content-icon {
  display: flex;
  justify-content: center;
  padding-bottom: 4px;
}
.main-menu-item-content-name {
  flex: none;
  text-align: center;
  padding: 0 8px;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
