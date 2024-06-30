---
title: fluid -1- 个性化页脚
tags: [hexo,fluid]
categories: [博客网站-Hexo]
date: 2024-06-29 21:08:56
---

## 问题补充Leancloud应用绑定域名无法通过SSL

之前创建的LeanCloud国际版应用由于没有绑定国内域名，国内环境无法访问，导致依赖该应用的功能无法使用，比如网站访客量和访客数，文章浏览数等。

leancloud应用中绑定域名

![image-20240630100116929](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240630100116929.png)

会让你配置DNS，记下CNAME后面的值

![image-20240630100327033](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240630100327033.png)

域名提供商里添加解析

![image-20240630100257964](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240630100257964.png)

DNS配置没问题后，等待部署证书

![image-20240630100853360](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240630100853360.png)

说绑定失败，“查询A和AAA记录时DNSSEC: DNSKEY Missing”。并且VERCEL绑定域名时，验证SSl也失败。**最终发现是绑定的国内域名airianday.top没有备案，最终换了一个备案过的域名rainblog.run，才成功，如下图所示。**

![image-20240630152520662](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240630152520662.png)

绑定成功后要修改之前的服务地址为该域名，比如下面添加网站访问量和访客数，文章浏览数时要添加：

`server_url: https://shuoshuo.rainblog.run`,本来用国际版不写也是可以的，但是国际版的国内要用魔法上网才行，因此国际版绑定备案了的域名后，也要补充server_url的值。

---



本篇文章主要介绍如何个性化备案、网站运行时长、添加访问量和访客数。以下教程基于Fluid主题，主题安装方式是直接用npm安装，安装方式参考：[开始使用 | Hexo Fluid 用户手册 (fluid-dev.com)](https://hexo.fluid-dev.com/docs/start/)。

## 运行时长和个性化备案

效果如下

![image-20240629211459247](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240629211459247.png)

参考链接：[我的 Fluid 主题折腾记录 - Huanlan233's Texts (htext.top)](https://htext.top/post/aaca4077.html)

这里利用Fluid的注入代码的方式来完成上述两个功能，可以先了解一下：[进阶用法 | Hexo Fluid 用户手册 (fluid-dev.com)](https://hexo.fluid-dev.com/docs/advance/#hexo-注入代码)，该方法可以在不改变源码文件情况下修改主题功能。

### 添加运行时长

博客项目根目录下新建文件夹scripts，并新建一个footer.js文件，里面填入下面代码：

```js
hexo.extend.filter.register('theme_inject', function(injects) {
  injects.footer.file('default', 'source/_inject/layout/_partials/footer.ejs');
}
);
```

上述代码含义就是将`source/_inject/layout/_partials/footer.ejs`文件内容完全替换<footer></footer>中的内容，我们只要修改`source/_inject/layout/_partials/footer.ejs`中的内容即可随意定义footer了。

下载[fluid源码](https://github.com/fluid-dev/hexo-theme-fluid/releases)将`layout/_partials/footer.ejs`复制到博客项目根目录`source/_inject/layout/_partials/`文件夹下（没有的目录请新建）。直接复制源码文件是为了保留之前的所有功能，然后我们基于此修改就能添加新的功能了。

在根目录`source`目录内新建文件`js/runtime.js`(没有的目录请新建)，复制下面代码到该文件中（代码来自参考链接）：

```js
var StartTime = new Date('2022/6/5 00:00:00'); // 获取开始时间

function runtime() {
    window.setTimeout("runtime()", 1000);
    var NowTime = new Date(); // 获取现在的时间

    Time = (NowTime.getTime() - StartTime.getTime()) / 1000; // 计算已存活时间(s)

    MaximumUnit = 365 * 24 * 60 * 60; // 最大单位

    Year = Time / MaximumUnit;
    YearINT = Math.floor(Year);

    Month = (Year - YearINT) * 12;
    MonthINT = Math.floor(Month);

    Day = (Month - MonthINT) * (365/12); //平均天数，防止出现过大的偏差
    DayINT = Math.floor(Day);

    Hour = (Day - DayINT) * 24;
    HourINT = Math.floor(Hour);

    Minute = (Hour - HourINT) * 60;
    MinuteINT = Math.floor(Minute);

    Second = Math.floor((Minute - MinuteINT) * 60);


    runtime_span.innerHTML = "本站勉强运行了" + YearINT + "年 " + MonthINT + "月 " + DayINT + "天 " + HourINT + "时 " + MinuteINT + "分 " + Second + "秒";
    // 将数据替换到Span上
};
setInterval("runtime()", 1000); // 重复运行，时刻更新数据
runtime();
```

然后在`footer.ejs`文件内填入以下带+号的代码：

```
<div class="footer-inner">
  <% if (theme.footer.content) { %>
    <div class="footer-content">
      <%- theme.footer.content %>
    </div>
  <% } %>
  <% if (theme.footer.statistics.enable) { %>
    <%- partial('_partials/footer/statistics.ejs') %>
  <% } %>

  +<div class="runtime">
  +  <!-- 网站已运行时间 -->
  +  <span id="runtime_span">加载中...</span>
  +</div>

  <% if(theme.footer.beian.enable) { %>
    <!-- 备案信息 ICP for China -->
    <%- partial('_partials/footer/beian.ejs') %>
  <% } %>
  <% if(theme.web_analytics.cnzz) { %>
    <!-- cnzz Analytics Icon -->
    <span id="cnzz_stat_icon_<%= theme.web_analytics.cnzz %>" style="display: none"></span>
  <% } %>
</div>

```

最后在主题配置文件中（_config_fluid.yml）引入自定义的`runtime.js`文件：

```js
custom_js: # 找到custom_js，添加以下代码
- /js/runtime.js 
```

至此已完成。

### 添加萌备案

和添加运行时间原理一样，不过不用引入自定义的js文件，而是用ejs文件。

新建文件：`source\_inject\layout\_partials\footer\moe_beian.ejs`，填入以下代码：

```ejs
<div class="moe_beian">
    <span>
      <a href="https://icp.gov.moe/" target="_blank" rel="nofollow noopener">
        <%- theme.footer.moe_beian.icp_text %>
      </a>
    </span>
    <% if(theme.footer.moe_beian.moe_text) { %>
      <% if(theme.footer.moe_beian.moe_code) { %>
        <span title="233333">
          <a
            href="https://icp.gov.moe/?keyword=<%= theme.footer.moe_beian.moe_code %>"
            rel="nofollow noopener"
            class="beian-moe"
            target="_blank"
          >
            <% if(theme.footer.moe_beian.moe_icon) { %>
              <span style="visibility: hidden; width: 0">|</span>
              <img src="<%= url_for(theme.footer.moe_beian.moe_icon) %>" alt="moe-icon"/>
            <% } %>
            <span><%- theme.footer.moe_beian.moe_text %></span>
          </a>
        </span>
      <% } else { %>
        <span class="beian-moe">
          <% if(theme.footer.moe_beian.moe_icon) { %>
            <span style="visibility: hidden; width: 0">|</span>
            <img src="<%= url_for(theme.footer.moe_beian.moe_icon) %>" alt="moe-icon"/>
          <% } %>
          <span class="beian-moe"><%- theme.footer.moe_beian.moe_text %></span>
        </span>
      <% } %>
    <% } %>
  </div>
```

在`source\_inject\layout\_partials\footer.ejs`新增以下带+代码：

```js
+<% let dir = process.cwd() %>

<div class="footer-inner">
  <% if (theme.footer.content) { %>
    <div class="footer-content">
      <%- theme.footer.content %>
    </div>
  <% } %>
  <% if (theme.footer.statistics.enable) { %>
    <%- partial('_partials/footer/statistics.ejs') %>
  <% } %>

  <div class="runtime">
    <!-- 网站已运行时间 -->
    <span id="runtime_span">加载中...</span>
  </div>

  <% if(theme.footer.beian.enable) { %>
    <!-- 备案信息 ICP for China -->
    <%- partial('_partials/footer/beian.ejs') %>
  <% } %>
  <% if(theme.web_analytics.cnzz) { %>
    <!-- cnzz Analytics Icon -->
    <span id="cnzz_stat_icon_<%= theme.web_analytics.cnzz %>" style="display: none"></span>
  <% } %>

  +<% if(theme.footer.moe_beian.enable) { %>
  + <!-- 备案信息 ICP for Moe -->
  + <%- include(dir + '/source/_inject/layout/_partials/footer/moe_beian.ejs') %>
  +<% } %>
</div>
```

主题配置文件中在footer下添加以下代码，需要自行修改moe的个性化信息

```yml
footer # 找到footer，在下面添加以下代码即可
    # 好玩的备案
      moe_beian:
        enable: true
        icp_text: 
        moe_text: 萌ICP备20240531号
        moe_code: 20240531
        moe_icon: /img/moe_beian.png
```

下载[moe图标](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/icon120.png)放在`/img/moe_beian.png`下。可以用该工具修改图标大小：[iLoveIMG | 图像文件在线编辑工具](https://www.iloveimg.com/zh-cn)。

## 网站访问量和访客数、文章浏览数

参考官方教程：[配置指南 | Hexo Fluid 用户手册 (fluid-dev.com)](https://hexo.fluid-dev.com/docs/guide/#展示-pv-与-uv-统计)

这里用LeanCloud国际版来实现，需要自己先注册账号。

Leancloud新建一个应用：[LeanCloud](https://console.leancloud.app/apps)。

在主题配置中找到`web_analytics:  # 网页访问统计`，修改以下配置：

```yml
web_analytics:  # 网页访问统计
  enable: true
  
  leancloud:
    app_id: 你新建应用的app_id
    app_key: 你新建应用的app_key
    # REST API 服务器地址，国际版不填
    # Only the Chinese mainland users need to set
    server_url:
    # 统计页面时获取路径的属性
    # Get the attribute of the page path during statistics
    path: window.location.pathname
    # 开启后不统计本地路径( localhost 与 127.0.0.1 )
    # If true, ignore localhost & 127.0.0.1
    ignore_local: true 
```

找到footer下的statistics配置，修改以下配置：

```yml
  statistics:
    enable: true
    source: "leancloud"
    pv_format: "总访问量 {} 次"
    uv_format: "总访客数 {} 人"  
```

效果如下：

![image-20240629220535866](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240629220535866.png)



找到post的meta的views，修改以下配置，成功后会在每个文章中展示该文章浏览人数。

```yml
post:
	meta:
        views:
          enable: true
          # 统计数据来源
          # Data Source
          # Options: busuanzi | leancloud
          source: "leancloud"
```

效果如下：

![image-20240629220643606](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240629220643606.png)





