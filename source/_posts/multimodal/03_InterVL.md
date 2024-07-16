---
title: 03_InterVL
tags: [multimodal,InterVL]
categories: [multimodal]
category_bar: true
date: 2024-07-10 15:23:16
---

# 论文

## 概述

文章指出目前视觉和视觉-语言（vison-language）基础模型的发展却滞后于大语言模型（large language models，LLMs）的快速发展；为了将视觉模型和LLMs连接，目前的VLLMs（视觉大语言模型）通常采用“胶水层”，比如QFormer或者线性映射层，他们的目的是对其视觉和语言模型的特征。作者指出这种方式的三个可能的缺陷：

(1) 视觉和语言模型参数之间的差异：目前VLLMs常用的视觉编码器参数通常在1B，但是有些大的LLMs参数已经达到了1000B

(2) 不一致的特征表示，视觉模型通常是在纯视觉数据上训练或者与BERT系列语言模型对齐，与LLMs的特征表示存在不一致（啥意思，没太懂）

(3) "胶水层"参数太少，这可能无法捕捉到对多模态理解和生成至关重要的丰富的*跨模态交互和依赖关系*

问题已经提出，作者给出的解决方案就是提升视觉模型参数使其达到LLMs模型参数规模，并且使两者表示能够更好的融合。

具体来说，作者引入InternVL模型，有着以下三点关键的设计：

(1) 视觉和语言模型参数平衡：vision encoder可达6B参数，LLM中间件（将LLM模型看作一个中间件）则有8B参数

(2) 一致的表示：为了让vision encoder和LLM的特征表示保持一致，用预训练的multilingual LLaMA初始化LLM中间件并与vision encoder对齐

(3) 渐进式图文对齐：渐进式学习策略——现在大规模含有噪声的数据上进行对比学习，然后在好一些的数据上进行生成学习（generative learning）

![image-20240715173257718](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240715173257718.png)

## 相关工作

作者列举了一些视觉模型和大语言模型的发展进程。视觉模型从AlexNet->ResnetNet->ViT及其变体；大预言模型则有GPT-3、GPT-4以及开源的大预言模型：LLaMA series , Vicuna , InternLM, MOSS, ChatGLM , Qwen, Baichuan , Falcon等等。

最后提到了VLLMs的发展，目前VLLMs（视觉大预言模型）的目的是增强其处理和解释视觉信息的能力，GPT-4, LLaVA series，MiniGPT-4 引入了视觉指令调优技术（通过向模型提供包含视觉和语言信息的指令进行训练，以增强其在处理和理解视觉任务时的能力。这种调优方法旨在提高视觉语言模型对指令的遵循能力）；VisionLLM ，KOSMOS-2和Qwen - VL改进了VLLM，使其具有视觉基础能力，便于区域描述和定位等任务（指的是分割或者检测等基础视觉任务）；PaLM-E 和Embodied GPT代表了将VLLM应用于具身应用（embodied applications，比如机器人，自动驾驶等领域）的先进努力，显著扩展了它们的潜在应用。

## 具体方法细节

### 网络结构

> InternVL is designed with a vision encoder InternViT-6B and a language middleware QLLaMA. InternViT-6B is a vision transformer with 6 billion parameters, customized to achieve a favorable tradeoff between performance and efficiency. QLLaMA is a language middleware with 8 billion parameters, initialized with a multilingual-enhanced LLaMA.

*InternViT-6B*就是普通的ViT模型结构，作者对比了不通参数组合方式，最终确定模型结构如下：

![image-20240715193734938](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240715193734938.png)

*QLLaMA* is developed based on the pre-trained multilingual LLaMA , *and newly added 96 learnable queries and cross-attention layers (1 billion parameters) that are randomly initialized.*

作者说他们的模型就行瑞士军刀一样可以变换形态以实现多种功能：下图的a，b可用于contrastive任务；c，d可用于multi-modal dialogue任务；而训练好的ViT-6B可以用于visual perception tasks任务，比如分类和检测。

![image-20240715215445829](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240715215445829.png)

### 训练策略

训练由三个阶段组成：VL对比训练，VL生成训练，以及监督微调。不同阶段用到了不同的数据，有带噪声的图文对、高质量的caption，VQA以及多模态对话数据。

![image-20240715192224428](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240715192224428.png)

**Vision-Language Contrastive Training**：The data are all publicly available and comprise multilingual content, including LAION-en , LAIONmulti , LAION-COCO , COYO , Wukong , etc. We use the combination of these datasets and filter out some extremely low-quality data to train our model. 该阶段的训练可以使模型具备零样本图像分类和图文检索，并且其中的视觉编码器可以用于语义分割任务。这一阶段损失函数和CLIP的symmetric cross-entropy loss一样（ITC）。

第一阶段和第二阶段用到的图文对数据如下，cleaned表示去除匹配度很低的图文对数据。

![image-20240716063752721](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240716063752721.png)

**Vision-Language Generative Training：**we connect InternViT-6B with QLLaMA and adopt a generative training strategy. Specifically, QLLaMA inherits the weights of LLaMA-7B in the first stage. We keep both InternViT-6B and QLLaMA frozen and only train the newly added learnable queries and cross-attention layers with filtered, high-quality data.

数据如上表所示，也是图文对数据，不过是进一步清洗后的。所采用损失函数和BLIP-2一致：the loss in this stage is computed as the sum of three components: image-text contrastive (ITC) loss, image-text matching (ITM) loss, and image-grounded text generation (ITG) loss.

**Supervised Fine-tuning**：为了证明InternVL在多模态对话系统中的有效性，利用MLP层将InternVL和已训练好的大预言模型解码器，比如Vicuna，InternLM连接起来，并执行监督微调（SFT）。用到的数据是高质量的 instruction data，大约4B，如下表所示。微调时仅训练MLP层的参数，或者训练MLP和QLLaMA参数，论文里是这样写的：Owing to the similar feature space of QLLaMA and LLMs, we can achieve robust performance even when freezing the LLM decoder, choosing to train just the MLP layer or both the MLP layer and QLLaMA. *但是训练流程图中好像画错了，是冻住或者训练Vicuna-13B而不是QLLaMA*。

![image-20240716070839933](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240716070839933.png)

## 实验

针对这个模型可以执行的任务，作者分别在不同任务上进行对比。分为三个基准测试（Benchmarks），Benchmarks包括一组标准的数据集和评估指标，用于衡量模型在特定任务上的表现。

### Vision Perception Benchmarks

ImageNet1k数据集上评估ViT-6B图像分类能力，下面是冻住Backbone用ImageNet1k训练集微调分类线性层后，在ImageNet1k验证集及ImageNet1k的一些变体数据集上的结果。

![image-20240716092213566](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240716092213566.png)

以及在ADE20k上评估语义分割能力，具体数据就不放了，可以看原论文。

作者的对比很有意思，只和一些模型进行对比，但其实这些结果在总体榜单上排名并不高。或许是只对比同类或者同种方法的模型吧，其实和这些数据集上的SOTA模型差距还不小。

### Vision-Language Benchmarks

vision-language tasks也包含很多，比如Zero-Shot Image Classification、Zero-Shot Video Classification、Zero-Shot Image-Text Retrieval、Zero-Shot Image Captioning等等。

这里只贴上Image-Text Retrieval的结果：很奇怪的是为什么英文数据集上不和Beit3对比呢？其实是要比Beit3在Flickr30k上的效果要好的。

![image-20240716094340428](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240716094340428.png)

### Multi-Modal Dialogue Benchmarks

略
