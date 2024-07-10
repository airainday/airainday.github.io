---
title: docker使用教程
tags: [docker,环境配置]
categories: [Docker]
category_bar: true
date: 2024-07-09 21:41:33
---

## 镜像获取

### 镜像拉取

比如我们想下载一个ubuntu镜像，直接在这里[ubuntu - Official Image | Docker Hub](https://hub.docker.com/_/ubuntu)搜索ubuntu，然后复制`docker pull ubuntu`,并且加上对应版本，比如20.04，在具备Docker的终端中执行：`docker pull ubuntu:20.04`即可获得该镜像。

![image-20240710070005335](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240710070005335.png)

比如说我们想要拉取一个带有Pytorch的镜像，也是直接搜索Pytorch，会出现Pytorch官方提供的一系列镜像：

![image-20240710070927689](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240710070927689.png)

这里选择带devel的进行下载，`docker pull pytorch/pytorch:2.0.1-cuda11.7-cudnn8-devel`,我们选择2.0.1版本的pytorch。





1. 打包解压方式
2. dockerfile创建

## 创建容器

`docker images`:查看当前存在的镜像

```shell
REPOSITORY                      TAG       IMAGE ID       CREATED         SIZE
ultralytics/yolov5              latest    23c76ebd5d7c   9 months ago    7.96GB
ubuntu20_torch-cuda11.7_mmd3d   v1.0      f196865743ea   9 months ago    13.5GB
pengzhile/pandora               latest    73e531d136bc   10 months ago   261MB
ubuntu                          20.04     53df61775e88   2 years ago     72.8MB
```

创建一个容器，利用ubuntu镜像创建一个名为raindl的镜像，-t是给容器分配一个伪终端，-i是让容器标准输出在伪终端显示，方便操控容器。

`docker run -it -v C:\Users\rain\Downloads\:/file -p 8897:22 --gpus all --shm-size 64g --name raindl ubuntu:20.04`

```shell
root@65d59ead92dc:/# pwd
/
root@65d59ead92dc:/# cd /file/
root@65d59ead92dc:/file# ls
Music  Video  app  datasets  desktop.ini  documents  programs
```

创建完容器后，可以在容器中使用GPU，`nvidia-smi`

```shell
root@65d59ead92dc:/usr/local# nvidia-smi
Tue Jul  9 22:21:55 2024
+---------------------------------------------------------------------------------------+
| NVIDIA-SMI 535.104.07             Driver Version: 537.34       CUDA Version: 12.2     |
|-----------------------------------------+----------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |         Memory-Usage | GPU-Util  Compute M. |
|                                         |                      |               MIG M. |
|=========================================+======================+======================|
|   0  NVIDIA GeForce RTX 3090        On  | 00000000:01:00.0  On |                  N/A |
|  0%   31C    P8              29W / 350W |    806MiB / 24576MiB |      0%      Default |
|                                         |                      |                  N/A |
+-----------------------------------------+----------------------+----------------------+

+---------------------------------------------------------------------------------------+
| Processes:                                                                            |
|  GPU   GI   CI        PID   Type   Process name                            GPU Memory |
|        ID   ID                                                             Usage      |
|=======================================================================================|
|  No running processes found                                                           |
+---------------------------------------------------------------------------------------+
```

但是容器里面是没有CUDA Toolkit和cudnn的，也没有conda环境。我们按照xxx文章进行创建即可。当然我们也可以拉取一个带CUDA ToolKit和CUDNN的镜像，然后基于此镜像创建容器。

## 参考

[Docker容器的创建、启动、和停止 - Ruthless - 博客园 (cnblogs.com)](https://www.cnblogs.com/linjiqin/p/8608975.html)

[docker拉取的pytorch-gpu版找不到cuda和cudnn的位置，为何？_docker找不到torch-CSDN博客](https://blog.csdn.net/ljp1919/article/details/106209358)



