// js/view/feedbackView.js

const config = require("../core/config")
const basketLayout = require("./basketLayout")

class FeedbackView {
  constructor() {
    this.sideFlashes = []
    this.flyingGoods = []
    this.floatingTexts = []
    this.centerHints = []
    this.shakeTime = 0
    this.shakeDuration = 0
    this.shakePower = 0
  }

  reset() {
    this.sideFlashes = []
    this.flyingGoods = []
    this.floatingTexts = []
    this.centerHints = []
    this.shakeTime = 0
    this.shakeDuration = 0
    this.shakePower = 0
  }

  update(dt, events, width, height, topOffset = 130) {
    for (const event of events) {
      if (event.type === "place") {
        this.addPlaceFeedback(event, width, height, topOffset)
      } else if (event.type === "levelStart") {
        this.addCenterHint(event.text, "#f1c15d", 1.8, width, height)
      } else if (event.type === "perfect") {
        this.addCenterHint("完美平衡", "#b7f0a1", 0.65, width, height)
      } else if (event.type === "critical") {
        this.addCenterHint("临界平衡", "#ffd166", 0.75, width, height)
      } else if (event.type === "unbalanced") {
        this.addCenterHint("快失衡了", "#ff8f7d", 0.85, width, height)
        this.startShake(0.45, 5)
      }
    }

    if (this.shakeTime > 0) {
      this.shakeTime -= dt
      if (this.shakeTime <= 0) {
        this.shakeTime = 0
        this.shakeDuration = 0
        this.shakePower = 0
      }
    }

    this.updateList(this.sideFlashes, dt)
    this.updateList(this.flyingGoods, dt)
    this.updateList(this.floatingTexts, dt)
    this.updateList(this.centerHints, dt)
  }

  render(ctx, width, height) {
    this.drawSideFlashes(ctx, width, height)
    this.drawFlyingGoods(ctx)
    this.drawFloatingTexts(ctx)
    this.drawCenterHints(ctx)
  }

  getShakeOffset() {
    if (this.shakeTime <= 0 || this.shakeDuration <= 0) {
      return { x: 0, y: 0 }
    }

    const progress = this.shakeTime / this.shakeDuration
    const power = this.shakePower * progress
    const phase = this.shakeTime * 70

    return {
      x: Math.sin(phase) * power,
      y: Math.cos(phase * 1.3) * power * 0.45,
    }
  }

  addPlaceFeedback(event, width, height, topOffset) {
    this.sideFlashes.push({
      side: event.side,
      time: 0.16,
      duration: 0.16,
    })

    const isLeft = event.side === "left"
    const startX = width / 2
    const startY = topOffset + 70
    const landingPose = basketLayout.getLandingPose(
      event.side,
      event.sideCount,
      width,
      height,
      event.good.uid
    )
    const endX = landingPose.x
    const endY = landingPose.y
    const dropDuration = config.spawn.dropAnimSec

    this.flyingGoods.push({
      good: event.good,
      startX,
      startY,
      endX,
      endY,
      endRotation: landingPose.rotation,
      endScale: landingPose.size / 48,
      time: dropDuration,
      duration: dropDuration,
    })

    this.floatingTexts.push({
      text: `+${event.good.value}`,
      x: endX,
      y: Math.max(230, endY - 30),
      vy: -58,
      time: 0.85,
      duration: 0.85,
      delay: dropDuration * 0.72,
      color: isLeft ? "#b7f0a1" : "#9fd2ff",
    })
  }

  updateList(list, dt) {
    for (const item of list) {
      if (item.delay && item.delay > 0) {
        item.delay -= dt
        continue
      }

      item.time -= dt
      if (item.vy) item.y += item.vy * dt
    }

    for (let i = list.length - 1; i >= 0; i--) {
      if ((!list[i].delay || list[i].delay <= 0) && list[i].time <= 0) list.splice(i, 1)
    }
  }

  drawSideFlashes(ctx, width, height) {
    for (const flash of this.sideFlashes) {
      const alpha = Math.max(0, flash.time / flash.duration)
      const x = flash.side === "left" ? 0 : width / 2

      ctx.fillStyle = `rgba(255, 239, 166, ${0.18 * alpha})`
      ctx.fillRect(x, 82, width / 2, height - 82)
    }
  }

  drawFloatingTexts(ctx) {
    ctx.save()
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.font = "22px Arial"

    for (const item of this.floatingTexts) {
      if (item.delay && item.delay > 0) continue

      const alpha = Math.max(0, item.time / item.duration)
      ctx.globalAlpha = alpha
      ctx.lineWidth = 5
      ctx.strokeStyle = "rgba(10, 12, 14, 0.8)"
      ctx.strokeText(item.text, item.x, item.y)
      ctx.fillStyle = item.color
      ctx.fillText(item.text, item.x, item.y)
    }

    ctx.restore()
  }

  drawFlyingGoods(ctx) {
    ctx.save()

    for (const item of this.flyingGoods) {
      const progress = 1 - Math.max(0, item.time / item.duration)
      const eased = this.easeOutCubic(progress)
      const arc = Math.sin(progress * Math.PI) * -34
      const x = this.lerp(item.startX, item.endX, eased)
      const y = this.lerp(item.startY, item.endY, eased) + arc
      const scale = this.lerp(1, item.endScale, eased)
      const rotation = this.lerp(0, item.endRotation, eased)

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.scale(scale, scale)
      this.drawGood(ctx, item.good, -24, -24, 48)
      ctx.restore()
    }

    ctx.restore()
  }

  drawGood(ctx, good, x, y, size) {
    ctx.fillStyle = this.getGoodColor(good.id)

    if (good.id === "rect") {
      ctx.fillRect(x - 8, y + 8, size + 16, size * 0.55)
    } else if (good.id === "trapezo") {
      ctx.beginPath()
      ctx.moveTo(x + 8, y + size * 0.2)
      ctx.lineTo(x + size - 8, y + size * 0.2)
      ctx.lineTo(x + size, y + size * 0.8)
      ctx.lineTo(x, y + size * 0.8)
      ctx.closePath()
      ctx.fill()
    } else if (good.id === "gold") {
      ctx.beginPath()
      ctx.moveTo(x + size / 2, y)
      ctx.lineTo(x + size, y + size / 2)
      ctx.lineTo(x + size / 2, y + size)
      ctx.lineTo(x, y + size / 2)
      ctx.closePath()
      ctx.fill()
    } else if (good.id === "stone") {
      ctx.beginPath()
      ctx.moveTo(x + 8, y + 4)
      ctx.lineTo(x + size - 6, y + 10)
      ctx.lineTo(x + size - 2, y + size - 10)
      ctx.lineTo(x + 12, y + size)
      ctx.lineTo(x + 2, y + size * 0.45)
      ctx.closePath()
      ctx.fill()
    } else {
      ctx.fillRect(x, y, size, size)
    }

    ctx.fillStyle = "#171717"
    ctx.font = "14px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`w${good.weight}`, x + size / 2, y + size / 2)
  }

  getGoodColor(id) {
    if (id === "rect") return "#e7bd55"
    if (id === "trapezo") return "#d97755"
    if (id === "gold") return "#f0d35e"
    if (id === "stone") return "#8d9299"
    return "#79b6d9"
  }

  lerp(start, end, progress) {
    return start + (end - start) * progress
  }

  easeOutCubic(progress) {
    return 1 - Math.pow(1 - progress, 3)
  }

  addCenterHint(text, color, duration, width, height) {
    this.centerHints.push({
      text,
      color,
      x: width / 2,
      y: Math.max(286, height * 0.36),
      scale: 1.18,
      time: duration,
      duration,
    })
  }

  startShake(duration, power) {
    this.shakeTime = duration
    this.shakeDuration = duration
    this.shakePower = power
  }

  drawCenterHints(ctx) {
    ctx.save()
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    for (const hint of this.centerHints) {
      const progress = Math.max(0, hint.time / hint.duration)
      const alpha = Math.min(1, progress * 1.4)
      const size = 28 * (1 + (1 - progress) * 0.16)

      ctx.globalAlpha = alpha
      ctx.font = `${size}px Arial`
      ctx.lineWidth = 6
      ctx.strokeStyle = "rgba(10, 12, 14, 0.85)"
      ctx.strokeText(hint.text, hint.x, hint.y)
      ctx.fillStyle = hint.color
      ctx.fillText(hint.text, hint.x, hint.y)
    }

    ctx.restore()
  }
}

module.exports = FeedbackView
