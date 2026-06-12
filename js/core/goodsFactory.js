// js/core/goodsFactory.js

const config = require("./config")

let nextGoodUid = 1

function pickFromPool(pool) {
  const totalProb = pool.reduce((sum, good) => sum + good.prob, 0)
  const rand = Math.random() * totalProb

  let acc = 0
  for (const good of pool) {
    acc += good.prob
    if (rand <= acc) return good
  }

  return pool[0]
}

function createGood(pool = config.goodsPool) {
  const template = pickFromPool(pool)

  return {
    id: template.id,
    uid: nextGoodUid++,
    name: template.name,
    weight: template.weight,
    value: template.value,
  }
}

function resetGoodUid() {
  nextGoodUid = 1
}

module.exports = {
  createGood,
  resetGoodUid,
}
