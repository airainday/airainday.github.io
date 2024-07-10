---
title: post
tags: [hexo,fluid]
categories: [Hexo]
category_bar: true
date: 2024-07-10 19:41:17
---
## 创建发表文章
`hexo n post xxx`:会直接在比克根目录下的`source/_posts`下生成`xxx.md`文件
如果我们想要将生成的文件放在_posts的子文件夹内，可以采用命令：`hexo n post -p dir/xxx`

生成的文章会在开头带有日期，标题，tags等，你可以自定义文章开头带有哪些内容，在博客根目录`scaffolds/post.md`中修改，下面是我的内容

```md
---
# categories：AI,Kits,Hexo
title: {{ title }}
date: {{ date }}
tags: []
categories: []
category_bar: true  # 文章会显示类别面板，类似目录面板
---
```

创建完之后，用`hexo clean、hexo g、hexo d`即可将内容发布到网站上，部署之前可以用`hexo s`来查看效果，满意之后再用`hexo d`进行发布。
