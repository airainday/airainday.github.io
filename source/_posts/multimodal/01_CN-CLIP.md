---
title: 01_CN-CLIP
tags: [multimodal,cn-clip]
categories: [multimodal]
category_bar: true
date: 2024-07-10 15:23:16
---

[Chinese-CLIP](https://github.com/OFA-Sys/Chinese-CLIP)是基于CLIP和Chinese RoBERTa（中文语言模型）开发的中文版本的CLIP模型。

# 论文

训练数据来自LAION-5B中文部分数据共108M、Wukong中文数据共72M、MSCOCO和Visual Genome翻译后的中文数据（没有用测试集）。**并且添加了内部高质量数据集约20M，加一起一共是200M图文对中文预训练数据集**。

有了数据，如何训练CN-CLIP模型呢？

作者认为如果随机初始化Image Encoder和Text Encoder参数，模型的效果会受到当前数据质量的影响。因此作者采用了其它已训练好的模型参数来初始化Image Encoder和Text Encoder，分别是CLIP模型和Chinese RoBERTa模型。

接下来就是让模型适应我们的数据，让模型在我们的数据上进行微调就可以，损失函数和CLIP是一样的，不过和普通微调不一样的是，作者这里用了两阶段微调，因为作者认为只用LiT微调是不够的。

两阶段训练具体细节：第一阶段训练模型使其在下游任务中没有显著提升时开始第二阶段的训练。

CN-CLIP完整的训练流程如下所示

1. 分别用Chinese RoBERTa和CLIP的Image Encoder初始化CN_CLIP的Text Encoder和Image Encoder的参数
2. 冻结Image Encoder网络参数，利用对比学习损失调整Text Encoder网络参数（成为LiT微调lock image tuning）
3. 解冻Image Encoder网络参数，利用对比学习损失调整Image Encoder和Text Encoder的网络参数

![image-20240702100928957](https://cdn.jsdelivr.net/gh/airainday/blogimage@main/image-20240702100928957.png)

问题1：两次微调训练是所用数据是一样的吗？

答：作者这里没有提及两次训练所用数据的差异，应该是一样的

问题2：为什么cn-CLIP和beit3-retrieval在flickr30k-cn/flickr30k上不管是微调还是zero-shot都差距那么大呢？（大约7个点）

**待回答**

# 项目

## 环境配置

先克隆项目到本地，然后根据官方说明进行配置即可：

```shell
pip install -r requirements.txt
cd Chinese-CLIP
pip install -e .
```

执行下面命令测试环境是否配置完成：

```python
import torch 
from PIL import Image

import cn_clip.clip as clip
from cn_clip.clip import load_from_name, available_models
print("Available models:", available_models())  
# Available models: ['ViT-B-16', 'ViT-L-14', 'ViT-L-14-336', 'ViT-H-14', 'RN50']

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = load_from_name("ViT-B-16", device=device, download_root='./')
model.eval()
image = preprocess(Image.open("examples/pokemon.jpeg")).unsqueeze(0).to(device)
text = clip.tokenize(["杰尼龟", "妙蛙种子", "小火龙", "皮卡丘"]).to(device)

with torch.no_grad():
    image_features = model.encode_image(image)
    text_features = model.encode_text(text)
    # 对特征进行归一化，请使用归一化后的图文特征用于下游任务
    image_features /= image_features.norm(dim=-1, keepdim=True) 
    text_features /= text_features.norm(dim=-1, keepdim=True)    

    logits_per_image, logits_per_text = model.get_similarity(image, text)
    probs = logits_per_image.softmax(dim=-1).cpu().numpy()

print("Label probs:", probs)  # [[1.268734e-03 5.436878e-02 6.795761e-04 9.436829e-01]]
```

会自动下载权重，然后输出图片属于各个text之间的概率。







