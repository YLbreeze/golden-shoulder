// js/core/levels.js

const goodsCatalog = {
  rect: { id: "rect", name: "长方形", weight: 3, value: 60 },
  square: { id: "square", name: "正方形", weight: 2, value: 35 },
  trapezo: { id: "trapezo", name: "梯形", weight: 1, value: 20 },
  gold: { id: "gold", name: "金块", weight: 4, value: 120 },
  stone: { id: "stone", name: "石头", weight: 4, value: 15 },
}

function createPool(entries) {
  return entries.map(([id, prob]) => ({
    ...goodsCatalog[id],
    prob,
  }))
}

const levels = [
  {
    id: 1,
    name: "左右开工",
    tip: "点击左右，分配货物",
    targetValue: 210,
    timeLimitSec: 22,
    threshold: 7,
    rescueSec: 4,
    perfectDiff: 1,
    criticalDiff: 6,
    goodsPool: createPool([
      ["square", 50],
      ["trapezo", 50],
    ]),
  },
  {
    id: 2,
    name: "稳住肩膀",
    tip: "保持两边重量接近",
    targetValue: 420,
    timeLimitSec: 27,
    threshold: 6,
    rescueSec: 3.5,
    perfectDiff: 1,
    criticalDiff: 5,
    goodsPool: createPool([
      ["rect", 35],
      ["square", 40],
      ["trapezo", 25],
    ]),
  },
  {
    id: 3,
    name: "失衡救场",
    tip: "失衡后及时救回",
    targetValue: 760,
    timeLimitSec: 26,
    threshold: 4,
    rescueSec: 2.5,
    perfectDiff: 1,
    criticalDiff: 3,
    goodsPool: createPool([
      ["rect", 30],
      ["square", 25],
      ["trapezo", 15],
      ["stone", 30],
    ]),
  },
  {
    id: 4,
    name: "金石取舍",
    tip: "金块值钱，石头压肩",
    targetValue: 1250,
    timeLimitSec: 29,
    threshold: 4,
    rescueSec: 2,
    perfectDiff: 1,
    criticalDiff: 3,
    goodsPool: createPool([
      ["rect", 25],
      ["square", 25],
      ["trapezo", 20],
      ["gold", 20],
      ["stone", 10],
    ]),
  },
  {
    id: 5,
    name: "黄金扛工",
    tip: "平衡与价值都要兼顾",
    targetValue: 1850,
    timeLimitSec: 34,
    threshold: 3,
    rescueSec: 1.6,
    perfectDiff: 1,
    criticalDiff: 2,
    goodsPool: createPool([
      ["rect", 25],
      ["square", 25],
      ["trapezo", 15],
      ["gold", 10],
      ["stone", 25],
    ]),
  },
]

module.exports = levels
