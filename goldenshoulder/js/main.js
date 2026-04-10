// js/main.js

const GameController = require("./core/gameController");

export default class Main {
    constructor() {
        console.log("[BOOT] Main() constructor");
        // 创建画布（小游戏环境）
        this.canvas = wx.createCanvas()
        console.log('[BOOT] canvas created:', !!this.canvas)
        this.ctx = this.canvas.getContext('2d')

        this.controller = new GameController();
        this.controller.start();

        this.lastTime = Date.now();

        // 绑定触摸（避免 this 丢失）
        wx.onTouchStart(this.onTouchStart.bind(this));

        // 启动循环
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }

    gameLoop() {
        const now = Date.now();
        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        this.controller.tick(dt);

        this.render()

        requestAnimationFrame(this.gameLoop);
    }

    onTouchStart(e) {
        const screenWidth = wx.getSystemInfoSync().screenWidth;
        const x = e.touches[0].clientX;
        this.controller.handleTap(x < screenWidth / 2 ? "left" : "right");
    }

    render() {
        const ctx = this.ctx
        const c = this.controller
        const w = this.canvas.width
        const h = this.canvas.height

        ctx.clearRect(0, 0, w, h)

        // 背景
        ctx.fillStyle = "#222"
        ctx.fillRect(0, 0, w, h)

        //中线
        ctx.stokeStyle = "#555"
        ctx.beginPath()
        ctx.moveTo(w / 2, 0)
        ctx.lineTo(w / 2, h)
        ctx.stroke()

        //顶部信息
        ctx.fillStyle = "#fff"
        ctx.font = "20px Arial"
        ctx.fillText(`Time: ${c.timeLeft.toFixed(1)}`, 20, 30)
        ctx.fillText(`Score: ${c.totalValue}`, 20, 60)

        //当前货物
        if (c.currentGood) {
            ctx.fillStyle = "#f5c542"
            ctx.fillRect(w / 2 - 30, 100, 60, 60)
            ctx.fillStyle = "#000"
            ctx.fillText(`${c.currentGood.weight}`, w / 2 - 10, 140)
        }

        //左右堆叠显示
        this.drawStack(50, h - 50, c.leftWeight, "#4caf50")
        this.drawStack(w - 100, h - 50, c.rightWeight, "#21906f3")

        //成功失败提示
        if (c.state === "success") {
            ctx.fillStyle = "#00ff00"
            ctx.font = "40px Arial"
            ctx.fillText("SUCCESS", w / 2 - 100, h / 2)
        }
        if (c.state === "fail") {
            ctx.fillStyle = "#ff0000"
            ctx.font = "40px Arial"
            ctx.fillText("FAIL", w / 2 - 60, h / 2)
        }
    }

    drawStack(x, bottomY, weight, color) {
        const ctx = this.ctx
        const blockHeight = 10

        ctx.fillStyle = color

        for (let i = 0; i < weight; i++) {
            ctx.fillRect(x, bottomY - i * blockHeight, 40, blockHeight - 1)
        }
    }
}