const { root: siteRoot = "/" } = hexo.config;

hexo.extend.injector.register("body_begin", `<div id="web_bg"></div>`);

hexo.extend.filter.register('theme_inject', function(injects) {
    injects.header.file('default', 'source/_inject/layout/_partials/header.ejs', { img_names: 'value' });
  }
  );
