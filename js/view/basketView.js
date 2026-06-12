// js/view/basketView.js

class BasketView {
  render(ctx, controller, width, height, topOffset = 130) {
    this.drawStage(ctx, width, height, topOffset)
    this.drawCurrentGood(ctx, controller.currentGood, width, topOffset)
    this.drawCarrier(ctx, width, height, controller)
    this.drawBasket(ctx, controller.leftGoods, 32, height - 72, "left")
    this.drawBasket(ctx, controller.rightGoods, width - 152, height - 72, "right")
  }

  drawStage(ctx, width, height, topOffset) {
    ctx.fillStyle = "#20252b"
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = "#2c343d"
    ctx.fillRect(0, topOffset, width / 2, height - topOffset)
    ctx.fillStyle = "#26313a"
    ctx.fillRect(width / 2, topOffset, width / 2, height - topOffset)

    ctx.strokeStyle = "#65707a"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(width / 2, topOffset)
    ctx.lineTo(width / 2, height)
    ctx.stroke()
  }

  drawCurrentGood(ctx, good, width, topOffset) {
    const labelY = topOffset + 18
    const goodY = topOffset + 46

    ctx.fillStyle = "#d9d2bd"
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText("待落货物", width / 2, labelY)

    if (!good) {
      ctx.fillStyle = "#89919a"
      ctx.fillText("...", width / 2, goodY)
      ctx.textAlign = "left"
      return
    }

    this.drawGood(ctx, good, width / 2 - 24, goodY, 48, true)
    ctx.textAlign = "left"
  }

  drawCarrier(ctx, width, height, controller) {
    const cx = width / 2
    const baseY = height - 108
    const pose = this.getCarrierPose(controller)

    ctx.save()
    ctx.translate(cx, baseY)
    ctx.scale(1.18, 1.18)
    ctx.rotate((pose.poleTilt * Math.PI) / 180)

    this.drawPole(ctx)

    ctx.restore()

    this.drawWorker(ctx, cx, baseY, pose)
  }

  drawPole(ctx) {
    ctx.strokeStyle = "#caa35b"
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(-124, -34)
    ctx.lineTo(124, -34)
    ctx.stroke()
  }

  drawWorker(ctx, cx, baseY, pose) {
    ctx.save()
    ctx.translate(cx, baseY)
    ctx.scale(1.18, 1.18)
    ctx.rotate((pose.bodyTilt * Math.PI) / 180)

    if (pose.fallen) {
      ctx.rotate((Math.PI / 2) * pose.fallDirection)
      ctx.translate(18 * pose.fallDirection, -12)
    }

    // Legs
    ctx.strokeStyle = "#5b4734"
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(-8, 0)
    ctx.lineTo(-18, 22)
    ctx.moveTo(8, 0)
    ctx.lineTo(18, 22)
    ctx.stroke()

    // Body
    ctx.fillStyle = "#d8b56d"
    ctx.fillRect(-15, -31, 30, 34)

    // Arms holding the pole near the shoulder
    ctx.strokeStyle = "#d6a35f"
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(-13, -24)
    ctx.lineTo(-38, -35)
    ctx.moveTo(13, -24)
    ctx.lineTo(38, -35)
    ctx.stroke()

    ctx.fillStyle = "#efe1bd"
    ctx.fillRect(-42, -38, 8, 8)
    ctx.fillRect(34, -38, 8, 8)

    // Neck
    ctx.fillStyle = "#d6a35f"
    ctx.fillRect(-5, -38, 10, 8)

    // Head
    ctx.fillStyle = "#efe1bd"
    ctx.fillRect(-13, -60, 26, 24)

    // Hat
    ctx.fillStyle = "#a86d32"
    ctx.fillRect(-17, -65, 34, 6)
    ctx.fillRect(-10, -72, 20, 8)

    this.drawFace(ctx, pose.face)
    ctx.restore()
  }

  drawFace(ctx, face) {
    ctx.fillStyle = "#101214"

    if (face === "dead") {
      ctx.strokeStyle = "#101214"
      ctx.lineWidth = 2
      this.drawCross(ctx, -7, -49)
      this.drawCross(ctx, 7, -49)
      ctx.beginPath()
      ctx.moveTo(-6, -40)
      ctx.lineTo(6, -40)
      ctx.stroke()
      return
    }

    if (face === "happy") {
      ctx.fillRect(-8, -51, 4, 4)
      ctx.fillRect(5, -51, 4, 4)
      ctx.strokeStyle = "#101214"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, -45, 7, 0.1 * Math.PI, 0.9 * Math.PI)
      ctx.stroke()
      return
    }

    if (face === "nervous") {
      ctx.fillRect(-9, -52, 5, 5)
      ctx.fillRect(4, -52, 5, 5)
      ctx.fillRect(-7, -42, 14, 3)
      return
    }

    if (face === "panic") {
      ctx.fillRect(-10, -53, 6, 6)
      ctx.fillRect(4, -53, 6, 6)
      ctx.strokeStyle = "#101214"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, -42, 5, 0, Math.PI * 2)
      ctx.stroke()
      return
    }

    ctx.fillRect(-8, -51, 4, 4)
    ctx.fillRect(5, -51, 4, 4)
    ctx.fillRect(-5, -42, 10, 2)
  }

  drawCross(ctx, x, y) {
    ctx.beginPath()
    ctx.moveTo(x - 4, y - 4)
    ctx.lineTo(x + 4, y + 4)
    ctx.moveTo(x + 4, y - 4)
    ctx.lineTo(x - 4, y + 4)
    ctx.stroke()
  }

  getCarrierPose(controller) {
    const direction = this.getTiltDirection(controller)

    if (controller.state === "fail") {
      return {
        poleTilt: 18 * direction,
        bodyTilt: 16 * direction,
        fallDirection: direction,
        face: "dead",
        fallen: true,
      }
    }

    if (controller.balanceState === "unbalanced") {
      return {
        poleTilt: 12 * direction,
        bodyTilt: 9 * direction,
        fallDirection: direction,
        face: "panic",
        fallen: false,
      }
    }

    if (controller.balanceState === "critical") {
      return {
        poleTilt: 6 * direction,
        bodyTilt: 4 * direction,
        fallDirection: direction,
        face: "nervous",
        fallen: false,
      }
    }

    if (controller.balanceState === "perfect") {
      return {
        poleTilt: 0,
        bodyTilt: 0,
        fallDirection: direction,
        face: "happy",
        fallen: false,
      }
    }

    return {
      poleTilt: 0,
      bodyTilt: 0,
      fallDirection: direction,
      face: "normal",
      fallen: false,
    }
  }

  getTiltDirection(controller) {
    if (controller.leftWeight > controller.rightWeight) return -1
    if (controller.rightWeight > controller.leftWeight) return 1
    return 1
  }

  drawBasket(ctx, goods, x, bottomY, side) {
    const basketWidth = 120
    const basketHeight = 54

    ctx.strokeStyle = side === "left" ? "#6fb16c" : "#6aa2d8"
    ctx.lineWidth = 4
    ctx.strokeRect(x, bottomY - basketHeight, basketWidth, basketHeight)

    ctx.fillStyle = "#d9d2bd"
    ctx.font = "15px Arial"
    ctx.textBaseline = "top"
    ctx.textAlign = "center"
    ctx.fillText(side === "left" ? "左担" : "右担", x + basketWidth / 2, bottomY + 8)

    let cursorY = bottomY - basketHeight - 10
    for (let i = goods.length - 1; i >= 0; i--) {
      const good = goods[i]
      this.drawGood(ctx, good, x + 36, cursorY - 24, 48, false)
      cursorY -= 28
      if (cursorY < 214) break
    }
    ctx.textAlign = "left"
  }

  drawGood(ctx, good, x, y, size, showValue) {
    const color = this.getGoodColor(good.id)
    ctx.fillStyle = color

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
    } else {
      ctx.fillRect(x, y, size, size)
    }

    ctx.fillStyle = "#171717"
    ctx.font = "14px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`w${good.weight}`, x + size / 2, y + size / 2)

    if (showValue) {
      ctx.fillStyle = "#f4f0df"
      ctx.textBaseline = "top"
      ctx.fillText(`v${good.value}`, x + size / 2, y + size + 8)
    }
  }

  getGoodColor(id) {
    if (id === "rect") return "#e7bd55"
    if (id === "trapezo") return "#d97755"
    return "#79b6d9"
  }
}

module.exports = BasketView
