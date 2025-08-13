function isExternal(path) {
  return /^(?:[a-z]+:|\/\/)/i.test(path);
}

export const linkPlugin = (md, externalAttrs) => {
  md.renderer.rules.link_open = (tokens, idx, _options, _env, self) => {
    const token = tokens[idx];
    const hrefIndex = token.attrIndex('href');

    if (
      hrefIndex >= 0 &&
      token.attrIndex('target') < 0 &&
      token.attrIndex('download') < 0
    ) {
      const url = token.attrs[hrefIndex][1];
      if (isExternal(url)) {
        Object.entries(externalAttrs).forEach(([k, v]) => token.attrSet(k, v));
      }
    }
    return self.renderToken(tokens, idx, _options);
  };
};
