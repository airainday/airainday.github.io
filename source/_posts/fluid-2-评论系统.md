---
title: fluid -2- 评论系统
tags: [hexo,fluid]
categories: [博客网站-Hexo]
date: 2024-06-30 07:43:33
---

本来用的评论系统是 [utteranc.es](https://utteranc.es/)，但是功能有点少，因此换成Waline。

>Waline 是一款基于 Valine 衍生的简洁、安全的评论系统。
>
>- 官网链接：[https://waline.js.org/](https://www.zywvvd.com/pages/go.html?goUrl=https%3A%2F%2Fwaline.js.org%2F)
>- 相对于 Valine 有一些后天的优势：
>
>| 优势         | 描述                                                    |
>| ------------ | ------------------------------------------------------- |
>| 自由评论     | 完全的 Markdown 支持，同时包含表情、数学公式、HTML 嵌入 |
>| 轻量         | 54kB gzip 的完整客户端大小                              |
>| 强大的安全性 | 内容校验、防灌水、保护敏感数据等                        |
>| 登录支持     | 在允许匿名评论的基础上，支持账号注册，保持身份          |
>| 完全免费部署 | 可免费部署在 Vercel 上                                  |
>| 易于部署     | 多种部署部署方式和存储服务支持                          |

下面是具体的应用步骤。

## LeanCloud创建应用

建议用国际版，不用绑定域名。创建应用选择免费的开发版本即可。

进入应用，选择左下角的 `设置` > `应用 Key`。你可以看到你的 `APP ID`,`APP Key` 和 `Master Key`，后续会用到这三个值。

## Vercel部署

vercel链接：[New Project – Vercel](https://vercel.com/new/airaindays-projects/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwalinejs%2Fwaline%2Ftree%2Fmain%2Fexample)

点击上方链接，跳转至 Vercel 进行 Server 端部署。

如果你未登录的话，Vercel 会让你注册或登录，请使用 GitHub 账户进行快捷登录。

输入一个你喜欢的 Vercel 项目名称并点击 `Create` 继续:

![image-20240630084101726](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240630084101726.png)

等待一会，出现满屏散花就说明部署成功了。点击Dashboard进入控制面板。

![image-20240630084212037](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240630084212037.png)

点击顶部的`Settings->Environment Variables`进入环境变量配置页，并配置三个环境变量`LEAN_ID`，`LEAN_KEY`和 `LEAN_MASTER_KEY`，它们的值分别对应上一步在LeanCloud中获得的`APP ID`，`APP KEY`，`Master Key`，记得点击右下角`Save`

![image-20240630084912832](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240630084912832.png)

环境变量配置完成后，点击顶部`Deployments`，进行`Redeploy`，使配置生效

![image-20240630085027551](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240630085027551.png)

重新部署完成后，点击`Visit`即可访问Waline服务端地址

在该页面点击`Login`，弹框页面则为服务端的登录地址，可在此注册和登录

![image-20240630085609684](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240630085609684.png)

亦可以通过`评论系统地址/ui`或是登录过后点击自己的头像进入应用的管理页面。

依次点击`Settings`,`Domains`，复制服务地址，后面需要用到

![image-20240630092117472](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240630092117472.png)

## Hexo Fluid主题中使用Waline评论系统

修改主题配置文件：

1.修改`comments`配置项

```yml
comments:
    enable: true
    type: waline
```

2.启用`waline`配置项

```yml
waline:
  serverURL: 'blog-waline-x74w.vercel.app'  # 上面复制过来的服务地址
  path: window.location.pathname
  meta: ['nick', 'mail', 'link']
  requiredMeta: ['nick']
  lang: 'zh-CN'
  emoji: ['https://cdn.jsdelivr.net/gh/walinejs/emojis/weibo']
  dark: 'html[data-user-color-scheme="dark"]'
  wordLimit: 0
  pageSize: 10
  locale: 
    placeholder: '哈，快找个位置随便坐~'
```

## 国内网络出错

国内网路环境加载不了评论，也发布不了评论

![image-20240630093058555](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240630093058555.png)

此时我们需要绑定国内域名，注意绑定国内域名时请绑定你申请域名的子域名，比如你的域名时airainday.top，应该填写waline.airianday.top,waline可以自定义为你想要的名称。（这样做是因为airainday.top之前已经与airainday.github.io绑定了，这里再填写airainday.top会冲突，因此填了一个子域名）

然后需要在域名提供商那里添加CNAME解析记录：

![image-20240630095432783](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240630095432783.png)

出现下图说明DNS解析正确，接着会生成SSL证书，等待一会。

![image-20240630095111432](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240630095111432.png)

等了很久也没有成功，发现是绑定的域名没有备案，换一个备案后的域名即可。

![image-20240630145911262](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240630145911262.png)

## 参考

[Vercel部署Waline评论系统 - KEVIN'S BLOG (kevinchu.top)](https://blog.kevinchu.top/2023/07/17/vercel-deploy-waline/)



