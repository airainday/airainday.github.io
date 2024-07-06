---
title: fluid-4-随机更换背景图片
tags: [hexo,fluid]
categories: [Hexo]
category_bar: true
date: 2024-07-04 14:07:37
---

## 思路

和之前个性化页脚一样，采用代码注入的方式。

先定位到背景图片在哪个网页元素中（F12调试），最终定位到是在header的banner中，banner的css属性background中用到了背景图片：

```html
<div id="banner" class="banner" data-title="<%= img_names %>" <%- theme.banner && theme.banner.parallax && 'parallax=true' %>
     style="background: url('<%- url_for(banner_img) %>') no-repeat center center; background-size: cover;">
```

我们要对background的url值进行修改，只要让每次页面刷新时能够执行一段js代码修改该url值即可。可以采用代码注入的方式，将js代码注入到Fluid主题提供的banner中，而代码注入不能直接注入到banner这一节点，所以我们选择注入header.ejs文件整体替换header中的内容，在header.ejs中注入修改后的banner.ejs即可。具体操作如下：

主题根目录的scripts文件夹下（没有scripts的请新建）新建一个名为header.js的文件，内容如下：

```js
const { root: siteRoot = "/" } = hexo.config;

hexo.extend.injector.register("body_begin", `<div id="web_bg"></div>`);

hexo.extend.filter.register('theme_inject', function(injects) {
    injects.header.file('default', 'source/_inject/layout/_partials/header.ejs', { img_names: 'value' });
  }
  );
```

第三行代码直接将`<div id="web_bg"></div>`注入到body标签开始位置，这个用于后续修改背景图片为全图，具体效果见[AIrainday (rainblog.run)](https://rainblog.run/)。

将Fluid主题文件（到官网下载）中`layout\_partials\header.js`放在博客项目根目录下的`source/_inject/layout/_partials/header.ejs`。

并修改内容如下：

```ejs
<% let dir = process.cwd() %>
<%
var banner_img_height = parseFloat(page.banner_img_height || theme.index.banner_img_height)
%>

<div class="header-inner" style="height: <%= banner_img_height %>vh;">
  <%- partial('_partials/header/navigation') %>
  <!-- <%- partial('_partials/header/banner') %> -->
  <%- include(dir + '/source/_inject/layout/_partials/header/banner.ejs',{img_names: 'value'}) %>
</div>
```

我们将自定义的banner.ejs替换header中原始的banner.ejs，然后新建文件`source/_inject/layout/_partials/header/banner.ejs`，写上想修改的内容即可，内容如下：

```ejs
<%
var banner_img = page.banner_img || theme.index.banner_img
var banner_img_height = parseFloat(page.banner_img_height || theme.index.banner_img_height)
var banner_mask_alpha = parseFloat(page.banner_mask_alpha || theme.index.banner_mask_alpha)
var subtitle = page.subtitle || page.title
%>

<div id="banner" class="banner" data-title="<%= img_names %>" <%- theme.banner && theme.banner.parallax && 'parallax=true' %>
     style="background: url('<%- url_for(banner_img) %>') no-repeat center center; background-size: cover;">
  <div class="full-bg-img">
    <div class="mask flex-center" style="background-color: rgba(0, 0, 0, <%= parseFloat(banner_mask_alpha) %>)">
      <div class="banner-text text-center fade-in-up">
        <div class="h2">
          <% if(theme.fun_features.typing.enable && in_scope(theme.fun_features.typing.scope)) { %>
            <span id="subtitle" data-typed-text="<%= subtitle %>"></span>
          <% } else { %>
            <span id="subtitle"><%- subtitle %></span>
          <% } %>
        </div>

        <% if (is_post()) { %>
          <%- inject_point('postMetaTop') %>
        <% } %>
      </div>

      <% if (theme.scroll_down_arrow.enable && theme.scroll_down_arrow.banner_height_limit <= banner_img_height && page.layout !== '404') { %>
        <div class="scroll-down-bar">
          <i class="iconfont icon-arrowdown"></i>
        </div>
      <% } %>
    </div>
  </div>
</div>

<script>
  function getRandomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var randomNum = getRandomNumber(0, 3).toString();

var img_names = document.getElementById('banner').getAttribute('data-title');

var banner_img = "/img/rain-random-bg/0" + randomNum + ".jpg";
document.getElementById('banner').removeAttribute('style')

document
  .querySelector('#web_bg')
  .setAttribute('style', `background: url('${banner_img}'); position: fixed; width: 100%;height: 100%; z-index: -1; background-size: cover;`);
  
document
  .querySelector("#banner .mask")
  .setAttribute('style', 'background-color:rgba(0,0,0,0)')

</script>
```

该文件是在主题文件`layout\_partials\header\banner.ejs`基础上修改的，主要添加了一段js代码来提供更换背景图片的功能。

最后只要将事先准备好的图像放在一个文件夹中，这里放在了`rain-random-bg`中，然后修改文件名统一为00.jpg,01.jpg...，比如你最多是010.jpg，修改第42行代码`var randomNum = getRandomNumber(0, 3).toString();`中的3为10即可。

最后将`rain-random-img`文件夹放在`source/img`内即可。依次执行`hexo clean、 hexo g、 hexo s`可以看到效果。

上面只引入了全图背景，关于其中css的样式修改会在下一篇文章中详解。

**不好的是每次添加图片到rain-random-bg文件夹中，都要手动修改文件名和最大索引，后续会改善一下。**

## 参考

[Hexo_Fluid随机背景图实现 - 木木困玉光 (linguoguang.com)](https://linguoguang.com/2023/05/10/Hexo_Fluid随机背景图实现/)
