// js/view/resultView.js

class ResultView {
  render(ctx, controller, width, height, visible = true) {
    if (controller.state !== "success" && controller.state !== "fail") return
    if (!visible) return

    ctx.fillStyle = "rgba(12, 14, 18, 0.78)"
    ctx.fillRect(0, 0, width, height)

    const isSuccess = controller.state === "success"
    const isCampaignComplete = isSuccess && controller.isLastLevel()
    const title = isCampaignComplete ? "全部通关" : isSuccess ? "通关成功" : "挑战失败"
    const detail = isCampaignComplete
      ? "五个教学关已完成"
      : isSuccess
        ? `${controller.level.name} 完成`
        : this.getFailText(controller.failReason)
    const panelWidth = Math.min(300, width - 40)
    const panelHeight = 176
    const panelX = (width - panelWidth) / 2
    const panelY = height / 2 - panelHeight / 2

    ctx.fillStyle = "rgba(32, 39, 47, 0.92)"
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight)

    ctx.strokeStyle = isSuccess ? "#7dcf6d" : "#d87869"
    ctx.lineWidth = 3
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight)

    ctx.fillStyle = isSuccess ? "#b7f0a1" : "#ffb0a8"
    ctx.font = "34px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(title, width / 2, panelY + 42)

    ctx.fillStyle = "#f4f0df"
    ctx.font = "20px Arial"
    ctx.fillText(detail, width / 2, panelY + 78)

    this.drawButton(ctx, panelX + 22, panelY + 108, 116, 42, "查看现场", "#344756")
    this.drawButton(
      ctx,
      panelX + panelWidth - 138,
      panelY + 108,
      116,
      42,
      this.getPrimaryButtonText(controller),
      "#3e6b45"
    )
    ctx.textAlign = "left"
  }

  drawButton(ctx, x, y, width, height, text, color) {
    ctx.fillStyle = color
    ctx.fillRect(x, y, width, height)

    ctx.strokeStyle = "rgba(244, 240, 223, 0.35)"
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)

    ctx.fillStyle = "#f4f0df"
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(text, x + width / 2, y + height / 2)
  }

  hitTest(x, y, width, height, controller) {
    const panelWidth = Math.min(300, width - 40)
    const panelHeight = 176
    const panelX = (width - panelWidth) / 2
    const panelY = height / 2 - panelHeight / 2
    const viewButton = {
      x: panelX + 22,
      y: panelY + 108,
      width: 116,
      height: 42,
    }
    const restartButton = {
      x: panelX + panelWidth - 138,
      y: panelY + 108,
      width: 116,
      height: 42,
    }

    if (this.isInside(x, y, viewButton)) return "viewScene"
    if (this.isInside(x, y, restartButton)) return this.getPrimaryAction(controller)
    return null
  }

  getPrimaryButtonText(controller) {
    if (controller.state !== "success") return "再来一局"
    return controller.isLastLevel() ? "从头再来" : "下一关"
  }

  getPrimaryAction(controller) {
    if (controller.state !== "success") return "restart"
    return controller.isLastLevel() ? "restartCampaign" : "nextLevel"
  }

  isInside(x, y, rect) {
    return (
      x >= rect.x &&
      x <= rect.x + rect.width &&
      y >= rect.y &&
      y <= rect.y + rect.height
    )
  }

  getFailText(reason) {
    if (reason === "unbalanced") return "左右失衡，扛不住了"
    if (reason === "timeout") return "时间结束，价值不足"
    return "未达成目标"
  }
}

module.exports = ResultView
