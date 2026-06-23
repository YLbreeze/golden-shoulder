// js/core/config.js
// 全局游戏配置

const levels = require("./levels")

const config = {
  levels,

  //生成节奏与表现参数
  spawn: {
    intervalSec: 1, //每1s生成一个待放置货物
    previewCount: 1, //顶部显示的货物预览数量
    dropAnimSec: 0.35, //下落动画时长
  },

  //渲染布局相关
  ui: {

  },

  //音效配置。后续替换同名文件即可换正式音效。
  audio: {
    enabled: false,
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
