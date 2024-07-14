---
title: 0-conda&pip基础使用
tags: [conda,pip,环境配置]
categories: [AI-env]
category_bar: true
date: 2024-07-05 15:23:16
---
conda是配置深度学习环境的利器，很方便隔离和配置每个深度学习算法的环境。下面基于windows、Linux、Docker三种方式依次讲解如何配置深度学习环境。

# Linux

## 环境创建和管理

### 安装miniconda

下载miniconda的链接：[清华大学开源软件镜像站](https://mirrors.tuna.tsinghua.edu.cn/anaconda/miniconda/)，比如 [linux上默认py39版本](https://mirrors.tuna.tsinghua.edu.cn/anaconda/miniconda/Miniconda3-py39_23.10.0-1-Linux-x86_64.sh) ，py39和Linux-86-64分别表示默认安装的python版本为3.9，适合平台linux-x64。

执行命令`sh 刚才下载的minicodna版本名称`，然后弹出阅读条款，同意license terms处填写`yes`；接着弹出安装路径，自己选择安装在哪里；接着会问你是否同意自动初始化conda，即每次进入shell时会自动激活conda环境，我们同意此选项即可，后续也可以用`conda config --set auto_activate_base false`禁止自动激活。

安装完毕之后，自动创建的conda环境（base）的python版本为3.9，这和你下载的miniconda版本相关。

### conda镜像配置

`conda config --show channels`可以查看当前codna从哪里下载的包，默认是defaults（国外的官方服务器）

添加镜像（你的机器方便访问的包下载服务器）

`conda config --add channels xxx`

比如添加清华大学镜像源：

```shell
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/
```

此时查看`~/.condarc`文件，可以看到channels下面有你添加的镜像源，后续可以修改此文件方便的添加或者删除镜像源。

### 创建和删除环境

`conda create -n 环境名 python=xxx`

`conda env remove -n 环境名`

可以克隆环境从一个已经创建好的conda环境（同一台机器上）

`conda create --name new_env --clone old_env`

### pip源配置

OK环境创建好以后，后面就是下载项目所用的各种包了，可以用conda安装也可以用pip安装，conda源已经配好下面配置以下pip源：

```shell
# 创建~/.pip/pip.conf文件
vim ~/.pip/pip.conf
# 写入以下内容
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
[install]
trusted-host=mirrors.aliyun.com
```

上面是永久配置pip源，如果是临时一次安装，可以用`-i 源`:

`pip install xxx -i https://pypi.tuna.tsinghua.edu.cn/simple`

## Pytorch安装

pytorch是深度学习的一个框架，很多项目是基于此的，因此这里讲一下如何安装这个包，它的版本与你Nvidia显卡驱动所支持的CUDA版本相关。

CUDA版本有三个：

1.GPU安装好驱动以后，会有一个对应的CUDA版本，用`nvidia-smi`可以查看，比如11.8，该版本表示你后续要安装的CUDA Toolkit Version(runtime version)版本不能超过11.8

2.CUDA Toolkit Version(runtime version)

> CUDA Toolkit Version（也称为运行时版本）是由 NVIDIA 提供的一组软件开发工具，用于创建使用 GPU（图形处理单元）进行并行计算的应用程序。它包含了开发、优化和调试 GPU 加速应用程序所需的库、编译器、驱动程序和工具。

有些项目其实是不需要安装该工具的，比如yolov5，我们只要安装自带cuda的pytorch版本即可，比如：`conda install pytorch torchvision torchaudio pytorch-cuda=11.8 -c pytorch -c nvidia`或者`pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118`。

**需要注意的是安装pytorch的cuda版本不能超过你驱动所支持的最高CUDA版本。**

这些PyTorch 已经包含了所需的 CUDA 库，可以直接使用 GPU 加速。我们可以用以下代码检测torch是否可以用GPU：

```python
import torch
torch.__version__  # 1.13.1+cu116
print(torch.cuda.is_available())  # True
print(torch.version.cuda)  # 11.6
print(torch.backends.cudnn.version()) # 8302
```

上面结果可以看出我们的pytorch完全可以用GPU。

但是，**有些应用是需要安装CUDA Toolkit的**，比如mmdetection，它包含了一些自定义的 CUDA 操作，这些操作需要在安装时进行编译。安装 CUDA Toolkit 可以确保这些自定义操作能够正确编译和链接。因此建议我们还是安装CUDA Toolkit，以支持更多AI项目。

3.第三个CUDA版本其实就是前面提到的安装GPU版本的torch时相应的cuda，比如pytorch-cuda=11.8，可以将其理解为非完整版的CUDA toolkit

**如果我们安装了CUDA Toolkit完整版的，然后再安装pytorch-cuda，此时pytorch-cuda版本号要和CUDAToolkit版本号一样吗？**

## CUDA Toolkit安装

参考官方文档进行安装：[CUDA Installation Guide for Linux (nvidia.com)](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html)

## CUDNN安装

下载：[cuDNN Archive | NVIDIA Developer](https://developer.nvidia.com/rdp/cudnn-archive)

选择要安装的版本，这里选择8.5.0，与CUDA11.x都是适配的

![image-20240710100051501](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240710100051501.png)

参考官方文档进行安装：[Installation Guide :: NVIDIA cuDNN Documentation](https://docs.nvidia.com/deeplearning/cudnn/archives/cudnn-891/install-guide/index.html)

# Docker

利用docker配置深度学习环境很方便，参考我的文章：docker配置DL环境（连接失效的话直接搜索）

# Windows

# 参考

[Linux下安装cuda和对应版本的cudnn_linux怎么在自己的环境中安装cuda和cudnn-CSDN博客](https://blog.csdn.net/qq_44961869/article/details/115954258)

