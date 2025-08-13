import container from 'markdown-it-container';
import { extractTitle } from './pre-wrapper';

export const containerPlugin = (md, options) => {
  md.use(...createContainer('tip', options?.tipLabel || 'TIP', md))
    .use(...createContainer('info', options?.infoLabel || 'INFO', md))
    .use(...createContainer('warning', options?.warningLabel || 'WARNING', md))
    .use(...createContainer('danger', options?.dangerLabel || 'DANGER', md))
    .use(...createContainer('details', options?.detailsLabel || 'Details', md))
    // explicitly escape Vue syntax
    .use(container, 'v-pre', {
      render: (tokens, idx) =>
        tokens[idx].nesting === 1 ? `<div v-pre>\n` : `</div>\n`,
    })
    .use(container, 'raw', {
      render: (tokens, idx) =>
        tokens[idx].nesting === 1 ? `<div class="vp-raw">\n` : `</div>\n`,
    })
    .use(...createCodeGroup(md));
};

function createContainer(klass, defaultTitle, md) {
  return [
    container,
    klass,
    {
      render(tokens, idx, _options, env) {
        const token = tokens[idx];
        if (token.nesting === 1) {
          token.attrJoin('class', `${klass} custom-block`);
          const attrs = md.renderer.renderAttrs(token);
          const info = token.info.trim().slice(klass.length).trim();
          const title = md.renderInline(info || defaultTitle, {
            references: env.references,
          });
          const titleClass =
            'custom-block-title' + (info ? '' : ' custom-block-title-default');
          if (klass === 'details')
            return `<details ${attrs}><summary>${title}</summary>\n`;
          return `<div ${attrs}><p class="${titleClass}">${title}</p>\n`;
        } else return klass === 'details' ? `</details>\n` : `</div>\n`;
      },
    },
  ];
}

function createCodeGroup(md) {
  return [
    container,
    'code-group',
    {
      render(tokens, idx) {
        if (tokens[idx].nesting === 1) {
          let tabs = '';
          let checked = 'checked';

          for (
            let i = idx + 1;
            !(
              tokens[i].nesting === -1 &&
              tokens[i].type === 'container_code-group_close'
            );
            ++i
          ) {
            const isHtml = tokens[i].type === 'html_block';

            if (
              (tokens[i].type === 'fence' && tokens[i].tag === 'code') ||
              isHtml
            ) {
              const title = extractTitle(
                isHtml ? tokens[i].content : tokens[i].info,
                isHtml
              );

              if (title) {
                tabs += `<input type="radio" name="group-${idx}" id="tab-${i}" ${checked}><label data-title="${md.utils.escapeHtml(
                  title
                )}" for="tab-${i}">${title}</label>`;

                if (checked && !isHtml) tokens[i].info += ' active';
                checked = '';
              }
            }
          }

          return `<div class="vp-code-group"><div class="tabs">${tabs}</div><div class="blocks">\n`;
        }
        return `</div></div>\n`;
      },
    },
  ];
}
