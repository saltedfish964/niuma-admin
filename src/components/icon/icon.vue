<script setup>
import { ref, shallowRef, computed, defineAsyncComponent, watch } from 'vue';
import { Tooltip as ATooltip } from 'ant-design-vue';
import iconList from 'virtual:niuma-icon-loader';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  spin: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
  },
  size: {
    type: [Number, String],
    default: 16,
  },
  cache: {
    type: Boolean,
    default: true,
  },
});

const iconComponent = shallowRef(null);
const loadedComponent = ref(false);
const isError = ref(false);
const errorMessage = ref('');

// 缓存机制
const componentCache = new Map();

// 解析图标名称（示例：mdi-icon-account → { type: 'mdi', name: 'account' }）
const parsedName = computed(() => {
  const [type, ...parts] = props.name.split('-icon-');
  return {
    type,
    name: parts.join('-'),
  };
});

const iconClasses = computed(() => ({
  'v-icon-spin': props.spin,
}));

const iconStyles = computed(() => ({
  color: props.color,
  fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
}));

function loadIconComponent() {
  try {
    const { type, name } = parsedName.value;
    const cacheKey = `${type}-icon-${name}`;
    // 检查缓存
    if (props.cache && componentCache.has(cacheKey)) {
      iconComponent.value = componentCache.get(cacheKey);
      return;
    }
    const icon = iconList.find((item) => item.name === `${type}:${name}`);
    if (!icon) {
      throw new Error('name 错误');
    }
    let component = defineAsyncComponent(icon.component);
    // 缓存组件
    if (props.cache) {
      componentCache.set(cacheKey, component);
    }
    iconComponent.value = component;
    loadedComponent.value = true;
  } catch (error) {
    loadedComponent.value = false;
    isError.value = true;
    errorMessage.value = error.message;
  }
}

watch(() => props.name, loadIconComponent, { immediate: true });
</script>

<template>
  <span class="v-icon-wrapper">
    <component
      v-if="loadedComponent"
      :is="iconComponent"
      :class="iconClasses"
      :style="iconStyles"
    />
    <span v-else-if="isError" class="v-icon-error">
      <slot name="error">
        <a-tooltip>
          <template #title>{{ errorMessage }}</template>
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m-1-4h2V7h-2zm1 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"
            />
          </svg>
        </a-tooltip>
      </slot>
    </span>
    <span v-else class="v-icon-loading">
      <slot name="loading">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024">
          <path
            fill="currentColor"
            d="M988 548c-19.9 0-36-16.1-36-36c0-59.4-11.6-117-34.6-171.3a440.5 440.5 0 0 0-94.3-139.9a437.7 437.7 0 0 0-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150s83.9 101.8 109.7 162.7c26.7 63.1 40.2 130.2 40.2 199.3c.1 19.9-16 36-35.9 36"
          />
        </svg>
      </slot>
    </span>
  </span>
</template>

<style scoped>
.v-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.v-icon-error {
  border: 1px solid #ff4444;
  border-radius: 4px;
  color: transparent;
}
.v-icon-loading {
  animation: spin 1s linear infinite;
}
.v-icon-spin {
  animation: spin 2s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
