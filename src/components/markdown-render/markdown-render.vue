<script setup lang="js">
import { nextTick, onBeforeMount, onMounted, ref, watch } from 'vue';
import { createMarkdownRenderer } from './markdown.js';
import LoadingPlaceholder from './loading.vue';
import './styles/fonts.css';
import './styles/vars.css';
import './styles/base.css';
import './styles/icons.css';
import './styles/utils.css';
import './styles/components/custom-block.css';
import './styles/components/vp-code.css';
import './styles/components/vp-code-group.css';
import './styles/components/vp-doc.css';
import './styles/components/vp-sponsor.css';

const props = defineProps({
  mdText: {
    type: String,
    default: '',
  },
  dark: {
    type: Boolean,
    default: false,
  },
});

const htmlText = ref('');

function onCodeGroupTabsClick(e) {
  const el = e.target;

  if (el.matches('.vp-code-group input')) {
    // input <- .tabs <- .vp-code-group
    const group = el.parentElement?.parentElement;
    if (!group) return;

    const i = Array.from(group.querySelectorAll('input')).indexOf(el);
    if (i < 0) return;

    const blocks = group.querySelector('.blocks');
    if (!blocks) return;

    const current = Array.from(blocks.children).find((child) => child.classList.contains('active'));
    if (!current) return;

    const next = blocks.children[i];
    if (!next || current === next) return;

    current.classList.remove('active');
    next.classList.add('active');

    const label = group?.querySelector(`label[for="${el.id}"]`);
    label?.scrollIntoView({ block: 'nearest' });
  }
}

const shellRE = /language-(shellscript|shell|bash|sh|zsh)/;
const ignoredNodes = ['.vp-copy-ignore', '.diff.remove'].join(', ');
const timeoutIdMap = new WeakMap();
async function copyToClipboard(text) {
  try {
    return navigator.clipboard.writeText(text);
  } catch {
    const element = document.createElement('textarea');
    const previouslyFocusedElement = document.activeElement;

    element.value = text;

    // Prevent keyboard from showing on mobile
    element.setAttribute('readonly', '');

    element.style.contain = 'strict';
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.fontSize = '12pt'; // Prevent zooming on iOS

    const selection = document.getSelection();
    const originalRange = selection ? selection.rangeCount > 0 && selection.getRangeAt(0) : null;

    document.body.appendChild(element);
    element.select();

    // Explicit selection workaround for iOS
    element.selectionStart = 0;
    element.selectionEnd = text.length;

    document.execCommand('copy');
    document.body.removeChild(element);

    if (originalRange) {
      selection.removeAllRanges(); // originalRange can't be truthy when selection is falsy
      selection.addRange(originalRange);
    }

    // Get the focus back on the previously focused element, if any
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }
  }
}
function onCodeCopy(e) {
  const el = e.target;
  if (el.matches('div[class*="language-"] > button.copy')) {
    const parent = el.parentElement;
    const sibling = el.nextElementSibling?.nextElementSibling; // <pre> tag
    if (!parent || !sibling) {
      return;
    }

    const isShell = shellRE.test(parent.className);

    // Clone the node and remove the ignored nodes
    const clone = sibling.cloneNode(true);
    clone.querySelectorAll(ignoredNodes).forEach((node) => node.remove());
    // remove extra newlines left after removing ignored nodes (affecting textContent because it is inside `<pre>`)
    // doesn't affect the newlines already in the code because they are rendered as `\n<span class="line"></span>`
    clone.innerHTML = clone.innerHTML.replace(/\n+/g, '\n');

    let text = clone.textContent || '';

    if (isShell) {
      text = text.replace(/^ *(\$|>) /gm, '').trim();
    }

    copyToClipboard(text).then(() => {
      el.classList.add('copied');
      clearTimeout(timeoutIdMap.get(el));
      const timeoutId = setTimeout(() => {
        el.classList.remove('copied');
        el.blur();
        timeoutIdMap.delete(el);
      }, 2000);
      timeoutIdMap.set(el, timeoutId);
    });
  }
}

async function updateHtmlClassByDark() {
  props.dark
    ? document.documentElement.classList.add('dark')
    : document.documentElement.classList.remove('dark');
}

async function getMd() {
  return await createMarkdownRenderer({
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    codeCopyButtonTitle: '复制代码',
    lineNumbers: true,
    gfmAlerts: true,
    math: true, // 需要安装 markdown-it-mathjax3
  });
}

async function updateHtmlText() {
  const md = await getMd();
  htmlText.value = await md.renderAsync(props.mdText);
  await nextTick();
  document.removeEventListener('click', onCodeGroupTabsClick);
  document.removeEventListener('click', onCodeCopy);
  document.addEventListener('click', onCodeGroupTabsClick);
  document.addEventListener('click', onCodeCopy);
}

watch(() => props.dark, updateHtmlClassByDark, { immediate: true });

onMounted(() => {
  updateHtmlText();
});

onBeforeMount(() => {
  document.removeEventListener('click', onCodeGroupTabsClick);
  document.removeEventListener('click', onCodeCopy);
});
</script>

<template>
  <div>
    <div v-if="htmlText" class="markdown-render" dir="ltr" lang="zh">
      <div class="vp-doc" v-html="htmlText"></div>
    </div>
    <loading-placeholder v-else></loading-placeholder>
  </div>
</template>
