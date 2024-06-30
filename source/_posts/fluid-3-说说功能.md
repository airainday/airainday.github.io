---
title: fluid -3- 说说功能
tags: [hexo,fluid]
categories: [博客网站-Hexo]
date: 2024-06-30 15:33:15
---

## 创建应用并使用artitalk

说说功能可以给博客开辟一个吐槽的地方，可以自己给自己留言，每天记录反省的内容等等。
参考文章：[明眸如初 (zywvvd.com)](https://www.zywvvd.com/notes/hexo/theme/fluid/fluid-shuoshuo/fluid-shuoshuo/)
利用leancloud和artitalk来启用此功能，下面主要是记录leancloud域名绑定时的疑惑，也就是文章的第10步：

1. leancloud中点击绑定域名，域名填写比如shuoshuo.airainday.top(购买的域名前面加上自定的文字即可)
2. 购买的域名服务商那里添加一个记录，我的是阿里云买的域名，记录填写内容如下，将leancloud提供的CNAME值填写到记录中的记录值即可
![image.png|600](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/20240628214406.png)

等待DNS解析成功，不过出现发送证书失败，还是和之前问题一样：**国际版其实不绑定域名也能用，但是只能在国外网络环境中访问，国内无法访问，必须绑定一个备案后的域名才行，由于这里绑定的域名没有备案，因此会出现申请证书失败的错误。**

![image.png|600](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/20240629130333.png)

**不绑定域名时**

我们按照这里创建好应用，不绑定域名，然后在博客目录的source文件夹中建一个shuoshuo文件夹，里面新建index.html文件（和创建about页面一样）。接着填入下面内容即可。不用绑定域名（国际版不用填写serverURL）
```html
---
title: 雨天语录
date: 2024-01-14 18:19:19
type: "shuoshuo"
layout: "shuoshuo"
comments: true

---

<!-- 引用 artitalk -->

<script type="text/javascript" src="https://unpkg.com/artitalk"></script>

<!-- 存放说说的容器 -->

<div id="artitalk_main"></div>
<script>
new Artitalk({
    // serverURL: 'https://shuoshuo.zywvvd.com',
    appId: '**',
    appKey: '**'
})
</script>
```

**绑定域名（国内已备案的域名才行）**

绑定域名rainblog.run，然后和上面一样域名服务商添加CNAME解析地址。

复制服务器地址，如下所示：

![image-20240630210425856](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240630210425856.png)

然后和上面一样，博客根目录下新建一个shuoshuo文件夹，新建一个index.html文件，写入以下内容。和不绑定国内备案域名的区别就是多填了一个serverURL。

```html
---
title: 雨天语录
date: 2024-01-14 18:19:19
type: "shuoshuo"
layout: "shuoshuo"
comments: true

---

<!-- 引用 artitalk -->

<script type="text/javascript" src="https://unpkg.com/artitalk"></script>

<!-- 存放说说的容器 -->

<div id="artitalk_main"></div>
<script>
new Artitalk({
    serverURL: 'https://shuoshuo.rainblog.run',
    appId: '**',
    appKey: '**'
})
</script>
```

## 创建shuoshuo入口

我们前面已经创建好了shuoshuo的页面，只要在导航栏中添加一个链接作为shuoshuo页面入口即可。

在主题配置文件中，找到menu，写入以下内容（语录对应的就是shuoshuo页面的入口）。

```yml
  menu:
    - { key: "home", link: "/", icon: "iconfont icon-home-fill" }
    - { key: "文章", 
        link: "/", 
        icon: "iconfont icon-books",
        submenu: [
        { key: "archive", link: "/archives/", icon: "iconfont icon-archive-fill" },
        { key: "category", link: "/categories/", icon: "iconfont icon-category-fill" },
        { key: "tag", link: "/tags/", icon: "iconfont icon-tags-fill" }
      ]
      }
    - { key: "语录", link: "/shuoshuo", icon: "iconfont icon-note" }
    - { key: "about", link: "/about/", icon: "iconfont icon-user-fill" }
```

