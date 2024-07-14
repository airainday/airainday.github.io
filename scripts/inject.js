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

// 修改文章排序按文件名
hexo.extend.filter.register('template_locals', function(locals) {
  locals.site.posts = locals.site.posts.sort((a, b) => {
    if (a.source < b.source) return -1;
    if (a.source > b.source) return 1;
    return 0;
  });
  return locals;
});

