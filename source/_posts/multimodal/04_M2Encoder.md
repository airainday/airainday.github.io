---
title: 04_M2Encoder
tags: [multimodal,M2Encoder]
categories: [multimodal]
category_bar: true
date: 2024-07-10 15:23:16
---

# 论文

## 概述

M^2（M-Square）Encoder：通过大规模高效预训练来推进双语言图文理解能力。

**摘要：**虽然以CLIP为代表的VL多模态模型已经发展的很好了，但是由于大规模预训练数据集的相对匮乏导致多语言模型VLM（比如中英）发展相对较缓慢。针对这个问题，团队引入了BM-6B这个双语（中英）数据集，里面有6B多的图文对。这么多的数据训练起来很慢，团队针对这个问题提出了一种叫做分组聚合的对比损失计算方式，可以显著降低通信开销和降低GPU内存占用，训练速度提高了60%。并且他们训练得到的M2Encoder-10B在ImageNet上的zero-shot的top-1分类准确率为88.5%，ImageNet-CN上为80.7%，比之前的SOTA模型分别高2.2%和21.1%。

**可以看到加大规模的中文数据对于之前中文多模态模型有很大的提升**。

**介绍：**主要说了BM-6B数据集的由来，数据集中文部分来自于开源数据集以及从合法网站上获取到的数据，然后利用翻译，移除噪声数据，数据增强等方式得到了大约3B中文image-text对；然后英文数据部分来自于开源英文数据集，比如LAION2B-EN，COYO-700M，Datacomp-1B，删除了可能重叠的部分，最终得到了BM（Bilingual multi-modality）-6B。然后为了训练这么大规模的数据，优化了损失函数计算方式，可以加速训练（可以看作是工程上的优化吧）。

感觉就是弄了一个私有数据集（中文部分包括哪些开源数据集没有说清楚），然后在这上面训练，模型结构目前还没提到，应该是没啥创新。

## 方法细节

### 模型结构

采用的是MAGNETO transformer。应该介绍一下具体结构的，不然还要去看这篇论文。

### 损失函数

训练任务采用SyCoCa—— 通过引入图像和文本的双向交互来改进 CoCa 的一种方式。具体来说有三个损失，分别是CMLM（Cross-modal Masked Language Modeling）和CMIM、ITC Lss。具体如下图所示。

![image-20240716103615144](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240716103615144.png)

损失函数中两个系数是超参数，用于改变CMIM和CMLM损失在整体损失函数中的重要程度。

![image-20240716110519807](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240716110519807.png)

### 数据细节

这里给出了中文和英文数据的具体来源：英文数据来源于Laion-EN, COYO-700M, Datacomp-1B, and Generated Datacomp’s Large Pool，Datacomp-1B和Datacomp’s Large Pool都是Datacomp的数据集的一部分。Generated Datacomp's large Pool表示从中筛选出来的数据；中文部分来源于Laion-CN, Wukong , Taisu , and Zero，并且添加了680 million 内部数据集，以及将Laion-EN 翻译成中文。

除了数量要多，数据的质量也要高，作者给出了他们的数据清洗pipeline：先移除text小于5个字符以及image宽高之间比例超过3的图文对，对于剩下的图文对，利用CLIP计算相似度分数，对于小于0.25的利用数据增强修正文本描述。

**数据增强：**目的就是改进描述使描述与图像之间更符合。通过训练一个rewritten模型来重写图片描述，首先利用*BLIP2*为每张图片生成字幕，然后标注者结合原始文本和新生成的文本给图片进行标注（具体标注多少呢？），接着利用图像和原始文本作为输入微调BLIP2，使其输出人工标注后的文本，一旦微调完毕之后，就可以利用其对所有图像生成caption了。

### 训练细节

用了32个NVIDIA DGX nodes, 每个节点配备了8 个Ampere A100SXM3-80G GPUs，真有钱啊。

下面是关于他们提出的分组，批次累加的ITC计算方式，图b是分组ITC，图c是结合了梯度累加的分组ITC。**没看懂。**

![image-20240716123725291](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240716123725291.png)

## 实验

### 模型性能

作者展示了零样本分类和零样本图文检索，分别在ImageNet和Flickr30k和COCO上，中文部分则是在这些数据集对应的中文数据集上。*zero-shot效果确定很好，但是作者没有给出图文检索微调后的结果，难道还没完成？*

**分类结果**

下划线表示之前的SOTA

![ImageNet-CN上](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240716142036886.png)

![ImageNet上的分类结果](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240716142157809.png)

**图文检索结果**

中文数据集上

![image-20240716142347764](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240716142347764.png)

英文数据集上

![](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240716142347764.png)

### Ablation Study

1. 用不同比例的BM-6B数据集训练M2-Encoder（1B版本），**随着用的训练数据的增多，模型性能一直提升，说明数据越多，模型的性能还是能够继续增加的？那我再增加数据模型的性能是不是就更好了？**
2. 在M2-Encoder-1B版本上验证了CMLM和CMIM预训练任务对模型细粒度能力是有好处的。
3. 第三个就是讲了他们提出的梯度累加分组ITC对训练速度的提升以及有多么节省GPU内存。

## 点评

花了很大篇幅讲解他们提出梯度累加分组ITC，由于这这方面知识储备较少，没怎么看懂；其次就是关于数据处理部分感觉还是挺有收益的，我们也可以据此做一份质量较高的图文对数据集；其它网络结构都是参考之前的工作。

最后就是作者没有给出模型微调结果，有点不解。
