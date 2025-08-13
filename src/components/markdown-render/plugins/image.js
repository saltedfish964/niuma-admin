// markdown-it plugin for normalizing image source
const EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i;

export const imagePlugin = (md, { lazyLoading } = {}) => {
  const imageRule = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    let url = token.attrGet('src');
    if (url && !EXTERNAL_URL_RE.test(url)) {
      if (!/^\.?\//.test(url)) url = './' + url;
      token.attrSet('src', decodeURIComponent(url));
    }
    if (lazyLoading) {
      token.attrSet('loading', 'lazy');
    }
    return imageRule(tokens, idx, options, env, self);
  };
};
