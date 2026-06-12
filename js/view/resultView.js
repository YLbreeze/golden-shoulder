// js/view/resultView.js

const config = require("../core/config")

class ResultView {
  render(ctx, controller, width, height) {
    if (controller.state !== "success" && controller.state !== "fail") return

    ctx.fillStyle = "rgba(12, 14, 18, 0.78)"
    ctx.fillRect(0, 0, width, height)

    const isSuccess = controller.state === "success"
    const title = isSuccess ? "通关成功" : "挑战失败"
    const detail = isSuccess ? "货物价值达标" : this.getFailText(controller.failReason)
    const panelWidth = Math.min(300, width - 40)
    const panelHeight = 230
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

    ctx.font = "17px Arial"
    ctx.fillText(
      `价值 ${controller.totalValue} / ${config.level.targetValue}`,
      width / 2,
      panelY + 116
    )
    ctx.fillText(
      `左担 ${controller.leftWeight}    右担 ${controller.rightWeight}`,
      width / 2,
      panelY + 145
    )

    ctx.fillStyle = "#2d3944"
    ctx.fillRect(width / 2 - 88, panelY + 171, 176, 38)
    ctx.fillStyle = "#f4f0df"
    ctx.font = "16px Arial"
    ctx.fillText("点击任意位置再来一局", width / 2, panelY + 190)
    ctx.textAlign = "left"
  }

  getFailText(reason) {
    if (reason === "unbalanced") return "左右失衡，扛不住了"
    if (reason === "timeout") return "时间结束，价值不足"
    return "未达成目标"
  }
}

module.exports = ResultView
