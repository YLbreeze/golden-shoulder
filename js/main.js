// js/main.js

const GameController = require("./core/gameController");
const Hud = require("./view/hud");
const BasketView = require("./view/basketView");
const FeedbackView = require("./view/feedbackView");
const ResultView = require("./view/resultView");
const SoundManager = require("./core/soundManager");

export default class Main {
    constructor() {
        console.log("[BOOT] Main() constructor");
        // 创建画布（小游戏环境）
        this.canvas = wx.createCanvas()
        console.log('[BOOT] canvas created:', !!this.canvas)
        this.ctx = this.canvas.getContext('2d')
        this.setupCanvas()

        this.controller = new GameController();
        this.hud = new Hud();
        this.basketView = new BasketView();
        this.feedbackView = new FeedbackView();
        this.resultView = new ResultView();
        this.soundManager = new SoundManager();
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
        this.dispatchFeedbackEvents(dt);

        this.render()

        requestAnimationFrame(this.gameLoop);
    }

    onTouchStart(e) {
        if (this.controller.state === "success" || this.controller.state === "fail") {
            this.controller.start();
            this.feedbackView.reset();
            return;
        }

        const x = e.touches[0].clientX;
        this.controller.handleTap(x < this.screenWidth / 2 ? "left" : "right");
        this.dispatchFeedbackEvents(0);
    }

    dispatchFeedbackEvents(dt) {
        const feedbackEvents = this.controller.consumeFeedbackEvents();

        this.feedbackView.update(
            dt,
            feedbackEvents,
            this.screenWidth,
            this.screenHeight,
            this.hudHeight
        );
        if (feedbackEvents.length > 0) {
            this.soundManager.update(feedbackEvents);
        }
    }

    setupCanvas() {
        const info = wx.getSystemInfoSync();
        this.dpr = info.pixelRatio || 1;
        this.screenWidth = info.windowWidth || info.screenWidth;
        this.screenHeight = info.windowHeight || info.screenHeight;
        this.safeTop = info.safeArea ? info.safeArea.top : 0;
        this.hudHeight = 126;
        this.menuButton = this.getMenuButtonRect();

        this.canvas.width = this.screenWidth * this.dpr;
        this.canvas.height = this.screenHeight * this.dpr;

        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.ctx.imageSmoothingEnabled = false;
    }

    render() {
        const ctx = this.ctx
        const c = this.controller
        const w = this.screenWidth
        const h = this.screenHeight

        ctx.clearRect(0, 0, w, h)

        const shake = this.feedbackView.getShakeOffset()
        ctx.save()
        ctx.translate(shake.x, shake.y)
        this.basketView.render(ctx, c, w, h, this.hudHeight)
        ctx.restore()

        this.feedbackView.render(ctx, w, h)
        this.hud.render(ctx, c, w)
        this.resultView.render(ctx, c, w, h)
    }

    getMenuButtonRect() {
        if (!wx.getMenuButtonBoundingClientRect) return null;

        try {
            return wx.getMenuButtonBoundingClientRect();
        } catch (err) {
            console.warn("[Main] getMenuButtonBoundingClientRect failed:", err);
            return null;
        }
    }
}
