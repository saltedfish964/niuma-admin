<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import CloseIcon from './close-icon.vue';

const props = defineProps({
  /**
   * Tabs 数据
   * {
   *   key: string
   *   name: string
   *   closable: boolean
   *   params: object
   * }
   */
  initData: {
    type: Array,
    default: () => [],
  },
  activeTabKey: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:activeTabKey', 'add', 'remove', 'select']);

const tabItemRefs = ref();
const tabItemListRef = ref();
const tabs = ref([...props.initData]);
const hiddenTabs = ref([]);

function emitUpdateActiveTabKey(key) {
  emit('update:activeTabKey', key);
}

function emitAddTab(tab) {
  emit('add', tab);
}

function emitRemove(key) {
  emit('remove', key);
}

function emitSelected(tab) {
  emit('select', tab);
}

function removeTabByKey(key) {
  const tabIndex = tabs.value.findIndex((tab) => tab.key === key);
  if (props.activeTabKey === key) {
    const nextTab = tabs.value[tabIndex + 1] || tabs.value[tabIndex - 1];
    if (nextTab) {
      emitUpdateActiveTabKey(nextTab.key);
      emitSelected({ ...nextTab });
    }
  }
  tabs.value.splice(tabIndex, 1);
  emitRemove(key);
  nextTick(() => {
    updateHiddenTabs();
  });
}

async function addTab(tab) {
  tabs.value.push(tab);
  emitAddTab(tab);
  emitUpdateActiveTabKey(tab.key);
  await nextTick();
  if (tabItemListRef.value && tabItemRefs.value) {
    const totalWidth = tabItemRefs.value.reduce((total, el) => {
      const rect = el.getBoundingClientRect();
      return total + rect.width;
    }, 0);
    // 滚动到最末尾
    tabItemListRef.value.scrollTo({
      left: tabItemListRef.value.scrollLeft + totalWidth,
      behavior: 'smooth',
    });
  }
}

function updateScrollPositionByTab(tab) {
  const tabElementIndex = tabItemRefs.value.findIndex((el) => {
    const elKey = el.getAttribute('data-key');
    return elKey === tab.key;
  });
  const tabElement = tabItemRefs.value[tabElementIndex];
  if (tabElement && tabItemListRef.value) {
    // 获取容器可视区域边界
    const containerRect = tabItemListRef.value.getBoundingClientRect();
    const containerLeft = containerRect.left;
    const containerRight = containerRect.right;
    const tabRect = tabElement.getBoundingClientRect();
    // 判断元素是否完全在可视区域内
    const isFullyVisible =
      tabRect.left >= containerLeft && tabRect.right <= containerRight + 1;
    if (isFullyVisible) return;

    let left = 0;

    if (tabRect.left < containerLeft) {
      left = tabItemListRef.value.scrollLeft + tabRect.left - containerLeft;
      const isFirstChild = tabElementIndex === 0;
      if (!isFirstChild) {
        const prevTab = tabItemRefs.value[tabElementIndex - 1];
        left -= prevTab.offsetWidth / 2;
      }
    } else if (tabRect.right > containerRight) {
      left = tabItemListRef.value.scrollLeft + tabRect.right - containerRight;
      const isLastChild = tabElementIndex === tabItemRefs.value.length - 1;
      if (!isLastChild) {
        const nextTab = tabItemRefs.value[tabElementIndex + 1];
        left += nextTab.offsetWidth / 2;
      }
    }
    tabItemListRef.value.scrollTo({
      left,
      behavior: 'smooth',
    });
  }
}

function tabClickHandler(e, tab) {
  emitSelected(tab);
  emitUpdateActiveTabKey(tab.key);
  updateScrollPositionByTab(tab);
}

// 计算隐藏的 Tab
function updateHiddenTabs() {
  const container = tabItemListRef.value;
  if (!container || !tabItemRefs.value) return;

  // 获取容器可视区域边界
  const containerRect = container.getBoundingClientRect();
  const containerLeft = containerRect.left;
  const containerRight = containerRect.right;

  hiddenTabs.value = tabItemRefs.value
    .map((tabEl, index) => ({ tabEl, index }))
    .filter(({ tabEl }) => {
      const tabRect = tabEl.getBoundingClientRect();
      // 判断元素是否完全在可视区域内
      const isFullyVisible =
        tabRect.left >= containerLeft && tabRect.right <= containerRight + 1;
      // 若不完全可见，则加入 hiddenTabs
      return !isFullyVisible;
    })
    .map(({ index }) => tabs.value[index]);
}

function closeHandler(e, tab) {
  e.stopPropagation();
  removeTabByKey(tab.key);
}

// 监听容器变化
onMounted(() => {
  const container = tabItemListRef.value;
  if (!container) return;

  const resizeObserver = new ResizeObserver(updateHiddenTabs);
  resizeObserver.observe(container);

  container.addEventListener('scroll', updateHiddenTabs);
  updateHiddenTabs(); // 初始计算

  onUnmounted(() => {
    resizeObserver.disconnect();
    container.removeEventListener('scroll', updateHiddenTabs);
  });
});

defineExpose({
  addTab,
});
</script>

<template>
  <div class="v-tabs">
    <!-- <div class="v-tabs-before-extend">前置扩展</div> -->
    <div class="v-tabs-item-list" ref="tabItemListRef">
      <TransitionGroup name="list">
        <div
          ref="tabItemRefs"
          class="v-tabs-item"
          v-for="tab in tabs"
          :key="tab.key"
          :class="[props.activeTabKey === tab.key ? 'v-tabs-item-active' : '']"
          :data-key="tab.key"
        >
          <slot name="tab-item" :tab="tab">
            <div
              class="v-tabs-item-content"
              @click="(e) => tabClickHandler(e, tab)"
            >
              <div
                v-if="props.activeTabKey === tab.key"
                class="v-tabs-item-content-dot"
              >
                <div class="v-tabs-item-content-dot-inner"></div>
              </div>
              <div class="v-tabs-item-content-name">{{ tab.name }}</div>
              <div v-if="tab.closable" class="v-tabs-item-content-close">
                <div
                  class="v-tabs-item-content-close-icon"
                  @click="(e) => closeHandler(e, tab)"
                >
                  <close-icon></close-icon>
                </div>
              </div>
            </div>
          </slot>
        </div>
      </TransitionGroup>
    </div>
    <!-- <div class="v-tabs-after-extebd">后置扩展</div> -->
  </div>
</template>

<style scoped>
.v-tabs {
  background: #ffffff;
  display: flex;
  align-items: center;
  height: 42px;
}

.v-tabs-before-extend {
  flex: none;
  padding: 0 4px 0 8px;
}
.v-tabs-after-extebd {
  flex: none;
  padding: 0 8px 0 4px;
}

.v-tabs-item-list {
  flex: 1;
  display: flex;
  align-items: center;
  overflow-x: hidden;
  box-sizing: border-box;
}

.v-tabs-item {
  flex: none;
  padding: 0 4px;
  box-sizing: border-box;
  width: 160px;
}
.v-tabs-item:hover .v-tabs-item-content {
  background: #f0f0f0;
}
.v-tabs-item-content {
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
}
.v-tabs-item-content-dot {
  flex: none;
  overflow: visible;
  position: relative;
  color: #ffffff;
  background-color: #ffffff;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-sizing: border-box;
  margin-right: 4px;
}
.v-tabs-item-content-dot-inner {
  width: 100%;
  height: 100%;
  border-width: 1px;
  border-style: solid;
  border-color: inherit;
  border-radius: 50%;
  animation-name: statusProcessing;
  animation-duration: 1.2s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  content: '';
  box-sizing: border-box;
}
.v-tabs-item-content-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 24px;
  line-height: 24px;
}
.v-tabs-item-content-close {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 8px;
}
.v-tabs-item-content-close-icon {
  cursor: pointer;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #474747;
  font-size: 10px;
}
.v-tabs-item-content-close-icon:hover {
  background-color: #ffffff;
}

.v-tabs-item-active .v-tabs-item-content,
.v-tabs-item-active:hover .v-tabs-item-content {
  background: #3e74fd;
  color: #fff;
}

.v-tabs-item-active .v-tabs-item-content-close {
  color: #fff;
}

/* 动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.list-enter-from {
  opacity: 0;
  padding: 0;
}
.list-leave-to {
  width: 0;
  opacity: 0;
  padding: 0;
}

@keyframes statusProcessing {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}
</style>
