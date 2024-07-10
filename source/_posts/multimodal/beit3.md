1. [TypeError: Descriptors cannot be created directly.报错分析与解决-CSDN博客](https://blog.csdn.net/sangedianhao/article/details/136662205)
2. [Unknown model (beit3_large_patch16_384_retrieval) · Issue #1927 · huggingface/pytorch-image-models](https://github.com/huggingface/pytorch-image-models/issues/1927
## beit3项目源码Bugs
### evaluate-flickr30k
进行flickr30k数据集上进行retrieval任务时遇到以下bug。

**1、执行下面代码对dataset_flickr30k.json进行tokenizing时出现错误，原因是protobuf版本过高，安装protobuf 3.20.0版本解决。**
TypeError: Descriptors cannot be created directly.
If this call came from a _pb2.py file, your generated code is out of date and must be regenerated with protoc >= 3.19.0.
If you cannot immediately regenerate your protos, some other possible workarounds are:
 1. Downgrade the protobuf package to 3.20.x or lower.
 2. Set PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python (but this will use pure-Python parsing and will be much slower).
```python
from datasets import RetrievalDataset
from transformers import XLMRobertaTokenizer

tokenizer = XLMRobertaTokenizer("/your_beit3_model_path/beit3.spm")

RetrievalDataset.make_flickr30k_dataset_index(
    data_path="/path/to/your_data",
    tokenizer=tokenizer,
    karpathy_path="/path/to/your_data",
)
```

**2、在flickr30k数据集上评估模型的beit3_base_itc_patch16_224.pth时，出现的Unknown model (beit3_large_patch16_224_retrieval)，出现这个错误时因为timm中没有包含你指定的模型名称，需要将modeling_finetune.py中的模型导入进来**
在`run_beit3_finetuning.py`中加入`from modeling_finetune.py import *`
### 在flickr30k-cna数据集微调beit3
在flickr30k-cna中文数据集上微调beit3时，遇到以下bugs。
首先我们需要将flickr30k-cna进行分词：下面分别是beit3.spm采用的sentencepiece分词方式和我用哈工大提供的chinese_roberta_wwm_ext_pytorch模型（WordPiece方式）进行分词的代码。该模型下载地址：[chinese-roberta-wwm-ext](https://huggingface.co/hfl/chinese-roberta-wwm-ext-large)
```python
from transformers import BertTokenizer, XLMRobertaTokenizer, RobertaTokenizer
import sentencepiece as spm

def tokenizer(text, model_path, type='xlm'):
    if type == 'xlm':
        tokenizer = XLMRobertaTokenizer(model_path)
    elif type == 'bert':
        tokenizer = BertTokenizer.from_pretrained(model_path)
        #model_name = "hfl/chinese-roberta-wwm-ext"
        #tokenizer = RobertaTokenizer.from_pretrained(model_name)

    # 使用分词器进行分词
    tokens = tokenizer.tokenize(text)
    token_ids = tokenizer.convert_tokens_to_ids(tokens)
    # 输出结果
    print("原句子:", text)
    print("分词结果:", tokens)
    print("Token IDs:", token_ids)

def get_vocab(model_path):
    # 加载 SentencePiece 模型
    sp = spm.SentencePieceProcessor()
    sp.load(model_path)

    # 获取词表
    vocab = {sp.id_to_piece(id): id for id in range(sp.get_piece_size())}

    # 打印词表中的前10个词，保存为一个词表文件
    with open('vocab_beit3.txt', 'w', encoding='utf-8') as f:
        for token, token_id in list(vocab.items())[:]:
            f.write(f'{token}: {token_id}'+'\n')

if __name__ == "__main__":
    # 本地目录
    bert_model_path = r'D:\work\token-cn\chinese_roberta_wwm_ext_pytorch'
    xlm_model_path = './beit3.spm'
    # get_vocab(xlm_model_path)

    # 输入中文句子
    text = "一辆火车缓慢的前行。"   
    #tokenizer(text, xlm_model_path, 'xlm') 
    tokenizer(text, bert_model_path, 'bert') 
```

1、**compute_indices_weights_cubic not implemented for Half** 
参考：[RuntimeError: "compute_indices_weights_cubic" not implemented for 'Half' · Issue #1056 · microsoft/unilm (github.com)](https://github.com/microsoft/unilm/issues/1056)可以解决。

2、**不要启用--enable--deepspeed选项**，不然可能出现你的**torchcuxxx与本机cuxxx版本不一致无法编译**的错误。

3、微调时--sentencepiece-model更换为我们下载的chinese_roberta_wwm_ext_pytorch文件夹，而这个分词模型会缺失bos_token_id和eos_token_id，会导致后面报错。因此需要在**datasets.py中添加下面代码更换tokenizer**：
```python
def create_dataset_by_split(args, split, is_train=True):
	# 添加下面代码，并将tokenizer=get_sentencepiece_model_for_beit3(args)注释掉
	tokenizer = get_wordpiece_model_for_beit3(args)
	...

# 写get_wordpiece_model_for_beit3(args)中的内容
def get_wordpiece_model_for_beit3(args):
	from transformers import BertTokenizer
	tokenizer = BertTokenizer.from_pretrained(args.sentencepiece_model)
	# xxx_id后面数字只要是vocab.txt中未使用的就行，不一定是1，2
	tokenizer.bos_token_id = 1
	tokenzier.eos_token_id = 2
	return tokenizer
```

4、**出现错误 Expected to mark a variable ready only once**
>RuntimeError: Expected to mark a variable ready only once. This error is caused by one of the following reasons: 1) Use of a module parameter outside the `forward` function. Please make sure model parameters are not shared across multiple concurrent forward-backward passes. or try to use _set_static_graph() as a workaround if this module graph does not change during training loop.2) Reused parameters in multiple reentrant backward passes. For example, if you use multiple `checkpoint` functions to wrap the same part of your model, it would result in the same set of parameters been used by different reentrant backward passes multiple times, and hence marking a variable ready multiple times. DDP does not support such use cases in default. You can try to use _set_static_graph() as a workaround if your module graph does not change over iterations.

原因可能有多种，可以参考[关于Pytorch分布式训练遇到的问题和一些常用用法 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/587829165)，对于beit3来说是checkpoint_activations参数的原因，将此参数去掉即可。实际原理后续查明。

## Beit3网络结构
下面是构建beit3网络的源码（参考[unilm/beit3 at master · microsoft/unilm (github.com)](https://github.com/microsoft/unilm/tree/master/beit3)网络构建相关代码）
