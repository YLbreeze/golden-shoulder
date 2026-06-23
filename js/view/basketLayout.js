// js/view/basketLayout.js

const BASKET_WIDTH = 120
const BASKET_HEIGHT = 54
const BASKET_MARGIN_X = 32
const BASKET_BOTTOM_MARGIN = 72
const COLUMNS = 3
const MAX_VISIBLE_GOODS = 18
const ITEM_SIZE = 34
const COLUMN_STEP = 40
const ROW_STEP = 27

function getBasketRect(side, width, height) {
  const bottomY = height - BASKET_BOTTOM_MARGIN
  const x = side === "left" ? BASKET_MARGIN_X : width - BASKET_MARGIN_X - BASKET_WIDTH

  return {
    x,
    y: bottomY - BASKET_HEIGHT,
    width: BASKET_WIDTH,
    height: BASKET_HEIGHT,
    bottomY,
  }
}

function getItemPose(index, basketRect, uid = index + 1) {
  const column = index % COLUMNS
  const row = Math.floor(index / COLUMNS)
  const stagger = row % 2 === 1 ? 5 : 0
  const centerX = basketRect.x + 20 + column * COLUMN_STEP + stagger
  const centerY = basketRect.y - 10 - row * ROW_STEP
  const rotationStep = ((uid * 7) % 5) - 2

  return {
    x: centerX,
    y: centerY,
    rotation: rotationStep * 0.035,
    size: ITEM_SIZE,
  }
}

function getVisibleGoods(goods) {
  const hiddenCount = Math.max(0, goods.length - MAX_VISIBLE_GOODS)
  return {
    goods: goods.slice(hiddenCount),
    hiddenCount,
  }
}

function getLandingPose(side, sideCount, width, height, uid) {
  const basketRect = getBasketRect(side, width, height)
  const visibleIndex = Math.max(sideCount - 1, 0) % MAX_VISIBLE_GOODS
  return getItemPose(visibleIndex, basketRect, uid)
}

module.exports = {
  ITEM_SIZE,
  MAX_VISIBLE_GOODS,
  getBasketRect,
  getItemPose,
  getVisibleGoods,
  getLandingPose,
}
