import { Sprite, Graphics, type Application, type Texture } from 'pixi.js'

export interface IPowerUpOptions {
  app: Application
  centerX: number
  centerY: number
}

export class PowerUp extends Sprite {
  static textureCache: Texture
  static options = {
    radius: 8,
    fillColor: 0xfb7185
  }

  constructor (options: IPowerUpOptions) {
    super()
    this.setup(options)
    this.anchor.set(0.5, 0.5)
    this.position.set(options.centerX, options.centerY)
  }

  setup (options: IPowerUpOptions): void {
    const { radius, fillColor } = PowerUp.options
    let texture = PowerUp.textureCache
    if (texture == null) {
      const circle = new Graphics()
      circle.beginFill(0xffffff)
      circle.drawCircle(0, 0, radius)
      circle.endFill()
      circle.cacheAsBitmap = true
      texture = options.app.renderer.generateTexture(circle)
      PowerUp.textureCache = texture
    }
    this.texture = texture
    this.scale.set(radius * 2 / texture.width, radius * 2 / texture.height)
    this.tint = fillColor
  }
}
