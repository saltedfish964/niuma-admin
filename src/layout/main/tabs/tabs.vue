<script setup>
import { ref, nextTick, onMounted, onUnmounted, computed } from 'vue';
import { debounce } from 'lodash-es';
import CloseIcon from './close-icon.vue';
import { useLayoutStore } from '@src/store/modules/layout';

const emit = defineEmits(['select']);

const layoutStore = useLayoutStore();

const isScrolling = ref(false);
const tabItemRefs = ref();
const tabItemListRef = ref();
const hiddenTabs = ref([]);
const activeTabKey = computed(() => layoutStore.activeTabKey);

let container = null;
let resizeObserver = null;

function emitSelected(tab) {
  emit('select', tab);
}

function removeTabByKey(key) {
  const tabsList = layoutStore.tabsList;
  const tabIndex = tabsList.findIndex((tab) => tab.key === key);
  if (activeTabKey.value === key) {
    const nextTab = tabsList[tabIndex + 1] || tabsList[tabIndex - 1];
    if (nextTab) {
      layoutStore.setActiveTabKey(nextTab.key);
      emitSelected({ ...nextTab });
    }
  }
  layoutStore.removeTabByKey(key);
  layoutStore.updateTabClosable();
  nextTick(() => {
    updateHiddenTabs();
  });
}

function updateScrollPositionByTab(tab) {
  if (isScrolling.value) return; // 避免重复滚动

  isScrolling.value = true;

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
    const isFullyVisible = tabRect.left >= containerLeft && tabRect.right <= containerRight + 1;
    if (isFullyVisible) {
      isScrolling.value = false;
      return;
    }
    let left = 0;
    // 处理极小容器的情况
    if (containerRect.width < tabRect.width) {
      // 容器太小，无法完全显示一个tab，居中处理
      left =
        tabItemListRef.value.scrollLeft +
        tabRect.left -
        containerLeft -
        (containerRect.width - tabRect.width) / 2;
    } else if (tabRect.left < containerLeft) {
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
      left: Math.max(0, left),
      behavior: 'smooth',
    });

    // 滚动结束后重置标志位
    setTimeout(() => {
      isScrolling.value = false;
    }, 300); // 略大于滚动动画时长
  } else {
    isScrolling.value = false;
  }
}

function tabClickHandler(tab) {
  emitSelected(tab);
  updateScrollPositionByTab(tab);
}

// 计算隐藏的 Tab
function updateHiddenTabs() {
  // 如果正在滚动中，不执行检测
  if (isScrolling.value) return;

  const container = tabItemListRef.value;
  if (!container || !tabItemRefs.value) return;
  // 获取容器可视区域边界
  const containerRect = container.getBoundingClientRect();
  const containerLeft = containerRect.left;
  const containerRight = containerRect.right;
  // 保存隐藏tab的详细信息（包括索引）
  const hiddenTabsInfo = tabItemRefs.value
    .map((tabEl, index) => ({ tabEl, index, key: tabEl.getAttribute('data-key') }))
    .filter(({ tabEl }) => {
      const tabRect = tabEl.getBoundingClientRect();
      const isFullyVisible = tabRect.left >= containerLeft && tabRect.right <= containerRight + 1;
      return !isFullyVisible;
    });
  hiddenTabs.value = hiddenTabsInfo.map(({ index }) => layoutStore.tabsList[index]);
  // 检查当前激活的 tab 是否被隐藏
  const isActiveTabHidden = hiddenTabsInfo.some(({ key }) => key === activeTabKey.value);

  // 如果激活的 tab 被隐藏，自动滚动到它的位置
  if (isActiveTabHidden && layoutStore.tabsList.length > 0) {
    const activeTab = layoutStore.tabsList.find((tab) => tab.key === activeTabKey.value);
    if (activeTab) {
      nextTick(() => {
        updateScrollPositionByTab(activeTab);
      });
    }
  }
}

function closeHandler(e, tab) {
  e.stopPropagation();
  removeTabByKey(tab.key);
}

// 监听容器变化
onMounted(() => {
  container = tabItemListRef.value;
  if (!container) return;
  // 使用防抖包装updateHiddenTabs
  const debouncedUpdateHiddenTabs = debounce(updateHiddenTabs, 100);

  resizeObserver = new ResizeObserver(debouncedUpdateHiddenTabs);
  resizeObserver.observe(container);
  container.addEventListener('scroll', () => {
    // 只有不在滚动中时才更新隐藏tabs
    if (!isScrolling.value) {
      updateHiddenTabs();
    }
  });

  updateHiddenTabs(); // 初始计算
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
  if (container) container.removeEventListener('scroll', updateHiddenTabs);
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
          v-for="tab in layoutStore.tabsList"
          :key="tab.key"
          :class="[activeTabKey === tab.key ? 'v-tabs-item-active' : '']"
          :data-key="tab.key"
        >
          <slot name="tab-item" :tab="tab">
            <div class="v-tabs-item-content" @click="tabClickHandler(tab)">
              <div v-if="activeTabKey === tab.key" class="v-tabs-item-content-dot">
                <div class="v-tabs-item-content-dot-inner"></div>
              </div>
              <div class="v-tabs-item-content-name">{{ tab.name }}</div>
              <div v-if="tab.closable" class="v-tabs-item-content-close">
                <div class="v-tabs-item-content-close-icon" @click="(e) => closeHandler(e, tab)">
                  <close-icon></close-icon>
                </div>
              </div>
            </div>
          </slot>
        </div>
      </TransitionGroup>
    </div>
    <slot name="after-extend"></slot>
  </div>
</template>

<style scoped>
.v-tabs {
  display: flex;
  align-items: center;
  height: 42px;
}

.v-tabs-before-extend {
  flex: none;
  padding: 0 4px 0 8px;
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
  background: var(--nm-border-color);
}
.v-tabs-item-content {
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  border: var(--nm-border);
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
  color: var(--nm-color-text-tertiary);
  font-size: 10px;
}
.v-tabs-item-content-close-icon:hover {
  color: var(--nm-color-text);
}

.v-tabs-item-active .v-tabs-item-content,
.v-tabs-item-active:hover .v-tabs-item-content {
  background: var(--nm-primary-color);
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
