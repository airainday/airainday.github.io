---
title: obsdian使用教程
date: 2021-06-25 19:42:20
tags:
- obsdian
categories:
- Tools
---

## obsdian git
1. 设置自动pull，每次重启obsdian会自动从远程仓库pull文件
2. 设置自动备份时间间隔，每隔指定时间就是copmmit和push本地修改到远程仓库
3. 你也可以手动进行commit+push推送本地修改到远端；或者手动pull远端文件到本地。这只需要在快捷键中进行设置，我的commit命令是ctrl+shift+c，push命令是ctrl+shift+p，pull命令是ctrl+shift+l。**需要注意的是同步本地修改到远端需要先commit后push，push根据你的网速和修改内容会需要一定的时间。
4. 前提是你需要将一个文件夹（obsdian仓库文件夹）变成git文件夹，然后链接你的远程github仓库。用`git init`和`git remote add origin respository_name
5. 关于自动备份：自动备份不如手动备份安全，关闭开启obsdian自动pull和每隔一段时间自动commit和push。每次修改完毕后记得commit和push即可。
## image manage
在设置中的文件与链接中修改附件存储的文件夹路径即可
## vscode代码复制到Obsdian出现空行
复制时用ctrl+shift+v即可
## obsdian配合picgo
由于obsdian插入图片是以附件形式进行的，因此在网络上无法访问到图片，因此借助picgo获取图片在网络上的链接。我们采用的图床是github。
1、创建github仓库，用于储存上传的图片
2、生成一个token，使picgo可以访问github：设置里面找到Developer settings，生成一个token将repo勾上，有效期可以选择无限，然后点击生成，将token复制一下，后面会用到。
![image.png|400](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/20240217214128.png)

![image.png|950](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/20240217214255.png)

![image.png|525](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/20240217214407.png)

3、下载picgo，进行github图床设置，如下所示，修改对应的github用户名和仓库名即可
启用加速：https://cdn.jsdelivr.net/gh/[github用户名]/[仓库名]@main
![image.png|750](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/20240217214547.png)

4、osbdian中下载picgo上传图片的插件：image auto upload plugin，启用即可，采取默认设置就行

参考链接：
1. [Obsidian+腾讯云图床(COS)+PicGo 搭建图床(202302) - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/514517568)
2. [使用Github+picGo搭建图床，保姆级教程来了 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/489236769)





