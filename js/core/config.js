// js/core/config.js
// MVP版本参数配置

const config = {
  //关卡参数（MVP单关）
  level: {
    targetValue: 1000,
    timeLimitSec: 26,

    //平衡机制参数：失衡判定 abs(lw-rw)>=threshold，进入失衡状态
    threshold: 5,
    rescueSec: 2, //失衡救回时间
  },

  //生成节奏与表现参数
  spawn: {
    intervalSec: 1, //每1s生成一个待放置货物
    previewCount: 1, //顶部显示的货物预览数量
    dropAnimSec: 0.35, //下落动画时长
  },

  //平衡提示
  balanceHint: {
    //完美平衡 abs(diff)<=perfectDiff
    perfectDiff: 1,
    //临界提示 abs(diff)>=criticalDiff
    criticalDiff: 4,
  },

  //货物池 weight质量，value价值，prob出现概率
  goodsPool: [{
      id: "rect",
      name: "长方形",
      weight: 3,
      value: 100,
      prob: 40
    },
    {
      id: "square",
      name: "正方形",
      weight: 2,
      value: 25,
      prob: 40
    },
    {
      id: "trapezo",
      name: "梯形",
      weight: 1,
      value: 50,
      prob: 20
    },
  ],

  //渲染布局相关
  ui: {

  },

  //音效配置。后续替换同名文件即可换正式音效。
  audio: {
    enabled: true,
    volume: 0.55,
    sources: {
      place: "audio/place.wav",
      perfect: "audio/perfect.wav",
      warning: "audio/warning.wav",
      unbalanced: "audio/unbalanced.wav",
      success: "audio/success.wav",
      fail: "audio/fail.wav",
    },
  },
};
module.exports = config;
