import { ref } from 'vue';

export function useClipboard() {
  const isCopied = ref(false);
  const error = ref(null);

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      isCopied.value = true;
      error.value = null;
      setTimeout(() => (isCopied.value = false), 2000);
    } catch (err) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        isCopied.value = true;
        setTimeout(() => (isCopied.value = false), 2000);
        error.value = null;
      } catch (fallbackErr) {
        error.value = '复制失败，请手动复制';
        setTimeout(() => (error.value = null), 2000);
      }
    }
  }

  return { copy, isCopied, error };
}
