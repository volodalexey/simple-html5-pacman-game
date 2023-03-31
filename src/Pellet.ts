import { Sprite, Graphics, type Application, type Texture } from 'pixi.js'

export interface IPelletOptions {
  app: Application
  centerX: number
  centerY: number
}

export class Pellet extends Sprite {
  static textureCache: Texture
  static options = {
    radius: 3,
    fillColor: 0xfbbf24
  }

  constructor (options: IPelletOptions) {
    super()
    this.setup(options)
    this.anchor.set(0.5, 0.5)
    this.position.set(options.centerX, options.centerY)
  }

  setup (options: IPelletOptions): void {
    const { radius, fillColor } = Pellet.options
    let texture = Pellet.textureCache
    if (texture == null) {
      const circle = new Graphics()
      circle.beginFill(0xffffff)
      circle.drawCircle(0, 0, radius)
      circle.endFill()
      circle.cacheAsBitmap = true
      texture = options.app.renderer.generateTexture(circle)
      Pellet.textureCache = texture
    }
    this.texture = texture
    this.scale.set(radius * 2 / texture.width, radius * 2 / texture.height)
    this.tint = fillColor
  }
}
