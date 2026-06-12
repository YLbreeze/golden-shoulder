# 黄金扛工 Golden Shoulder

微信小游戏原生 Canvas 项目。

## 当前状态

当前版本是 GDD 中 MVP 玩法的可体验版本：

- 限时 60 秒，目标价值 1000。
- 每 1 秒生成一个待放置货物。
- 点击屏幕左半区或右半区，将当前货物放到对应侧。
- 累计左右担重量和总价值。
- 左右重量差达到阈值后进入失衡状态，3 秒内可救回。
- 达成目标价值且保持可接受平衡时通关。
- 时间结束价值不足，或失衡救回失败时挑战失败。

## 已实现的 MVP 反馈

- 顶部 HUD：目标、当前价值、时间、阈值和平衡状态。
- 左右担子区域与货物堆叠。
- 点击左右区域的短暂高亮。
- 货物落入对应担子的飞行动画。
- 加分飘字。
- 完美平衡、临界平衡、失衡提示。
- 失衡时场景轻微抖动。
- 挑夫表情、身体姿态、扁担倾斜与失败倒地。
- 成功/失败结算面板，显示价值进度、左右重量和失败原因。
- Canvas DPR 高清适配，真机预览文字和线条更清晰。
- 音效系统已接入，当前占位 WAV 在部分真机上可能不播放，后续可替换为正式 MP3/AAC。

## 目录结构

```text
├── audio
│   ├── fail.wav
│   ├── perfect.wav
│   ├── place.wav
│   ├── success.wav
│   ├── unbalanced.wav
│   └── warning.wav
├── docs
│   └── Golden-Shoulder_游戏策划案_GDD.docx
├── js
│   ├── core
│   │   ├── config.js          # MVP 数值、货物池、音效配置
│   │   ├── gameController.js  # 核心玩法状态与判定
│   │   ├── goodsFactory.js    # 按概率生成货物
│   │   ├── soundManager.js    # 音效事件播放
│   │   ├── type.js            # 预留
│   │   └── utils.js           # 预留
│   ├── view
│   │   ├── basketView.js      # 场景、挑夫、扁担、左右担和货物绘制
│   │   ├── feedbackView.js    # 点击、加分、下落、提示和抖动反馈
│   │   ├── hud.js             # 顶部 HUD 与平衡状态提示
│   │   └── resultView.js      # 成功/失败结算面板
│   └── main.js                # 游戏入口、循环、输入、渲染调度
├── game.js                    # 微信小游戏入口
├── game.json                  # 游戏运行配置
├── project.config.json
└── project.private.config.json
```

## 主要调参位置

所有 MVP 玩法参数集中在 `js/core/config.js`。

```js
level: {
  targetValue: 1000,
  timeLimitSec: 60,
  threshold: 5,
  rescueSec: 3,
}
```

- `targetValue`：目标价值，越高越难。
- `timeLimitSec`：时间限制，越短越紧张。
- `threshold`：左右重量差阈值，越小越难。
- `rescueSec`：失衡救回时间，越短越难。

```js
spawn: {
  intervalSec: 1,
  previewCount: 1,
  dropAnimSec: 0.35,
}
```

- `intervalSec`：货物生成间隔。
- `dropAnimSec`：货物落入担子的动画时长。

```js
goodsPool: [
  { id: "rect", name: "长方形", weight: 3, value: 100, prob: 40 },
  { id: "square", name: "正方形", weight: 2, value: 25, prob: 40 },
  { id: "trapezo", name: "梯形", weight: 1, value: 50, prob: 20 },
]
```

- `weight`：影响左右平衡。
- `value`：影响通关进度。
- `prob`：出现概率。

## 运行与预览

使用微信开发者工具打开项目根目录。

真机扫码预览时，如果字体发糊，确认 `js/main.js` 中 DPR 适配仍保留：

```js
this.canvas.width = this.screenWidth * this.dpr
this.canvas.height = this.screenHeight * this.dpr
this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
```

## 后续方向

建议先围绕 MVP 体验继续观察和调参：

- 验证 1 秒生成间隔是否合适。
- 验证 60 秒、1000 目标价值是否过长或过短。
- 验证阈值 5 和 3 秒救回是否有紧张感。
- 替换正式音效素材。
- 增加多关卡配置。
- 增加关卡难度递进。
- 需要调参时再加入 debug 数值开关。
