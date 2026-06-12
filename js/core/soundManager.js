// js/core/soundManager.js

const config = require("./config")

class SoundManager {
  constructor() {
    this.enabled = !!config.audio.enabled
    this.audios = {}
    this.lastPlayAt = {}
    this.cooldowns = {
      warning: 0.28,
      unbalanced: 0.5,
    }

    this.init()
  }

  init() {
    if (!this.enabled || typeof wx === "undefined" || !wx.createInnerAudioContext) {
      this.enabled = false
      return
    }

    const sources = config.audio.sources
    for (const key in sources) {
      const audio = wx.createInnerAudioContext()
      audio.src = sources[key]
      audio.volume = config.audio.volume
      audio.obeyMuteSwitch = false
      if (audio.onError) {
        audio.onError((err) => {
          console.warn("[SoundManager] audio error:", key, sources[key], err)
        })
      }
      this.audios[key] = audio
    }
  }

  update(events) {
    if (!this.enabled) return

    for (const event of events) {
      if (event.type === "place") {
        this.play("place")
      } else if (event.type === "perfect") {
        this.play("perfect")
      } else if (event.type === "critical") {
        this.play("warning")
      } else if (event.type === "unbalanced") {
        this.play("unbalanced")
      } else if (event.type === "success") {
        this.play("success")
      } else if (event.type === "fail") {
        this.play("fail")
      }
    }
  }

  play(key) {
    const audio = this.audios[key]
    if (!audio) return

    const now = Date.now() / 1000
    const cooldown = this.cooldowns[key] || 0
    if (cooldown > 0 && now - (this.lastPlayAt[key] || 0) < cooldown) return
    this.lastPlayAt[key] = now

    try {
      audio.stop()
      if (audio.seek) audio.seek(0)
      audio.play()
    } catch (err) {
      console.warn("[SoundManager] play failed:", key, err)
    }
  }
}

module.exports = SoundManager
