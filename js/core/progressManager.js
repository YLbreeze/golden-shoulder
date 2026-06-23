// js/core/progressManager.js

const STORAGE_KEY = "goldenShoulder.progress.v1"

class ProgressManager {
  constructor() {
    this.memoryProgress = {
      currentLevelIndex: 0,
      highestCompletedIndex: -1,
      campaignCompleted: false,
    }
  }

  load(totalLevels) {
    let progress = null

    try {
      if (typeof wx !== "undefined" && wx.getStorageSync) {
        progress = wx.getStorageSync(STORAGE_KEY)
      }
    } catch (err) {
      console.warn("[ProgressManager] load failed:", err)
    }

    if (!progress || typeof progress !== "object") {
      progress = this.memoryProgress
    }

    const maxIndex = Math.max(0, totalLevels - 1)
    return {
      currentLevelIndex: this.clampIndex(progress.currentLevelIndex, maxIndex),
      highestCompletedIndex: this.clampCompletedIndex(
        progress.highestCompletedIndex,
        maxIndex
      ),
      campaignCompleted: !!progress.campaignCompleted,
    }
  }

  completeLevel(currentLevelIndex, totalLevels) {
    const progress = this.load(totalLevels)
    const isLastLevel = currentLevelIndex >= totalLevels - 1
    const nextProgress = {
      currentLevelIndex: isLastLevel ? currentLevelIndex : currentLevelIndex + 1,
      highestCompletedIndex: Math.max(progress.highestCompletedIndex, currentLevelIndex),
      campaignCompleted: progress.campaignCompleted || isLastLevel,
    }

    this.save(nextProgress)
    return nextProgress
  }

  saveCurrentLevel(currentLevelIndex, totalLevels) {
    const progress = this.load(totalLevels)
    progress.currentLevelIndex = this.clampIndex(currentLevelIndex, totalLevels - 1)
    this.save(progress)
  }

  reset() {
    const progress = {
      currentLevelIndex: 0,
      highestCompletedIndex: -1,
      campaignCompleted: false,
    }
    this.save(progress)
    return progress
  }

  save(progress) {
    this.memoryProgress = { ...progress }

    try {
      if (typeof wx !== "undefined" && wx.setStorageSync) {
        wx.setStorageSync(STORAGE_KEY, progress)
      }
    } catch (err) {
      console.warn("[ProgressManager] save failed:", err)
    }
  }

  clampIndex(value, maxIndex) {
    const index = Number.isInteger(value) ? value : 0
    return Math.max(0, Math.min(index, maxIndex))
  }

  clampCompletedIndex(value, maxIndex) {
    const index = Number.isInteger(value) ? value : -1
    return Math.max(-1, Math.min(index, maxIndex))
  }
}

module.exports = ProgressManager
