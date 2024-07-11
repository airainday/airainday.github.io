const { root: siteRoot = "/" } = hexo.config;
// header相关内容
hexo.extend.injector.register("body_begin", `<div id="web_bg"></div>`);

hexo.extend.filter.register('theme_inject', function(injects) {
    injects.header.file('default', 'source/_inject/layout/_partials/header.ejs', { img_names: 'value' });
  }
  );

// footer相关内容
hexo.extend.filter.register('theme_inject', function(injects) {
injects.footer.file('default', 'source/_inject/layout/_partials/footer.ejs');
}
);

// course页面内容

