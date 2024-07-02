hexo.extend.filter.register('theme_inject', function(injects) {
  injects.footer.file('default', 'source/_inject/layout/_partials/footer.ejs');
}
);

