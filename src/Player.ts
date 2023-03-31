import { AnimatedSprite, Graphics, type Application, type Texture, Rectangle } from 'pixi.js'
import { logPlayerMove } from './logger'

export interface IPlayerOptions {
  app: Application
  centerX: number
  centerY: number
}

export enum PlayerState {
  top = 'top',
  right = 'right',
  bottom = 'bottom',
  left = 'left',
}

export class Player extends AnimatedSprite {
  static texturesCache: Texture[] = []
  public pointerXDown: number | null = null
  public pointerYDown: number | null = null
  static options = {
    radius: 15,
    renderRadius: 100,
    moveSpeed: 6,
    fillColor: 0xbef264,
    animationSpeed: 1
  }

  public velocity = {
    vx: 0,
    vy: 0
  }

  static prepareTextures ({ app }: IPlayerOptions): void {
    const { texturesCache, options: { renderRadius } } = Player
    const radius = renderRadius
    // whole circle first
    texturesCache.push(app.renderer.generateTexture(
      new Graphics().beginFill(0xffffff).drawCircle(radius / 2, radius / 2, radius)
    ))
    const splitCount = 10
    const angleIncr = 1 / splitCount
    const textures = []
    for (let i = 1; i < splitCount + 1; i++) {
      const pacman = new Graphics()
      pacman.beginFill(0xffffff) // or context.fill()
      const cx = radius
      const cy = radius
      pacman.moveTo(cx, cy)
      pacman.arc(cx, cy, radius, angleIncr * i, -angleIncr * i)
      pacman.lineTo(cx, cy)
      pacman.endFill()
      textures.push(app.renderer.generateTexture(pacman, { region: new Rectangle(0, 0, radius * 2, radius * 2) }))
    }
    texturesCache.push(...textures)
    texturesCache.push(...textures.reverse())
  }

  public state!: PlayerState
  constructor (options: IPlayerOptions) {
    Player.prepareTextures(options)
    super(Player.texturesCache)
    this.anchor.set(0.5, 0.5)
    this.scale.set(Player.options.radius / Player.options.renderRadius)
    this.position.set(options.centerX, options.centerY)
    this.tint = Player.options.fillColor

    this.animationSpeed = Player.options.animationSpeed
    this.play()
    this.switchState(PlayerState.right)
  }

  switchState (state: PlayerState): void {
    switch (state) {
      case PlayerState.top:
        // this.rotation = Math.PI / 2
        break
      case PlayerState.left:
        // this.rotation = Math.PI
        break
      case PlayerState.right:
        this.rotation = 0
        break
      case PlayerState.bottom:
        // this.rotation = -Math.PI / 2
        break
    }
    this.state = state
  }

  isPointerDown (): boolean {
    return this.pointerXDown !== null && this.pointerYDown !== null
  }

  applyTopDirection (pressed: boolean): void {
    this.pointerYDown = pressed
      ? -1
      : (this.pointerYDown === -1 ? null : this.pointerYDown)
  }

  applyBottomDirection (pressed: boolean): void {
    this.pointerYDown = pressed
      ? 1
      : (this.pointerYDown === 1 ? null : this.pointerYDown)
  }

  applyLeftDirection (pressed: boolean): void {
    this.pointerXDown = pressed
      ? -1
      : (this.pointerXDown === -1 ? null : this.pointerXDown)
  }

  applyRightDirection (pressed: boolean): void {
    this.pointerXDown = pressed
      ? 1
      : (this.pointerXDown === 1 ? null : this.pointerXDown)
  }

  handleMove (pressed: boolean | undefined, x: number, y: number): void {
    if (pressed === true) {
      this.pointerXDown = x - this.x
      this.pointerYDown = y - this.y
    } else if (pressed === false) {
      this.pointerXDown = null
      this.pointerYDown = null
    } else {
      if (this.isPointerDown()) {
        logPlayerMove(`x=${x} (cx=${this.x}) y=${x}`)
        this.pointerXDown = x - this.x
        this.pointerYDown = y - this.y
      }
    }
  }

  updateVelocity (): void {
    const { options: { moveSpeed } } = Player
    const { pointerXDown, pointerYDown, velocity } = this
    if (typeof pointerYDown === 'number' && pointerYDown < 0) {
      velocity.vy = 1
    } else {
      velocity.vy = 0
    }
    if (typeof pointerXDown === 'number') {
      if (pointerXDown < 0) {
        velocity.vx = -moveSpeed
      } else if (pointerXDown > 0) {
        velocity.vx = moveSpeed
      }
    } else {
      velocity.vx = 0
    }
  }

  updateState (): void {
    if (this.velocity.vx > 0) {
      this.switchState(PlayerState.right)
    } else if (this.velocity.vx < 0) {
      this.switchState(PlayerState.left)
    } else if (this.velocity.vy > 0) {
      this.switchState(PlayerState.bottom)
    } else {
      this.switchState(PlayerState.top)
    }
  }

  setKilled (): void {
    this.pointerXDown = null
    this.pointerYDown = null
    this.velocity.vx = 0
    this.velocity.vy = 0
  }
}
