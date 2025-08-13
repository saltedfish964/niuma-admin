import MarkdownItAsync from 'markdown-it-async';
import attrsPlugin from 'markdown-it-attrs';
import { full as emojiPlugin } from 'markdown-it-emoji';
import anchorPlugin from 'markdown-it-anchor';
import { slugify as defaultSlugify } from '@mdit-vue/shared';
import { highlight as createHighlighter } from './plugins/highlight';
import { highlightLinePlugin } from './plugins/highlight-lines';
import { preWrapperPlugin } from './plugins/pre-wrapper';
import { containerPlugin } from './plugins/containers';
import { imagePlugin } from './plugins/image';
import { linkPlugin } from './plugins/link';
import { lineNumberPlugin } from './plugins/line-numbers';
import { gitHubAlertsPlugin } from './plugins/github-alerts';
import { restoreEntities } from './plugins/restore-entities';

let md;
let _disposeHighlighter;

export function disposeMdItInstance() {
  if (md) {
    md = undefined;
    _disposeHighlighter?.();
  }
}

/**
 * 创建并返回一个功能增强的 markdown-it 渲染器实例。
 *
 * 该函数是异步的，第一次调用时会完成所有插件的注册与配置；
 * 后续调用会直接返回已创建的实例。可通过 `disposeMdItInstance`
 * 手动销毁当前实例，以便在开发热重载等场景重新创建。
 *
 * @async
 * @function createMarkdownRenderer
 * @param {object} [options={}] 配置项
 * @param {object} [options.theme] 代码高亮主题
 * @param {string} [options.theme.light='github-light'] 亮色主题
 * @param {string} [options.theme.dark='github-dark']  暗色主题
 * @param {string} [options.codeCopyButtonTitle='Copy Code'] 代码块复制按钮的 title
 * @param {boolean} [options.lineNumbers=false] 是否在代码块左侧显示行号
 * @param {boolean} [options.gfmAlerts=true] 是否启用 GitHub Flavored Markdown 提示块（> [!NOTE] 等）
 * @param {boolean|object} [options.math=false] 是否启用数学公式支持；为对象时可传入 markdown-it-mathjax3 的配置
 * @param {Function} [options.highlight] 自定义代码高亮函数；不传入则使用内置实现
 * @param {object} [options.attrs] markdown-it-attrs 插件配置；传入 `{ disable: true }` 可禁用
 * @param {object} [options.emoji] markdown-it-emoji 插件配置
 * @param {object} [options.anchor] markdown-it-anchor 插件配置
 * @param {object} [options.externalLinks] 外链 `<a>` 标签属性配置；默认 `{ target:'_blank', rel:'noreferrer' }`
 * @param {Function} [options.preConfig] 插件注册**前**执行的异步配置钩子 `(md: MarkdownIt) => Promise<void>`
 * @param {Function} [options.config] 插件注册**后**执行的异步配置钩子 `(md: MarkdownIt) => Promise<void>`
 * @param {object} [options.container] containerPlugin 的额外配置
 * @param {object} [options.image] imagePlugin 的额外配置
 * @param {Console} [logger=console] 日志对象；用于输出高亮初始化等调试信息
 * @returns {Promise<import('markdown-it-async').default>} 已配置好的 markdown-it-async 实例
 * @throws {Error} 当启用数学公式但缺少 `markdown-it-mathjax3` 依赖时抛出
 *
 * @example
 * import { createMarkdownRenderer } from './markdown.js';
 *
 * (async () => {
 *   const md = await createMarkdownRenderer({
 *     theme: { light: 'github-light', dark: 'github-dark' },
 *     lineNumbers: true,
 *     math: true,
 *   });
 *
 *   const html = md.render('# Hello\n\n$$E = mc^2$$');
 *   console.log(html);
 * })();
 */
export async function createMarkdownRenderer(options = {}, logger = console) {
  if (md) return md;
  const theme = options.theme ?? { light: 'github-light', dark: 'github-dark' };
  const codeCopyButtonTitle = options.codeCopyButtonTitle || 'Copy Code';

  let [highlight, dispose] = options.highlight
    ? [options.highlight, () => {}]
    : await createHighlighter(theme, options, logger);

  _disposeHighlighter = dispose;

  md = new MarkdownItAsync({
    html: true,
    linkify: true,
    highlight,
    ...options,
  });

  md.linkify.set({ fuzzyLink: false });
  md.use(restoreEntities);

  if (options.preConfig) {
    await options.preConfig(md);
  }

  const slugify = options.anchor?.slugify ?? defaultSlugify;

  // custom plugins
  md.use(highlightLinePlugin)
    .use(preWrapperPlugin, { codeCopyButtonTitle })
    .use(containerPlugin, options.container)
    .use(imagePlugin, options.image)
    .use(linkPlugin, {
      target: '_blank',
      rel: 'noreferrer',
      ...options.externalLinks,
    })
    .use(lineNumberPlugin, options.lineNumbers);

  const tableOpen = md.renderer.rules.table_open;
  md.renderer.rules.table_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    if (token.attrIndex('tabindex') < 0) token.attrPush(['tabindex', '0']);
    return tableOpen
      ? tableOpen(tokens, idx, options, env, self)
      : self.renderToken(tokens, idx, options);
  };

  if (options.gfmAlerts !== false) {
    md.use(gitHubAlertsPlugin, options.container);
  }

  // third party plugins
  if (!options.attrs?.disable) {
    md.use(attrsPlugin, options.attrs);
  }
  md.use(emojiPlugin, { ...options.emoji });

  // mdit-vue plugins
  md.use(anchorPlugin, {
    slugify,
    getTokensText: (tokens) => {
      return tokens
        .filter((t) => !['html_inline', 'emoji'].includes(t.type))
        .map((t) => t.content)
        .join('');
    },
    permalink: (slug, _, state, idx) => {
      const title =
        state.tokens[idx + 1]?.children
          ?.filter((token) => ['text', 'code_inline'].includes(token.type))
          .reduce((acc, t) => acc + t.content, '')
          .trim() || '';

      const linkTokens = [
        Object.assign(new state.Token('text', '', 0), { content: ' ' }),
        // 标题的锚点
        // Object.assign(new state.Token('link_open', 'a', 1), {
        //   attrs: [
        //     ['class', 'header-anchor'],
        //     ['href', `#${slug}`],
        //     ['aria-label', `Permalink to “${title}”`],
        //   ],
        // }),
        Object.assign(new state.Token('html_inline', '', 0), {
          content: '&#8203;',
          meta: { isPermalinkSymbol: true },
        }),
        new state.Token('link_close', 'a', -1),
      ];

      state.tokens[idx + 1].children?.push(...linkTokens);
    },
    ...options.anchor,
  });

  if (options.math) {
    try {
      const mathPlugin = await import('markdown-it-mathjax3');
      md.use(mathPlugin.default ?? mathPlugin, {
        ...(typeof options.math === 'boolean' ? {} : options.math),
      });
      const origMathInline = md.renderer.rules.math_inline;
      md.renderer.rules.math_inline = function (...args) {
        return origMathInline
          .apply(this, args)
          .replace(/^<mjx-container /, '<mjx-container v-pre ');
      };
      const origMathBlock = md.renderer.rules.math_block;
      md.renderer.rules.math_block = function (...args) {
        return origMathBlock
          .apply(this, args)
          .replace(/^<mjx-container /, '<mjx-container v-pre tabindex="0" ');
      };
    } catch (error) {
      throw new Error(
        'You need to install `markdown-it-mathjax3` to use math support.'
      );
    }
  }

  // apply user config
  if (options.config) {
    await options.config(md);
  }

  return md;
}
