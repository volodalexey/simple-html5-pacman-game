import { Sprite, type Texture } from 'pixi.js'

interface IBoundaryOptions {
  code: string
  initX: number
  initY: number
  texture: Texture
}

export class Boundary extends Sprite {
  public code!: string
  constructor ({ code, initX, initY, texture }: IBoundaryOptions) {
    super(texture)
    this.code = code
    this.position.set(initX, initY)
  }

  getMyBounds (): {
    top: number
    right: number
    bottom: number
    left: number
  } {
    return {
      top: this.y,
      right: this.x + this.width,
      bottom: this.y + this.height,
      left: this.x
    }
  }
}
