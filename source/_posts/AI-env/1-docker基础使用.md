---
title: 1-docker基础使用
tags: [docker,环境配置]
categories: [AI-env]
category_bar: true
date: 2024-07-09 21:41:33
---

Docker只要拉取一个别人配置好环境的镜像，然后基于此镜像创建容器进行开发即可，并且方便移植。

## WIn安装Docker



## 镜像获取

比如我们想下载一个ubuntu镜像，直接在这里[ubuntu - Official Image | Docker Hub](https://hub.docker.com/_/ubuntu)搜索ubuntu，然后复制`docker pull ubuntu`,并且加上对应版本，比如20.04，在具备Docker的终端中执行：`docker pull ubuntu:20.04`即可获得该镜像。

![image-20240710070005335](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240710070005335.png)

**但是我们想找一个配置好conda、pytorch、cuda和cudnn的镜像**。

我们直接在docker hub上搜索Pytorch，会出现Pytorch官方提供的一系列镜像：

![image-20240710070927689](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240710070927689.png)

这里选择带devel的进行下载，`docker pull pytorch/pytorch:2.0.1-cuda11.7-cudnn8-devel`,我们选择2.0.1版本的pytorch。

下载完之后，`docker images`可以查看到刚才下载的镜像：

![image-20240710083612946](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240710083612946.png)

我们已经把镜像下载下来了，接下来是基于此镜像创建容器。

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
```

**新进入一个容器，需要执行`apt update`更新软件下载链接，方便后续安装软件。**

但是容器里面是没有CUDA Toolkit和cudnn的，也没有conda环境。

**我们可以自己创建，不过没必要，直接用别人创建好环境的镜像即可。**

比如前面拉取到的pytorch/pytorch:2.0.1-cuda11.7-cudnn8-devel镜像：

`docker run -itv C:\Users\rain\Downloads\:/file -p 8898:22 --gpus all --shm-size 64g --name raindl-cuda pytorch/pytorch:2.0.1-cuda11.7-cudnn8-devel`

启动后自动进入/workspace目录内，这是该镜像的设置。

我们查看该容器是否包含配置好的pytorch和cuda，cudnn完整的环境

```shell
root@1a8190a19173:/usr/local/cuda# nvcc -V
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2022 NVIDIA Corporation
Built on Wed_Jun__8_16:49:14_PDT_2022
Cuda compilation tools, release 11.7, V11.7.99
Build cuda_11.7.r11.7/compiler.31442593_0
```

可以看到已经包含了完整的CUDA11.7

```shell
root@1a8190a19173:/usr/local/cuda# python
Python 3.10.11 (main, Apr 20 2023, 19:02:41) [GCC 11.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> import torch
>>> torch.cuda.is_available()
True
>>> torch.version.cuda
'11.7'
>>> torch.__version__
'2.0.1'
>>> torch.backends.cudnn.version()
8500
```

我们的Pytorch也可以使用CUDA和CUDNN加速。

**不过机器上好像没有单独安装CUDNN**：

```shell
# 检查库文件
(base) root@1a8190a19173:~# ls /usr/local/cuda/lib64/libcudnn*
ls: cannot access '/usr/local/cuda/lib64/libcudnn*': No such file or directory

# 检查版本文件
(base) root@1a8190a19173:~# cat /usr/local/cuda/include/cudnn_version.h | grep CUDNN_MAJOR -A 2
cat: /usr/local/cuda/include/cudnn_version.h: No such file or directory
```

**用上面方法验证是没有安装的，但是官方验证方法是：**

> To verify that cuDNN is installed and is running properly, compile the mnistCUDNN sample located in the /usr/src/cudnn_samples_v8 directory in the Debian file.
>
> 1. Copy the cuDNN samples to a writable path.
>
>    ```
>    $cp -r /usr/src/cudnn_samples_v8/ $HOME
>    ```
>
> 2. Go to the writable path.
>
>    ```
>    $ cd  $HOME/cudnn_samples_v8/mnistCUDNN
>    ```
>
> 3. Compile the mnistCUDNN sample.
>
>    ```
>    $make clean && make
>    ```
>
> 4. Run the mnistCUDNN sample.
>
>    ```
>    $ ./mnistCUDNN
>    ```
>
>    If cuDNN is properly installed and running on your Linux system, you will see a message similar to the following:
>
>    ```
>    Test passed!
>    ```

跟随上面方法试一下，发现没有ministCUDNN文件夹

```shell
(base) root@1a8190a19173:/usr/src/cudnn_samples_v8# ls
NVIDIA_SLA_cuDNN_Support.txt
```

我们github上下载一下：[johnpzh/cudnn_samples_v8: cuDNN samples v8.x (github.com)](https://github.com/johnpzh/cudnn_samples_v8)

然后复制到容器的 `/`目录下面，执行`make clean && make`（如果出现`fatal error: FreeImage.h: No such file or directory`，执行`apt update && apt install libfreeimage3 libfreeimage-dev`安装即可，安装完之后，重新执行上述命令）

然后执行`./mnistCUDNN`,出现下面字符说明CUDNN是安装成功了的：

```shell
...
Result of classification: 1 3 5
Test passed!
```

同样，后续我测试了nvidia提供的`nvidia/cuda:11.7.1-cudnn8-devel-ubuntu20.04`镜像，虽然用`ls /usr/local/cuda/lib64/libcudnn*`或者`cat /usr/local/cuda/include/cudnn_version.h | grep CUDNN_MAJOR -A 2`没有检测到cudnn相关内容，但是其实是已经安装好cudnn的。

结论：如果用docker创建深度学习环境的话，建议直接下载pytorch提供的devel镜像，比如`pytorch/pytorch:2.0.1-cuda11.7-cudnn8-devel`,下载之前执行`nvidia-smi`查看你显卡驱动最高支持的CUDA版本号，你下载的镜像的cuda版本不能超过此版本号。该镜像中包含了完整的CUDA和CUDNN以及Pytorh和conda，省去了我们配置DL环境的很多麻烦。

## vscode连接容器

我们创建完容器后，可以直接在vscode中连接该容器，方便编写和debbug代码。

首先安装两个插件：

![image-20240714080055305](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240714080055305.png)

然后点击侧边栏的Docker图标，可以看到你机器上所有镜像和容器，右键要连接的容器，点击`attached visual studio code`即可进入到该容器之中，我们选择之前`pytorch/pytorch:2.0.1-cuda11.7-cudnn8-devel`镜像创建的容器（容器名已改为raindl）。

![image-20240714075919470](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240714075919470.png)

进入新建立的容器后，可以执行`conda init`来使得每次进入终端中自动激活base环境；执行`apt update`更新系统中关于软件包的最新信息，执行`apt update`实际原理如下：

> 1. **读取软件源列表**：
>    - `apt update` 首先读取配置文件 `/etc/apt/sources.list` 以及 `/etc/apt/sources.list.d/` 目录下的所有文件。这些文件包含了可用的软件仓库及其地址。
> 2. **连接到软件仓库**：
>    - 它会尝试连接到每个列出的软件仓库（也称为软件源）以获取最新的软件包信息。这些仓库通常是远程服务器，存储了许多可用的软件包及其元数据。
> 3. **下载软件包索引文件**：
>    - `apt update` 从这些软件仓库下载最新的软件包索引文件。这些索引文件包含了软件包的名称、版本、依赖关系、描述等信息。
> 4. **更新本地缓存**：
>    - 下载完成后，`apt update` 会更新本地的包管理系统缓存，将新的软件包信息存储在本地。这意味着你现在拥有了关于系统上可用软件包的最新信息。
>
> ### 示例输出解释
>
> 运行 `apt update` 后，你可能会看到如下输出：
>
> ```
> Hit:1 http://archive.ubuntu.com/ubuntu focal InRelease
> Hit:2 http://archive.ubuntu.com/ubuntu focal-updates InRelease
> Hit:3 http://archive.ubuntu.com/ubuntu focal-backports InRelease
> Get:4 http://security.ubuntu.com/ubuntu focal-security InRelease [114 kB]
> Fetched 114 kB in 1s (172 kB/s)
> Reading package lists... Done
> ```
>
> - `Hit`: 表示已经从缓存中获取了该软件源的索引文件，因为它已经是最新的。
> - `Get`: 表示从远程服务器下载了新的索引文件。
> - `Fetched`: 表示下载了多少数据以及用了多少时间。
> - `Reading package lists... Done`: 表示已经成功读取并更新了本地的软件包列表。
>
> ### 总结
>
> `apt update` 命令不会实际安装或升级任何软件包。它只是更新系统关于可用软件包的最新信息。这是进行软件包管理的第一步。通常在运行 `apt update` 后，你可以运行 `apt upgrade` 或 `apt install` 来实际升级或安装软件包。

更新好软件包的最新信息后，就可以用`apt`安装一些工具了，下一篇文章介绍一些常用的工具。

## 参考

[Docker容器的创建、启动、和停止 - Ruthless - 博客园 (cnblogs.com)](https://www.cnblogs.com/linjiqin/p/8608975.html)

[docker拉取的pytorch-gpu版找不到cuda和cudnn的位置，为何？_docker找不到torch-CSDN博客](https://blog.csdn.net/ljp1919/article/details/106209358)

[Linux下安装cuda和对应版本的cudnn_linux怎么在自己的环境中安装cuda和cudnn-CSDN博客](https://blog.csdn.net/qq_44961869/article/details/115954258)

[安裝 Nvidia driver Cuda Cudnn on Ubuntu 22.04 | Medium](https://jackfrisht.medium.com/install-nvidia-driver-via-ppa-in-ubuntu-18-04-fc9a8c4658b9)
