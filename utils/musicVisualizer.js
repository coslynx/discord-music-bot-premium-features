const { createCanvas, loadImage } = require('canvas');
const logger = require('../utils/logger');

class MusicVisualizer {
  constructor(musicService) {
    this.musicService = musicService;
    this.canvas = null;
    this.ctx = null;
    this.width = 1024;
    this.height = 576;
    this.barCount = 32;
    this.barWidth = this.width / this.barCount;
    this.barSpacing = 2;
    this.gradient = null;
    this.currentSong = null;
    this.isPlaying = false;
  }

  async initialize() {
    try {
      this.canvas = createCanvas(this.width, this.height);
      this.ctx = this.canvas.getContext('2d');

      this.gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
      this.gradient.addColorStop(0, '#00c6ff');
      this.gradient.addColorStop(1, '#0072ff');
    } catch (error) {
      logger.error('Error initializing music visualizer:', error);
    }
  }

  async update(guild) {
    try {
      if (!this.canvas || !this.ctx) {
        return;
      }

      const currentSong = this.musicService.getCurrentSong(guild);

      if (!currentSong) {
        return;
      }

      if (this.currentSong !== currentSong) {
        this.currentSong = currentSong;
        this.isPlaying = true;
      }

      if (!this.isPlaying) {
        return;
      }

      const frequencyData = this.musicService.getFrequencyData(guild);

      this.ctx.fillStyle = this.gradient;
      this.ctx.fillRect(0, 0, this.width, this.height);

      for (let i = 0; i < this.barCount; i += 1) {
        const barHeight = frequencyData[i] / 256  this.height;
        const barX = i  (this.barWidth + this.barSpacing);
        const barY = this.height - barHeight;

        this.ctx.fillRect(barX, barY, this.barWidth, barHeight);
      }
    } catch (error) {
      logger.error('Error updating music visualizer:', error);
    }
  }

  stop(guild) {
    try {
      this.isPlaying = false;
      this.currentSong = null;
      this.ctx.clearRect(0, 0, this.width, this.height);
    } catch (error) {
      logger.error('Error stopping music visualizer:', error);
    }
  }
}

module.exports = { MusicVisualizer };