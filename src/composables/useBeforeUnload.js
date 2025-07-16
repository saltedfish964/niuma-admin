import { onMounted, onUnmounted } from 'vue';

export function useBeforeUnload(handler) {
  onMounted(() => {
    window.addEventListener('beforeunload', handler);
  });

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handler);
  });
}
