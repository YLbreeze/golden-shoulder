// js/view/hud.js

class Hud {
  render(ctx, controller, width) {
    this.drawTopBar(ctx, controller, width)
    this.drawTitle(ctx, width)
    this.drawBalanceHint(ctx, controller, width)
  }

  drawTopBar(ctx, controller, width) {
    const topY = 30

    ctx.fillStyle = "#15191f"
    ctx.fillRect(0, 0, width, 126)

    ctx.fillStyle = "#f4f0df"
    ctx.font = "16px Arial"
    ctx.textBaseline = "top"
    ctx.fillText(`时间 ${Math.ceil(controller.timeLeft)}s`, 18, topY)
    ctx.fillText(`目标 ${controller.level.targetValue}`, 18, topY + 24)
    ctx.fillText(`价值 ${controller.totalValue}`, 18, topY + 48)

    ctx.textAlign = "right"
    ctx.fillText(
      `${controller.currentLevelIndex + 1}/${controller.totalLevels}关 · 阈值${controller.level.threshold}`,
      width - 18,
      topY
    )
    ctx.textAlign = "left"
  }

  drawTitle(ctx, width) {
    const titleY = 60

    ctx.fillStyle = "#f1c15d"
    ctx.font = "26px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.lineWidth = 5
    ctx.strokeStyle = "#101214"
    ctx.strokeText("黄金扛工", width / 2, titleY)
    ctx.fillText("黄金扛工", width / 2, titleY)
    ctx.textAlign = "left"
  }

  drawBalanceHint(ctx, controller, width) {
    const style = this.getBalanceStyle(controller)
    const boxWidth = Math.min(220, width - 40)
    const x = (width - boxWidth) / 2
    const y = 88

    ctx.fillStyle = style.bg
    ctx.fillRect(x, y, boxWidth, 34)

    ctx.fillStyle = style.fg
    ctx.font = "17px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(style.text, width / 2, y + 17)
    ctx.textAlign = "left"
  }

  getBalanceStyle(controller) {
    if (controller.balanceState === "unbalanced") {
      return {
        bg: "#7f2431",
        fg: "#fff3d6",
        text: `失衡 ${Math.max(0, controller.unbalanceLeft).toFixed(1)}s`,
      }
    }

    if (controller.balanceState === "critical") {
      return {
        bg: "#7a5a12",
        fg: "#fff3d6",
        text: "临界平衡",
      }
    }

    if (controller.balanceState === "perfect") {
      return {
        bg: "#236b47",
        fg: "#efffed",
        text: "完美平衡",
      }
    }

    return {
      bg: "#283848",
      fg: "#e8f0fa",
      text: "平衡",
    }
  }
}

module.exports = Hud
