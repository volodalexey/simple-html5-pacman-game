import { AnimatedSprite, Graphics, type Application, type Texture, Rectangle } from 'pixi.js'

export interface IGhostOptions {
  app: Application
  centerX: number
  centerY: number
  fillColor: number
}

export class Ghost extends AnimatedSprite {
  static texturesCache: Texture[] = []
  public isScared = false
  static options = {
    radius: 15,
    renderRadius: 100,
    moveSpeed: 2,
    animationSpeed: 1
  }

  public velocity = {
    vx: 0,
    vy: 0
  }

  static prepareTextures ({ app }: IGhostOptions): void {
    const { texturesCache, options: { renderRadius } } = Ghost
    const radius = renderRadius
    const splitCount = 10
    const angleIncr = 1 / splitCount
    const textures = []
    for (let i = 1; i < splitCount + 1; i++) {
      const pacman = new Graphics()
      pacman.beginFill(0xffffff) // or context.fill()
      const cx = radius
      const cy = radius
      pacman.moveTo(cx, cy)
      pacman.arc(cx, cy, radius, Math.PI / 2 - angleIncr * i, Math.PI / 2 + angleIncr * i)
      pacman.lineTo(cx, cy)
      pacman.moveTo(cx, cy)
      pacman.arc(cx, cy, radius, -Math.PI / 2 - angleIncr * i, -Math.PI / 2 + angleIncr * i)
      pacman.lineTo(cx, cy)
      pacman.endFill()
      textures.push(app.renderer.generateTexture(pacman, { region: new Rectangle(0, 0, radius * 2, radius * 2) }))
    }
    texturesCache.push(...textures)
    texturesCache.push(...textures.reverse())
  }

  constructor (options: IGhostOptions) {
    if (Ghost.texturesCache.length <= 0) {
      Ghost.prepareTextures(options)
    }
    super(Ghost.texturesCache)
    this.anchor.set(0.5, 0.5)
    this.scale.set(Ghost.options.radius / Ghost.options.renderRadius)
    this.position.set(options.centerX, options.centerY)
    this.tint = options.fillColor

    this.animationSpeed = Ghost.options.animationSpeed
    this.play()
  }

  getMyBounds (): {
    top: number
    right: number
    bottom: number
    left: number
  } {
    const centerX = this.x
    const centerY = this.y
    const { radius } = Ghost.options
    return {
      top: centerY - radius,
      right: centerX + radius,
      bottom: centerY + radius,
      left: centerX - radius
    }
  }

  updatePosition (): void {
    this.position.x += this.velocity.vx
    this.position.y += this.velocity.vy
  }
}
