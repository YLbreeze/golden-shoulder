// js/core/gamecontroller.js

const config = require("./config")
const goodsFactory = require("./goodsFactory")

class GameController {
  constructor() {
    this.reset()
  }
  reset() {
    //基础状态
    this.state = "ready" //ready|running|success|fail
    this.balanceState = "normal" //normal|critical|unbalanced
    this.failReason = null //timeout|unbalanced|null
    this.feedbackEvent = null
    this.feedbackEvents = []

    //数值
    this.leftWeight = 0
    this.rightWeight = 0
    this.totalValue = 0
    this.timeLeft = config.level.timeLimitSec
    this.unbalanceLeft = 0
    this.diff = 0

    //生成相关
    this.spawnTimer = 0
    this.currentGood = null
    this.leftGoods = []
    this.rightGoods = []
    this.lastPlacedGood = null

    goodsFactory.resetGoodUid()
  }

  start() {
    this.reset()
    this.state = "running"
    console.log("Game Started")
  }

  tick(dt) {
    if (this.state !== "running") return

    //更新总倒计时
    this.timeLeft -= dt
    if (this.timeLeft <= 0) {
      this.checkTimeUp()
      return
    }
    //生成货物
    this.spawnTimer += dt
    if (!this.currentGood && this.spawnTimer >= config.spawn.intervalSec) {
      this.spawnTimer = 0
      this.currentGood = goodsFactory.createGood()
      console.log("生成货物", this.currentGood)
    }

    //更新平衡状态
    this.updateBalance(dt)
  }

  handleTap(side) {
    if (this.state !== "running") return
    if (!this.currentGood) return
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
    this.pushFeedback({
      type: "place",
      side,
      good,
    })

    console.log(
      `放置到${side}`,
      "LW:", this.leftWeight,
      "RW:", this.rightWeight,
      "V:", this.totalValue
    )
    this.currentGood = null

    this.updateBalance(0)

    //达成目标时必须仍处于可接受平衡范围
    if (this.totalValue >= config.level.targetValue && this.isBalanced()) {
      this.state = "success"
      this.pushFeedback({
        type: "success",
      })
      console.log("成功通关！")
    }
  }

  updateBalance(dt) {
    this.diff = Math.abs(this.leftWeight - this.rightWeight)

    if (this.diff >= config.level.threshold) {
      //进入失衡
      if (this.balanceState !== "unbalanced") {
        this.unbalanceLeft = config.level.rescueSec
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
      if (this.diff <= config.balanceHint.perfectDiff) {
        this.balanceState = "perfect"
      } else if (this.diff >= config.balanceHint.criticalDiff) {
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

    if (this.totalValue >= config.level.targetValue && this.isBalanced()) {
      this.state = "success"
      this.pushFeedback({
        type: "success",
      })
      console.log("时间到，成功通关")
    } else {
      this.fail(this.totalValue >= config.level.targetValue ? "unbalanced" : "timeout")
      console.log("时间到，失败")
    }
  }

  isBalanced() {
    return this.diff < config.level.threshold
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
