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
  public fillColor!: number
  public prevCollisions: Array<'up' | 'right' | 'down' | 'left'> = []
  static options = {
    radius: 15,
    renderRadius: 100,
    moveSpeed: 2,
    animationSpeed: 1,
    scaredFillColor: 0x0000ff
  }

  public velocity = {
    vx: Ghost.options.moveSpeed,
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
    this.fillColor = options.fillColor

    this.animationSpeed = Ghost.options.animationSpeed
    this.play()
  }

  getPaddingBounds (padding = 0): {
    top: number
    right: number
    bottom: number
    left: number
  } {
    const centerX = this.x
    const centerY = this.y
    const { radius } = Ghost.options
    const bounds = {
      top: centerY - radius,
      right: centerX + radius,
      bottom: centerY + radius,
      left: centerX - radius
    }
    return {
      left: bounds.left - padding,
      right: bounds.right + padding,
      top: bounds.top - padding,
      bottom: bounds.bottom + padding
    }
  }

  updatePosition (): void {
    this.position.x += this.velocity.vx
    this.position.y += this.velocity.vy
  }

  setIsScared (scared: boolean): void {
    this.isScared = scared
    this.tint = Ghost.options.scaredFillColor
    setTimeout(() => {
      this.isScared = false
      this.tint = this.fillColor
    }, 5000)
  }
}
