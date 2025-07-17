import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('');

    function getToken() {
      return token.value;
    }

    function setToken(value) {
      token.value = value;
    }

    function $reset() {
      token.value = '';
    }

    return {
      token,
      getToken,
      setToken,
      $reset,
    };
  },
  {
    persist: {
      storage: sessionStorage,
    },
  },
);
