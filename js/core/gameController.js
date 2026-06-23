// js/core/gamecontroller.js

const config = require("./config")
const goodsFactory = require("./goodsFactory")

class GameController {
  constructor(level = config.levels[0], currentLevelIndex = 0, totalLevels = 1) {
    this.level = level
    this.currentLevelIndex = currentLevelIndex
    this.totalLevels = totalLevels
    this.reset()
  }
  reset() {
    //基础状态
    this.state = "ready" //ready|running|success|fail
    this.balanceState = "perfect" //perfect|normal|critical|unbalanced
    this.failReason = null //timeout|unbalanced|null
    this.feedbackEvent = null
    this.feedbackEvents = []

    //数值
    this.leftWeight = 0
    this.rightWeight = 0
    this.totalValue = 0
    this.timeLeft = this.level.timeLimitSec
    this.unbalanceLeft = 0
    this.diff = 0

    //生成相关
    this.spawnTimer = 0
    this.currentGood = null
    this.placeCooldownLeft = 0
    this.leftGoods = []
    this.rightGoods = []
    this.lastPlacedGood = null

    goodsFactory.resetGoodUid()
  }

  start(
    level = this.level,
    currentLevelIndex = this.currentLevelIndex,
    totalLevels = this.totalLevels
  ) {
    this.level = level
    this.currentLevelIndex = currentLevelIndex
    this.totalLevels = totalLevels
    this.reset()
    this.state = "running"
    this.spawnGood()
    this.pushFeedback({
      type: "levelStart",
      text: `第${this.currentLevelIndex + 1}关 ${this.level.tip}`,
    })
    console.log("Game Started", this.level.name)
  }

  tick(dt) {
    if (this.state !== "running") return

    this.placeCooldownLeft = Math.max(0, this.placeCooldownLeft - dt)

    //更新总倒计时
    this.timeLeft -= dt
    if (this.timeLeft <= 0) {
      this.checkTimeUp()
      return
    }
    //生成货物
    this.spawnTimer += dt
    if (!this.currentGood && this.spawnTimer >= config.spawn.intervalSec) {
      this.spawnGood()
    }

    //更新平衡状态
    this.updateBalance(dt)
  }

  handleTap(side) {
    if (this.state !== "running") return
    if (!this.currentGood) return
    if (this.placeCooldownLeft > 0) return
    if (side !== "left" && side !== "right") return

    const good = this.currentGood

    if (side === "left") {
      this.leftGoods.push(good)
      this.leftWeight += good.weight
    } else {
      this.rightGoods.push(good)
      this.rightWeight += good.weight
    }

    this.totalValue += good.value
    this.lastPlacedGood = {
      side,
      good,
    }
    const sideCount = side === "left" ? this.leftGoods.length : this.rightGoods.length
    this.pushFeedback({
      type: "place",
      side,
      good,
      sideCount,
    })

    console.log(
      `放置到${side}`,
      "LW:", this.leftWeight,
      "RW:", this.rightWeight,
      "V:", this.totalValue
    )
    this.currentGood = null
    this.placeCooldownLeft = config.spawn.dropAnimSec

    this.updateBalance(0)

    //达成目标时必须仍处于可接受平衡范围
    if (this.totalValue >= this.level.targetValue && this.isBalanced()) {
      this.state = "success"
      this.pushFeedback({
        type: "success",
      })
      console.log("成功通关！")
    } else if (this.state === "running") {
      this.spawnGood()
    }
  }

  spawnGood() {
    this.spawnTimer = 0
    this.currentGood = goodsFactory.createGood(this.level.goodsPool)
    console.log("生成货物", this.currentGood)
  }

  updateBalance(dt) {
    this.diff = Math.abs(this.leftWeight - this.rightWeight)

    if (this.diff >= this.level.threshold) {
      //进入失衡
      if (this.balanceState !== "unbalanced") {
        this.unbalanceLeft = this.level.rescueSec
        this.pushFeedback({
          type: "unbalanced",
          rescueSec: this.unbalanceLeft,
        })
      }
      this.balanceState = "unbalanced"
      this.unbalanceLeft -= dt

      if (this.unbalanceLeft <= 0) {
        this.fail("unbalanced")
      }
    } else {
      const prevBalanceState = this.balanceState

      //未失衡
      if (this.diff <= this.level.perfectDiff) {
        this.balanceState = "perfect"
      } else if (this.diff >= this.level.criticalDiff) {
        this.balanceState = "critical"
      } else {
        this.balanceState = "normal"
      }
      this.unbalanceLeft = 0

      if (prevBalanceState !== this.balanceState) {
        this.pushFeedback({
          type: this.balanceState,
          diff: this.diff,
        })
      }
    }
  }

  checkTimeUp() {
    this.timeLeft = 0
    this.updateBalance(0)

    if (this.totalValue >= this.level.targetValue && this.isBalanced()) {
      this.state = "success"
      this.pushFeedback({
        type: "success",
      })
      console.log("时间到，成功通关")
    } else {
      this.fail(this.totalValue >= this.level.targetValue ? "unbalanced" : "timeout")
      console.log("时间到，失败")
    }
  }

  isBalanced() {
    return this.diff < this.level.threshold
  }

  isLastLevel() {
    return this.currentLevelIndex >= this.totalLevels - 1
  }

  fail(reason) {
    if (this.state === "fail") return

    this.state = "fail"
    this.failReason = reason
    this.pushFeedback({
      type: "fail",
      reason,
    })
  }

  pushFeedback(event) {
    this.feedbackEvent = event
    this.feedbackEvents.push(event)
  }

  consumeFeedbackEvents() {
    const events = this.feedbackEvents
    this.feedbackEvents = []
    return events
  }
}

module.exports = GameController
