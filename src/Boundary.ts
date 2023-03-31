import { Sprite, type Texture } from 'pixi.js'

interface IBoundaryOptions {
  initX: number
  initY: number
  texture: Texture
}

export class Boundary extends Sprite {
  static cell = 40
  constructor ({ initX, initY, texture }: IBoundaryOptions) {
    super(texture)
    this.position.set(initX, initY)
  }
}
