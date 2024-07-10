---
title: clip
tags: [multimodal,clip]
categories: [multimodal]
category_bar: true
date: 2024-07-10 15:23:16
---

CLIP采用对比学习训练检索任务模型。

## 训练数据

CLip：从互联网中收集到的400M图像文本对，ImageNet上的分类能力(zero-shot即不需要事先进行监督训练)比肩ResNet50。

## 网络结构

下面的伪代码很清楚的说明了CLIP的运行方式。

图像和文本表示先各自经过图像编码器和文本编码器（比如ViT和Bert）；

图像编码器输出经过线性映射到指定维度后进行L2正则化;

文本编码器输出经过线性映射到指定维度后进行L2正则化;

接着就是计算损失函数了，关于损失函数在下面详细讲解。

![image-20240703164513287](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240703164513287.png)

## 损失函数

CLIP训练时对于一个N对图像文本数据的输入，分别经过图像编码器和文本编码器得到N个图像表示向量，N个文本表示向量。计算得到NxN个余弦相似度，为了最大化相匹配的N个图文对余弦相似度值，最小化NxN-N个不匹配的图文对余弦相似度值而更新网络参数。

![image-20240701191810328](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240701191810328.png)

损失函数代码如下：

损失函数用的是交叉熵损失函数

w权重可以忽略，x表示的是l向量里面的元素，c表示的是类别索引，比如说logist_per_image，每一个l表示每一张图片与所有文本的余弦相似度值组成的向量。C是一个序列range(0,64)，假设batch为64。以l1为例，是一个包含n个元素的向量，

l1=-log(x1/(e^x1+e^x2+...+e^xn))。

![image-20240703180300902](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240703180300902.png)

```python
# self.logit_scale = nn.Parameter(torch.ones([]) * np.log(1 / 0.07))
# return self.logit_scale.exp()

loss_img = nn.CrossEntropyLoss()
loss_txt = nn.CrossEntropyLoss()

image_features, text_features, logit_scale = model(images, texts)

logits_per_image = logit_scale * image_features @ text_features.t()
logits_per_text = logits_per_image.t()

ground_truth = torch.arange(len(images)).long()
total_loss = (
    loss_img(logits_per_image, ground_truth)
    + loss_txt(logits_per_text, ground_truth)
) / 2
```

为什么需要对余弦相似度添加一个系数呢，该系数初始化为`exp(np.log(1 / 0.07))`?











