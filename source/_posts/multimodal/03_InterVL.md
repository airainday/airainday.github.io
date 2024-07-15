---
title: 03_InterVL
tags: [multimodal,InterVL]
categories: [multimodal]
category_bar: true
date: 2024-07-10 15:23:16
---

# 论文

## 提出问题和方法

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

> InternVL is designed with a vision encoder InternViT-6B and a language middleware QLLaMA. InternViT-6B is a vision transformer with 6 billion parameters, customized to achieve a favorable tradeoff between performance and efficiency. QLLaMA is a language middleware with 8 billion parameters, initialized with a multilingual-enhanced LLaMA.

*InternViT-6B*就是普通的ViT模型结构，作者对比了不通参数组合方式，最终确定模型结构如下：

![image-20240715193734938](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240715193734938.png)

*QLLaMA* is developed based on the pre-trained multilingual LLaMA , and newly added 96 learnable queries and cross-attention layers (1 billion parameters) that are randomly initialized.

![image-20240715192224428](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240715192224428.png)
