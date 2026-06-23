# 黄金扛工 Golden Shoulder

微信小游戏原生 Canvas 项目。

## 当前状态

当前 `main` 基于 `v0.1.2` 开发 `v0.2.0` 多关卡教学版本：

- 包含 5 个顺序推进的教学关卡。
- 启动时读取本地进度，从上次解锁关卡继续。
- 开局立即显示货物，放置后立即显示下一件。
- 每次放置有 0.35 秒输入冷却，与下落动画保持一致。
- 点击屏幕左半区或右半区，将当前货物放到对应侧。
- 累计左右担重量和总价值。
- 各关拥有独立的失衡阈值和救回时间，随关卡逐步收紧。
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
- 通关后可进入下一关，最终关完成后显示全部通关。
- 结算支持查看现场、重试当前关和从头挑战。
- Canvas DPR 高清适配，真机预览文字和线条更清晰。
- 音效系统已接入但暂时关闭，后续替换正式 MP3/AAC 后再启用。

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
│   │   ├── config.js          # 全局动画和音效配置
│   │   ├── gameController.js  # 核心玩法状态与判定
│   │   ├── goodsFactory.js    # 按概率生成货物
│   │   ├── levels.js          # 五关参数、教学提示和货物池
│   │   ├── progressManager.js # 微信本地进度存档
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

## 关卡配置

全局动画和音效参数位于 `js/core/config.js`，关卡玩法参数集中在
`js/core/levels.js`。

```js
{
  id: 1,
  name: "左右开工",
  tip: "点击左右，分配货物",
  targetValue: 210,
  timeLimitSec: 22,
  threshold: 7,
  rescueSec: 4,
  perfectDiff: 1,
  criticalDiff: 6,
  goodsPool: [],
}
```

- `name`：HUD 中显示的关卡名称。
- `tip`：关卡开始时显示的教学提示。
- `targetValue`：目标价值，越高通常越难。
- `timeLimitSec`：时间限制，越短越紧张。
- `threshold`：左右重量差阈值，越小越难。
- `rescueSec`：失衡救回时间，越短越难。
- `goodsPool`：本关允许出现的货物及概率。

```js
spawn: {
  intervalSec: 1,
  previewCount: 1,
  dropAnimSec: 0.35,
}
```

- `intervalSec`：货物生成间隔。
- `dropAnimSec`：货物落入担子的动画时长。

| 关卡 | 教学重点 | 目标 | 时间 | 阈值 | 救回 |
| --- | --- | ---: | ---: | ---: | ---: |
| 1 左右开工 | 左右放置 | 210 | 22s | 7 | 4s |
| 2 稳住肩膀 | 基础平衡 | 420 | 27s | 6 | 3.5s |
| 3 失衡救场 | 石头与救回 | 620 | 31s | 5 | 3s |
| 4 金石取舍 | 风险与收益 | 950 | 35s | 5 | 2.5s |
| 5 黄金扛工 | 完整挑战 | 1500 | 41s | 4 | 2s |

## 运行与预览

使用微信开发者工具打开项目根目录。

真机扫码预览时，如果字体发糊，确认 `js/main.js` 中 DPR 适配仍保留：

```js
this.canvas.width = this.screenWidth * this.dpr
this.canvas.height = this.screenHeight * this.dpr
this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
```

## 后续方向

建议围绕五关教学体验继续观察和调参：

- 验证 41 秒、1500 目标价值是否过长或过短。
- 验证阈值 4 和 2 秒救回是否有紧张感。
- 验证五种货物的价值、重量和概率是否合理。
- 替换正式音效素材。
- 验证教学提示是否足够清楚。
- 验证关卡间难度是否平滑递增。
- 后续再考虑关卡选择界面。
- 需要调参时再加入 debug 数值开关。
