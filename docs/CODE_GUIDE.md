# 黄金扛工代码导读

本文档面向希望阅读和自行调整项目代码的开发者，内容基于 `v0.2.0`
（提交 `5264208`）。文档主要使用“文件名 + 函数名”定位代码，避免代码修改后固定行号失效。

## 1. 项目是什么

这是一个使用微信小游戏原生 Canvas 2D API 实现的小游戏，没有使用游戏引擎或前端框架。

项目可以分为三层：

```text
微信小游戏入口与调度
        ↓
核心规则和数据状态
        ↓
Canvas 画面与反馈表现
```

- `js/main.js`：连接微信运行环境、核心规则和画面。
- `js/core/`：保存游戏规则、关卡、货物、进度和音效逻辑。
- `js/view/`：读取核心状态并绘制画面，不负责决定胜负。

## 2. 目录结构

```text
golden-shoulder/
├── audio/                         # 当前音效素材
├── docs/
│   ├── Golden-Shoulder_游戏策划案_GDD.docx
│   └── CODE_GUIDE.md              # 本文档
├── js/
│   ├── core/
│   │   ├── config.js              # 全局节奏和音效配置
│   │   ├── gameController.js      # 核心状态、放置、平衡、胜负
│   │   ├── goodsFactory.js        # 从货物池加权随机生成货物
│   │   ├── levels.js              # 货物基础数据和五关参数
│   │   ├── progressManager.js     # 微信本地进度存档
│   │   ├── soundManager.js        # 根据反馈事件播放音效
│   │   ├── type.js                # 当前为空，预留文件
│   │   └── utils.js               # 当前为空，预留文件
│   ├── view/
│   │   ├── basketLayout.js        # 担框位置和货物多列堆叠算法
│   │   ├── basketView.js          # 场景、货物、担框、人物绘制
│   │   ├── feedbackView.js        # 落物、浮字、闪光、提示、震动
│   │   ├── hud.js                 # 顶部 HUD 和平衡状态条
│   │   └── resultView.js          # 成功/失败结算弹框与按钮命中
│   └── main.js                    # 游戏主循环、输入和模块协调
├── game.js                        # 微信小游戏代码入口
├── game.json                      # 微信小游戏运行配置
├── project.config.json            # 微信开发者工具项目配置
└── project.private.config.json    # 本机私有工具配置
```

## 3. 启动过程

微信小游戏首先执行根目录的 `game.js`：

```js
import Main from "./js/main"
new Main()
```

`Main.constructor()` 接着完成以下工作：

1. 使用 `wx.createCanvas()` 创建 Canvas。
2. 调用 `setupCanvas()` 设置屏幕尺寸和 DPR 高清适配。
3. 使用 `ProgressManager.load()` 读取上次关卡进度。
4. 创建 `GameController` 和所有 View。
5. 调用 `controller.start()` 启动当前关卡。
6. 注册前后台生命周期和触摸事件。
7. 使用 `requestAnimationFrame()` 启动游戏循环。

## 4. 主循环

`Main.gameLoop()` 每一帧执行一次：

```js
controller.tick(dt)
dispatchFeedbackEvents(dt)
render()
```

`dt` 是本帧距离上一帧经过的秒数，并被限制到最大 `0.1` 秒：

```js
const dt = Math.min((now - this.lastTime) / 1000, 0.1)
```

这个限制可以避免手机从后台恢复后，一次性扣除过多时间或直接耗尽失衡倒计时。

微信进入后台时，`bindLifecycle()` 将 `isActive` 设为 `false`，暂停规则更新；恢复前台时重置 `lastTime`。

## 5. 输入流程

触摸入口是 `Main.onTouchStart(e)`。

游戏进行中，根据触摸点横坐标决定左右：

```js
const x = e.touches[0].clientX
controller.handleTap(x < screenWidth / 2 ? "left" : "right")
```

- 屏幕左半边：放入左担。
- 屏幕右半边：放入右担。

游戏结束后，触摸交给 `Main.handleResultTouch()`，不再放置货物。

结算页隐藏时，点击任意位置只会重新显示结算弹框。结算页显示时，点击行为由
`ResultView.hitTest()` 返回：

- `viewScene`：隐藏弹框，查看现场。
- `restart`：重试当前关。
- `nextLevel`：进入下一关。
- `restartCampaign`：完成最后一关后从第一关重新开始。

## 6. GameController 核心状态

`js/core/gameController.js` 是当前玩法最重要的文件。

### 6.1 对局状态

```js
state = "ready" | "running" | "success" | "fail"
```

| 状态 | 含义 |
| --- | --- |
| `ready` | 数据已经重置，但还没有正式开始 |
| `running` | 正常倒计时并接受点击 |
| `success` | 当前关通关 |
| `fail` | 当前关失败 |

### 6.2 平衡状态

```js
balanceState = "perfect" | "normal" | "critical" | "unbalanced"
```

| 状态 | 含义 |
| --- | --- |
| `perfect` | 左右重量非常接近 |
| `normal` | 平衡，但不属于完美或临界 |
| `critical` | 接近失衡阈值 |
| `unbalanced` | 已达到失衡阈值，正在救回倒计时 |

### 6.3 主要运行数据

```js
leftWeight       // 左担总重量
rightWeight      // 右担总重量
totalValue       // 已放货物总价值
timeLeft         // 本关剩余时间
diff             // 左右重量差的绝对值
unbalanceLeft    // 失衡后剩余救回时间
currentGood      // 当前待放置货物
leftGoods        // 左担货物对象数组
rightGoods       // 右担货物对象数组
```

`reset()` 会清空全部对局数据。`start()` 会先切换关卡，再调用 `reset()`，生成第一件货物并进入 `running`。

## 7. 一次放置发生了什么

核心入口是 `GameController.handleTap(side)`。

它首先拒绝以下输入：

```js
state !== "running"        // 对局没有进行
!currentGood               // 当前没有待放货物
placeCooldownLeft > 0      // 落物动画尚未完成
side 不是 left 或 right    // 非法方向
```

有效点击按以下顺序执行：

1. 将 `currentGood` 放入 `leftGoods` 或 `rightGoods`。
2. 累加对应侧重量。
3. 累加 `totalValue`。
4. 发出一个 `place` 反馈事件。
5. 清空 `currentGood`，启动落物期间的输入冷却。
6. 立即重新计算平衡状态。
7. 判断是否满足通关条件。
8. 未通关且没有失败时，立即生成下一件货物。

当前通关条件是：

```js
totalValue >= level.targetValue && diff < level.threshold
```

所以达到目标价值且仍然平衡时会立即通关，不需要等到时间结束。

## 8. 平衡与失败规则

`GameController.updateBalance(dt)` 首先计算：

```js
diff = Math.abs(leftWeight - rightWeight)
```

然后按照当前关卡参数分类：

```js
diff >= threshold       // unbalanced
diff <= perfectDiff     // perfect
diff >= criticalDiff    // critical
其他                     // normal
```

注意边界：

- `diff === threshold` 已经算失衡。
- `isBalanced()` 使用 `diff < threshold`。
- 失衡期间如果将差值降到 `threshold` 以下，会立即脱离失衡并清空救回倒计时。
- 如果 `unbalanceLeft` 降到 0，则调用 `fail("unbalanced")`。

时间结束时，`checkTimeUp()` 再做一次最终判定：

- 价值达标且平衡：成功。
- 价值达标但失衡：以 `unbalanced` 原因失败。
- 价值不足：以 `timeout` 原因失败。

## 9. 关卡和货物数据

所有关卡数值集中在 `js/core/levels.js`，优先在这里调难度，不要把关卡数值写进 View。

### 9.1 货物基础数据

```js
gold: {
  id: "gold",
  name: "金块",
  weight: 4,
  value: 120,
}
```

- `id`：代码识别和决定绘制形状。
- `name`：货物中文名称。
- `weight`：放入担子后增加的重量。
- `value`：放置后增加的总价值。

修改 `goodsCatalog` 会影响所有使用该货物的关卡。

### 9.2 关卡参数

```js
{
  id: 3,
  name: "失衡救场",
  tip: "失衡后及时救回",
  targetValue: 760,
  timeLimitSec: 26,
  threshold: 4,
  rescueSec: 2.5,
  perfectDiff: 1,
  criticalDiff: 3,
  goodsPool: [],
}
```

| 参数 | 作用 | 数值变大后的通常影响 |
| --- | --- | --- |
| `targetValue` | 通关所需价值 | 更难或耗时更长 |
| `timeLimitSec` | 关卡时间 | 更宽松 |
| `threshold` | 失衡所需重量差 | 更宽松 |
| `rescueSec` | 失衡后的救回时间 | 更宽松 |
| `perfectDiff` | 完美平衡范围 | 更容易触发完美 |
| `criticalDiff` | 临界提示起点 | 更早出现警告 |

应保持以下关系，避免状态区间混乱：

```text
perfectDiff < criticalDiff < threshold
```

### 9.3 货物概率

```js
goodsPool: createPool([
  ["rect", 25],
  ["gold", 10],
  ["stone", 25],
])
```

第二个数字是随机权重，不强制总和为 100。`goodsFactory.pickFromPool()` 会先计算总权重，再进行随机选择。

例如金块权重 10、石头权重 20，表示石头大约是金块出现概率的两倍。

每件货物生成后还有一个递增的 `uid`。它不是货物类型，而是本局中的实例编号，目前用于保证货物堆叠旋转角度稳定。

## 10. 生成节奏

全局节奏位于 `js/core/config.js`：

```js
spawn: {
  intervalSec: 1,
  previewCount: 1,
  dropAnimSec: 0.35,
}
```

- `dropAnimSec` 同时控制落物动画时长和放置输入冷却，是当前手感的主要节奏参数。
- `intervalSec` 是没有 `currentGood` 时的兜底生成间隔。
- 当前 `handleTap()` 会在放置结束后立即调用 `spawnGood()`，因此正常连续操作中几乎感受不到 `intervalSec`。
- `previewCount` 当前尚未被 View 使用。

## 11. 反馈事件机制

核心规则不会直接绘制动画，而是通过 `pushFeedback()` 发出事件：

```js
{ type: "place", side, good, sideCount }
{ type: "perfect", diff }
{ type: "critical", diff }
{ type: "unbalanced", rescueSec }
{ type: "success" }
{ type: "fail", reason }
```

`Main.dispatchFeedbackEvents()` 每帧调用 `consumeFeedbackEvents()` 取出事件，然后：

1. 成功事件交给 `ProgressManager` 保存进度。
2. 全部事件交给 `FeedbackView` 生成视觉表现。
3. 全部事件交给 `SoundManager` 播放对应音效。

这种结构的意义是：游戏规则只描述“发生了什么”，View 决定“怎么表现”。

## 12. 渲染顺序

`Main.render()` 的顺序是：

```js
BasketView      // 背景、人物、担框和静态货物
FeedbackView    // 落物、浮字、提示等动态反馈
Hud             // 顶部信息
ResultView      // 最上层结算遮罩
```

后绘制的内容会覆盖先绘制的内容。因此结算页总是在最上层，HUD 也不会被普通场景遮住。

失衡震动只包裹 `BasketView`，HUD 和结算弹框不会一起抖动。

## 13. Canvas 清晰度和坐标

`Main.setupCanvas()` 同时保存逻辑尺寸和物理像素尺寸：

```js
canvas.width = screenWidth * dpr
canvas.height = screenHeight * dpr
ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
```

绘制代码仍然使用手机 CSS 像素坐标，但 Canvas 内部拥有足够的物理像素，所以真机文字和线条更清晰。

`hudHeight = 126` 同时是顶部 HUD 高度和游戏场景开始位置。改变它会影响顶部栏与下方场景的分界。

当前代码读取了 `safeTop` 和微信右上角菜单按钮位置，但 HUD 仍主要使用固定坐标，没有根据这两个值自动布局。

## 14. 各 View 的职责

### 14.1 Hud

`js/view/hud.js`：

- `drawTopBar()`：时间、目标、价值、关卡和阈值。
- `drawTitle()`：游戏标题。
- `drawBalanceHint()`：平衡状态条。
- `getBalanceStyle()`：不同平衡状态的颜色和文字。

常用坐标：

```js
topY = 30     // 左右信息起始高度
titleY = 60   // 标题中心高度
y = 88        // 平衡状态条顶部
```

### 14.2 BasketView

`js/view/basketView.js`：

- `drawStage()`：左右背景区域。
- `drawCurrentGood()`：顶部待落货物。
- `drawCarrier()`、`drawWorker()`：扁担和挑夫。
- `getCarrierPose()`：根据平衡状态决定人物表情、身体和扁担角度。
- `drawBasket()`：左右担框、实时总重量和已放货物。
- `drawGood()`：不同货物形状。

角色大小目前由 `drawCarrier()` 和 `drawWorker()` 中的 `ctx.scale(1.18, 1.18)` 控制。

### 14.3 BasketLayout

`js/view/basketLayout.js` 集中保存担框和堆叠参数：

```js
BASKET_WIDTH = 120
BASKET_HEIGHT = 54
BASKET_MARGIN_X = 32
BASKET_BOTTOM_MARGIN = 72
COLUMNS = 3
MAX_VISIBLE_GOODS = 18
ITEM_SIZE = 34
COLUMN_STEP = 40
ROW_STEP = 27
```

当前是每层 3 件、最多显示 18 件，即最多 6 层。层数近似为：

```text
ceil(MAX_VISIBLE_GOODS / COLUMNS)
```

超过最大显示数量后，只保留最近的可见货物，并在担子标签后显示 `+N`。槽位循环使用，避免整堆货物在每次放置后整体跳位。

### 14.4 FeedbackView

`js/view/feedbackView.js` 管理带持续时间的临时表现：

- `sideFlashes`：点击侧高亮。
- `flyingGoods`：货物下落动画。
- `floatingTexts`：价值浮字。
- `centerHints`：关卡、完美、临界和失衡提示。
- `shakeTime`：失衡震动。

`addPlaceFeedback()` 使用 `BasketLayout.getLandingPose()` 计算落点，因此飞行动画终点与最终堆叠位置一致。

### 14.5 ResultView

`js/view/resultView.js`：

- `render()`：绘制遮罩、结果文字和按钮。
- `hitTest()`：判断触摸是否命中按钮。
- `getPrimaryButtonText()`：决定“再来一局 / 下一关 / 从头再来”。
- `getPrimaryAction()`：将按钮转换为实际动作。
- `getFailText()`：将失败原因转换为中文提示。

目前按钮坐标在 `render()` 和 `hitTest()` 中各写了一次。修改按钮位置或尺寸时必须同步修改两处，否则会出现“按钮画在这里，但点击区域在别处”的问题。

## 15. 进度存档

`ProgressManager` 使用微信同步本地存储，键名是：

```text
goldenShoulder.progress.v1
```

保存结构：

```js
{
  currentLevelIndex: 0,
  highestCompletedIndex: -1,
  campaignCompleted: false,
}
```

- `load()`：读取并校验进度。
- `completeLevel()`：完成当前关并把当前关卡指向下一关。
- `saveCurrentLevel()`：开始某关时记录当前关。
- `reset()`：恢复第一关和未完成状态。

当前没有关卡选择界面，所以启动游戏时会直接进入 `currentLevelIndex` 对应的关卡。

## 16. 音效

音效开关和文件路径在 `js/core/config.js`：

```js
audio: {
  enabled: false,
  volume: 0.55,
  sources: {},
}
```

`SoundManager.update(events)` 根据反馈事件播放音效。当前 `enabled` 为 `false`，所以音频文件虽然存在，但不会初始化和播放。

## 17. 常见修改位置

### 修改某关难度

编辑 `js/core/levels.js` 对应关卡：

- 价值太容易达到：提高 `targetValue`，或降低高价值货物概率。
- 时间太宽松：降低 `timeLimitSec`。
- 太容易保持平衡：降低 `threshold`。
- 失衡后太容易救回：降低 `rescueSec`。

一次只改一到两个变量并实际体验，否则很难判断是哪项修改改变了手感。

### 新增货物类型

需要至少修改三处：

1. 在 `levels.js` 的 `goodsCatalog` 中添加数据。
2. 在 `basketView.js` 的 `drawGood()` 和 `getGoodColor()` 中添加落地外观。
3. 在 `feedbackView.js` 的 `drawGood()` 和 `getGoodColor()` 中添加飞行动画外观。

然后把货物加入需要出现的关卡 `goodsPool`。

### 调整点击节奏

编辑 `config.js` 的 `dropAnimSec`。它同时影响动画和输入冷却，减小会让连续点击更快。

### 调整 HUD

编辑 `hud.js` 中的 `topY`、`titleY` 和状态条 `y`。如果要改变 HUD 总高度，同时检查 `main.js` 中的 `hudHeight`。

### 调整担框和堆叠

编辑 `basketLayout.js`：

- 水平位置：`BASKET_MARGIN_X`。
- 底部高度：`BASKET_BOTTOM_MARGIN`。
- 每层数量：`COLUMNS`。
- 最大显示量：`MAX_VISIBLE_GOODS`。
- 货物大小：`ITEM_SIZE`。
- 横向间距：`COLUMN_STEP`。
- 层间距：`ROW_STEP`。

改变列数或货物尺寸后，应同时检查 320、375 和 430 像素宽的设备，避免左右越界。

### 调整人物动作

编辑 `basketView.js` 的 `getCarrierPose()`：

```js
poleTilt   // 扁担角度
bodyTilt   // 身体角度
face       // 表情
fallen     // 是否倒地
```

左右方向由 `getTiltDirection()` 根据哪侧更重决定。

### 调整结算页

编辑 `resultView.js`。按钮的位置和尺寸必须同时更新 `render()` 与 `hitTest()`。

### 清空测试进度

可以在微信开发者工具中清除缓存，或者临时调用：

```js
this.progressManager.reset()
```

测试完成后不要把临时重置代码留在正式版本中。

## 18. 当前需要注意的代码关系

以下部分目前可以工作，但修改时容易遗漏：

1. `BasketView` 和 `FeedbackView` 各自实现了一份 `drawGood()` 和颜色映射，修改货物外观时必须同步。
2. `ResultView` 的按钮绘制坐标和点击坐标重复，必须同步调整。
3. `safeTop` 和菜单按钮位置已读取，但没有真正参与 HUD 自动布局。
4. `config.ui`、`spawn.previewCount`、`type.js` 和 `utils.js` 当前没有实际用途。
5. `spawn.intervalSec` 当前主要是兜底逻辑，正常放置后下一件货物会立即生成。
6. 项目没有自动化测试框架，修改核心规则后需要在微信开发者工具和真机中回归体验。

后续代码量继续增长时，优先考虑把重复的货物绘制逻辑和结算按钮布局提取成共享模块。

## 19. 推荐阅读顺序

第一次阅读项目时，建议按以下顺序：

1. `js/core/levels.js`：先理解游戏中的数据。
2. `js/core/gameController.js`：理解放置、平衡和胜负。
3. `js/main.js`：理解输入、循环和模块如何连接。
4. `js/view/hud.js`：从最简单的 View 开始理解 Canvas 绘制。
5. `js/view/basketLayout.js` 和 `basketView.js`：理解主场景布局。
6. `js/view/feedbackView.js`：理解带时间的动画对象。
7. `js/view/resultView.js`：理解结算输入和绘制。
8. `progressManager.js` 与 `soundManager.js`：最后阅读外围系统。

阅读某段代码时，先看函数输入和它修改的字段，再看它调用了哪些函数。不要只依赖行号定位，因为后续增删代码会使行号变化。
