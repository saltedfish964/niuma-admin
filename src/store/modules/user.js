import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref({
      name: 'NiuMa',
    });

    return { userInfo };
  },
  {
    persist: true,
  },
);
