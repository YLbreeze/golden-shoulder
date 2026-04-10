// js/core/gamecontroller.js

const config = require("./config")

class GameController {
  constructor() {
    this.reset()
  }
  reset() {
    //基础状态
    this.state = "ready" //ready|running|success|fail
    this.balanceState = "normal" //normal|critical|unbalanced

    //数值
    this.leftWeight = 0
    this.rightWeight = 0
    this.totalValue = 0
    this.timeLeft = config.level.timeLimitSec
    this.unbalanceLeft = 0

    //生成相关
    this.spawnTimer = 0
    this.currentGood = null
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
      this.currentGood = this.generateGood()
      console.log("生成货物", this.currentGood)
    }

    //更新平衡状态
    this.updateBalance(dt)
  }

  handleTap(side) {
    if (this.state !== "running") return
    if (!this.currentGood) return
    if (side === "left") {
      this.leftWeight += this.currentGood.weight
    } else {
      this.rightWeight += this.currentGood.weight
    }
    this.totalValue += this.currentGood.value

    console.log(
      `放置到${side}`,
      "LW:", this.leftWeight,
      "RW:", this.rightWeight,
      "V:", this.totalValue
    )
    this.currentGood = null

    //达成目标立即成功
    if (this.totalValue >= config.level.targetValue) {
      this.state = "success"
      console.log("成功通关！")
    }
  }

  updateBalance(dt) {
    const diff = Math.abs(this.leftWeight - this.rightWeight)

    if (diff >= config.level.threshold) {
      //进入失衡
      if (this.balanceState !== "unbalanced") {
        this.unbalanceLeft = config.level.rescueSec
      }
      this.balanceState = "unbalanced"
      this.unbalanceLeft -= dt

      if (this.unbalanceLeft <= 0) {
        this.state = "fail"
        console.log("失衡失败")
      }
    } else {
      //未失衡
      if (diff <= config.balanceHint.perfectDiff) {
        this.balanceState = "perfect"
      } else if (diff >= config.balanceHint.criticalDiff) {
        this.balanceState = "critical"
      } else {
        this.balanceState = "normal"
      }
      this.unbalanceLeft = 0
    }
  }

  checkTimeUp() {
    if (this.totalValue >= config.level.targetValue && this.balanceState !== "unbalanced") {
      this.state = "success"
      console.log("时间到，成功通关")
    } else {
      this.state = "fail"
      console.log("时间到，失败")
    }
  }

  generateGood() {
    const pool = config.goodsPool
    const totalWeight = pool.reduce((sum, g) => sum + g.prob, 0)
    const rand = Math.random() * totalWeight

    let acc = 0
    for (let g of pool) {
      acc += g.prob
      if (rand <= acc) return g
    }
    return pool[0]
  }
}

module.exports = GameController