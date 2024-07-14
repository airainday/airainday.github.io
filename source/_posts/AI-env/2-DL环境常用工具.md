---
title: 2-DL环境常用工具
tags: [DL工具]
categories: [AI-env]
category_bar: true
date: 2024-07-14 9:07:33
---

## 资源监视nvitop

`pip install nvitop`即可，该工具可以实时监视GPU、CPU和内存的使用情况

![image-20240714092722812](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240714092722812.png)

## 终端分屏和会话保存工具

1. tmux

> `tmux` 是一个终端多路复用器，它允许用户在一个终端窗口内运行多个终端会话。使用 `tmux`，你可以在单个窗口中创建多个会话、窗口和面板，并且可以在它们之间切换。`tmux` 提供了一种方便的方法来管理长时间运行的命令和任务，使得在网络连接中断时能够保持会话的持续性。

`tmux`命令可以直接进入一个新的会话，新会话中可以执行以下命令

`ctrl + b` 是进入命令模式

1. ctrl+b, *%* 是**左右分屏**
2. ctrl+b, *”* 是**上下分屏**
3. ctrl+b, 方向键切换窗口
4. 退出当前窗口在终端输入 exit然后按enter即可（不用按ctrl+b）
5. ctrl + b 后按 `[` 进入复制模式，然后按方向键或者pgup、pgdn键可以上下翻页，q退出复制模式
6. `ctrl + b ，d `是将tmux挂在后台继续运行，这个非常好用，如果在训练一个任务时，可以将这个会话挂起，它会一直在后台运行

我们可以用以下命令来管理会话

1. tmux ls 查看后台运行的tmux窗口
2. tmux attach -t 窗口id 重新进入tmux窗口
3. ctrl + b 后按$,可以重命名session，下次进入该session就是 tmux attach -t new_name；或者用`tmux rename-session -t 5 aoi`，5是old_name, aoi是new_name
4. `tmux kill-session -t session-name`，杀死后台session，给定会话名即可

## Linux常用命令

由于DL环境一般在linux系统中进行，因此了解一些常用linux命令很有必要

```shell
# 查看本地时间
date  # Sun Jul 14 01:42:12 UTC 2024
# 修改时区
apt install tzdata  # 然后执行date看看时间是否正确
```

