---
title: COCO+LVIS 数据集
description: 提升LVIS数据集的交互分割能力
publishDate: 2024-07-24 15:32
tags:
- 数据集
- 交互式分割
heroImage:
  { src: 'http://wallpaper.csun.site/?coco', inferSize: true }
---

LVIS 数据集存在一个不足之处:该数据集呈现出长尾分布特性,导致普遍物种类别缺失,这可能会对训练出的模型精度与泛化能力造成影响.

针对这一问题,[Reviving Iterative Training with Mask Guidance for Interactive Segmentation](https://arxiv.org/pdf/2102.06583) 对 LVIS 标签进行补充,加入 COCO 数据集中的掩码信息.最终得到了包含 104k 张图片 和 1.6M instance-level masks 的 COCO+LVIS 数据集.

数据集链接:[SamsungLabs/ritm_interactive_segmentation: Reviving Iterative Training with Mask Guidance for Interactive Segmentation (github.com)](https://github.com/SamsungLabs/ritm_interactive_segmentation?tab=readme-ov-file#datasets)

## 数据集组合

首先将下载的 [cocolvis_annotation.tar.gz](https://github.com/saic-vul/ritm_interactive_segmentation/releases/download/v1.0/cocolvis_annotation.tar.gz) 解压会得到两个文件夹 train 和 val

将从 LVIS 官网下载的 [train2017.zip](http://images.cocodataset.org/zips/train2017.zip) 和 [val2017.zip](http://images.cocodataset.org/zips/val2017.zip) 解压并重命名为 images 分别放到 tain 和 val 两个文件夹中

## 读取数据集

数据集图片和掩码的对应信息存放在 hannotation.pickle 文件中, 读取该文件会得到一个列表

```python
with open('/content/train/hannotation.pickle', 'rb') as f:
  dataset_samples = sorted(pickle.load(f).items())
```

列表的每一项是一个元组, 表示一个样本的信息

```python
print(dataset_samples[2])
```

输出

```python
(
	'000000000036',
	{
	  "num_instance_masks": 8,
	  "hierarchy": {
	    "0": {
	      "children": [4, 5, 7, 2],
	      "parent": None,
	      "node_level": 0
	    },
	    "1": None,
	    "2": {
	      "children": [],
	      "parent": 0,
	      "node_level": 1
	    },
	    "3": None,
	    "4": {
	      "children": [6],
	      "parent": 0,
	      "node_level": 1
	    },
	    "5": {
	      "children": [],
	      "parent": 0,
	      "node_level": 1
	    },
	    "6": {
	      "children": [],
	      "parent": 4,
	      "node_level": 2
	    },
	    "7": {
	      "children": [],
	      "parent": 0,
	      "node_level": 1
	    }
	  }
	}
)
```

元组的第一项是图片(000000000036.jpg)和掩码(000000000036.pickle)的文件名

第二项是一个字典, `num_instance_masks` 表示 instance mask 的数量, hierarchy 存储了 instance 的对应关系, 前面的数字 `"0", "1"` 表示 instance id, `children` 和 `parent` 表示了 instance 之间的包含关系, 例如 `"0": `{"children": [4, 5, 7, 2]} 表示 instance 0 包含了 4, 5, 7, 2

### 读取图像

```python
import matplotlib.pyplot as plt
from PIL import Image

# 定义图片路径
image_path = '/content/train/images/000000000036.jpg'

# 使用 PIL 打开图片
image = Image.open(image_path)

# 使用 matplotlib 显示图片
plt.imshow(image)
plt.axis('off')  # 不显示坐标轴
plt.show()
```

![undefined](https://p1.meituan.net/csc/df833aed780d275aed3ccca7d8723e37268446.png)

### 读取 masks

000000000036.pickle 文件存储了分层的 masks `layers`, 以及一个列表 `objs_mapping` , 这个列表存储了 instance 对应的层数和 mask_id

```python
pickle_path = '/content/train/masks/000000000036.pickle'
with open(pickle_path, 'rb') as f:
    encoded_layers, objs_mapping = pickle.load(f)
    layers = [cv2.imdecode(x, cv2.IMREAD_UNCHANGED) for x in encoded_layers]
    layers = np.stack(layers, axis=2)
```

例如, `objs_mapping` 的值为

```
[(0, 2), (0, 1), (3, 1), (1, 2), (1, 1), (1, 3), (2, 2), (2, 1), (0, 5), (0, 6), (0, 4), (0, 3)]
```

列表的索引对应着 instance id, 如 `objs_mapping[0]` 对应 instance 0 的 mask 层数是 0, mask_id 为 2

绘制出每层的 mask 并标记出 mask_id

```python
pickle_path = '/content/train/masks/000000000036.pickle'
with open(pickle_path, 'rb') as f:
    encoded_layers, objs_mapping = pickle.load(f)
    layers = [cv2.imdecode(x, cv2.IMREAD_UNCHANGED) for x in encoded_layers]
    layers = np.stack(layers, axis=2)
       
# 确定有多少层
num_layers = layers.shape[2]
# 绘制每一层
fig, axes = plt.subplots(1, num_layers, figsize=(15, 15))

for i in range(num_layers):
    ax = axes[i]
    ax.imshow(layers[:, :, i])
    ax.axis('off')
    ax.set_title(f'Layer {i}')
    # 找到每个区域并标记值
    layer = layers[:, :, i]
    unique_values = np.unique(layer)
    for value in unique_values:
      mask = (layer == value)
      y, x = np.where(mask)
      if len(x) > 0 and len(y) > 0:
        rand_idx = np.random.randint(len(x))
        rand_x, rand_y = x[rand_idx], y[rand_idx]
        ax.text(rand_x, rand_y, str(value), color='white', fontsize=12, ha='center', va='center')

plt.tight_layout()
plt.show()
```

![undefined](https://p0.meituan.net/csc/34365102ccb2c9405e5a1ae0639f700455971.png)

可以直观的看出 instance 与 mask 的对应关系以及 instance 之间的包含关系

例如 instance 0 代表那个女人, 其对应的 mask 层数是 layer 0, mask_id 是 2, 并且包含了 4, 5, 7, 2 这几个 instance