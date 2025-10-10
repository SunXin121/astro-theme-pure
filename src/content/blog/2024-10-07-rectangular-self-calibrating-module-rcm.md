---
title: 矩形自校准模块 RCM
description: 矩形自校准模块概述
publishDate: 2024-10-7 19:14
tags:
- 图像分割
- 深度学习
heroImage:
  { src: 'http://wallpaper.csun.site/?rcm', inferSize: true }
---

> 论文：[https://arxiv.org/pdf/2405.06228](https://arxiv.org/pdf/2405.06228)
>
> 代码：[https://github.com/nizhenliang/CGRSeg/blob/main/models/decode_heads/rcm.py](https://github.com/nizhenliang/CGRSeg/blob/main/models/decode_heads/rcm.py)

**Rectangular Self-Calibration Module (RCM)** 可以捕捉轴向全局上下文，旨在使模型聚焦前景。

其由矩形自校准注意力 和 MLP 组成，主要结构如下:

![image-20241007191926653](https://5a352de.webp.li/2024/10/3c79f87d7dd3108f7354f76b9d1c7717.png)

## 矩形自校准注意力

矩形自校准注意力可表述如下:

$$\xi_{C}(\bar{y})=\delta(\psi_{k\times1}(\phi(\psi_{1\times k}(\bar{y}))))$$

其中 $\psi$ 代表卷积操作, $k$ 是卷积核的大小，$\phi$ 表示批量归一化和 ReLU 激活函数，$\delta$ 表示 Sigmoid 函数

然后将注意力特征与输入特征进行融合，通过一个卷积层提取输入特征的局部细节，然后与得到的注意力权重**相乘**

$$\xi_{F}(x,y)=\psi_{3\times3}(x)\odot y,$$

完整代码实现如下：

```python
class RCA(nn.Module):
    def __init__(self, inp, kernel_size=1, ratio=1, band_kernel_size=11, dw_size=(1, 1), padding=(0, 0), stride=1,
                 square_kernel_size=2, relu=True):
        super(RCA, self).__init__()
        self.dwconv_hw = nn.Conv2d(inp, inp, square_kernel_size, padding=square_kernel_size // 2, groups=inp)
        self.pool_h = nn.AdaptiveAvgPool2d((None, 1))
        self.pool_w = nn.AdaptiveAvgPool2d((1, None))

        gc = inp // ratio
        self.excite = nn.Sequential(
            nn.Conv2d(inp, gc, kernel_size=(1, band_kernel_size), padding=(0, band_kernel_size // 2), groups=gc),
            nn.BatchNorm2d(gc),
            nn.ReLU(inplace=True),
            nn.Conv2d(gc, inp, kernel_size=(band_kernel_size, 1), padding=(band_kernel_size // 2, 0), groups=gc),
            nn.Sigmoid()
        )

    def sge(self, x):
        x_h = self.pool_h(x)
        x_w = self.pool_w(x)
        x_gather = x_h + x_w
        ge = self.excite(x_gather)

        return ge

    def forward(self, x):
        loc = self.dwconv_hw(x)
        att = self.sge(x)
        out = att * loc

        return out
```

首先通过一个卷积层提取空间局部特征 `loc`，输出的特征图形状为 `[B, C, H, W]`

然后通过**分别沿着 H 和 W 两个方向进行平均池化**，获取这两个方向的全局特征，并将这两个特征相加，得到新特征 `x_gather`

两个方向的全局特征形状分别为 `[B, C, H, 1]` 和 `[B, C, 1, W]`，相加后会自动进行广播，得到的特征图形状为 `[B, C, H, W]`

然后通过一个 $1 \times 11$ 的卷积层将通道数缩减到 `gc`，然后进行批归一化和 ReLU 激活函数

随后再使用一个 $11 \times 1$ 的卷积层恢复原始的通道数，利用 Sigmoid 函数将特征图的每个元素映射到 `[0, 1]` 之间得到注意力权重

最后将权重与提取的特征 `loc` 相乘，完成特征融合，重新加权输入特征，增强特征图的表达能力

## MLP

通过两个 $1 \times 1$ 的卷积层来替代传统的全连接层，并在两个卷积层之间添加了归一化、激活函数和 Dropout

```python
class ConvMlp(nn.Module):
    """ 使用 1x1 卷积保持空间维度的 MLP
    """
    def __init__(
            self, in_features, hidden_features=None, out_features=None, act_layer=nn.ReLU,
            norm_layer=None, bias=True, drop=0.):
        super().__init__()
        out_features = out_features or in_features
        hidden_features = hidden_features or in_features
        bias = to_2tuple(bias)

        self.fc1 = nn.Conv2d(in_features, hidden_features, kernel_size=1, bias=bias[0])
        self.norm = norm_layer(hidden_features) if norm_layer else nn.Identity()
        self.act = act_layer()
        self.drop = nn.Dropout(drop)
        self.fc2 = nn.Conv2d(hidden_features, out_features, kernel_size=1, bias=bias[1])

    def forward(self, x):
        x = self.fc1(x)
        x = self.norm(x)
        x = self.act(x)
        x = self.drop(x)
        x = self.fc2(x)
        return x
```

## RCM 的完整实现

在矩形自校准注意力之后添加了批量归一化和 MLP 来完善特征，最后通过残差连接进一步加强特征重用，其可以描述为

$$\mathbf{F}_{\mathrm{out}}=\rho(\xi_{\mathrm{F}}(\mathrm{x},\xi_{\mathrm{C}}(\mathrm{H}_{\mathrm{P}}(\mathrm{x})\oplus\mathrm{V}_{\mathrm{P}}(\mathrm{x}))))+\mathrm{x}$$

其中 $H_p$ 和 $V_p$ 分别代表 H 和 W 方向的平均池化，$\rho$ 代表 BN 和 MLP

```python
class RCM(nn.Module):
    """ MetaNeXtBlock 块
    参数:
        dim (int): 输入通道数.
        drop_path (float): 随机深度率。默认: 0.0
        ls_init_value (float): 层级比例初始化值。默认: 1e-6.
    """
    def __init__(
            self,
            dim,
            token_mixer=RCA,
            norm_layer=nn.BatchNorm2d,
            mlp_layer=ConvMlp,
            mlp_ratio=2,
            act_layer=nn.GELU,
            ls_init_value=1e-6,
            drop_path=0.,
            dw_size=11,
            square_kernel_size=3,
            ratio=1,
    ):
        super().__init__()
        self.token_mixer = token_mixer(dim, band_kernel_size=dw_size, square_kernel_size=square_kernel_size,
                                       ratio=ratio)
        self.norm = norm_layer(dim)
        self.mlp = mlp_layer(dim, int(mlp_ratio * dim), act_layer=act_layer)
        self.gamma = nn.Parameter(ls_init_value * torch.ones(dim)) if ls_init_value else None
        self.drop_path = DropPath(drop_path) if drop_path > 0. else nn.Identity()

    def forward(self, x):
        shortcut = x
        x = self.token_mixer(x)
        x = self.norm(x)
        x = self.mlp(x)
        if self.gamma is not None:
            x = x.mul(self.gamma.reshape(1, -1, 1, 1))
        x = self.drop_path(x) + shortcut
        return x
```