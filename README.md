# 黄金扛工 Golden Shoulder

微信小游戏原生 Canvas 项目。

## 当前实现

当前版本是 GDD 中 MVP 玩法的基础原型：

- 限时 60 秒，目标价值 1000。
- 每 1.5 秒生成一个货物。
- 点击屏幕左半区或右半区，将当前货物放到对应侧。
- 累计左右重量和总价值。
- 左右重量差达到阈值后进入失衡状态，超过救回时间则失败。
- 达到目标价值或倒计时结束时进行成功/失败判定。

## 目录结构

```text
├── docs
│   └── Golden-Shoulder_游戏策划案_GDD.docx
├── js
│   ├── core
│   │   ├── config.js          # MVP 数值配置
│   │   ├── gameController.js  # 核心玩法状态与判定
│   │   ├── goodsFactory.js    # 待实现
│   │   ├── type.js            # 待实现
│   │   └── utils.js           # 待实现
│   ├── view
│   │   ├── basketView.js      # 待实现
│   │   ├── hud.js             # 待实现
│   │   └── resultView.js      # 待实现
│   └── main.js                # 游戏入口、循环与临时渲染
├── game.js                    # 微信小游戏入口
├── game.json                  # 游戏运行配置
├── project.config.json
└── project.private.config.json
```

## 后续方向

下一步建议优先补齐 MVP 表现层：HUD、左右担子货物列表、结算界面、失败原因、点击反馈和平衡状态反馈。
