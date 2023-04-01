import { AnimatedSprite, Graphics, type Application, type Texture, Rectangle } from 'pixi.js'
import { type Boundary } from './Boundary'
import { Collision } from './Collision'
import { logPlayerCheck, logPlayerDirection, logPlayerPosition, logPlayerVelocity } from './logger'

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

interface IVelocity {
  vx: number
  vy: number
}

export class Player extends AnimatedSprite {
  static texturesCache: Texture[] = []
  public initX!: number
  public initY!: number
  public pointerXDown: number | null = null
  public pointerYDown: number | null = null
  public lastPointerDirection: 'top' | 'right' | 'bottom' | 'left' = 'right'
  static options = {
    radius: 15,
    renderRadius: 100,
    moveSpeed: 5,
    fillColor: 0xbef264,
    animationSpeed: 1
  }

  public velocity: IVelocity = {
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
    this.initX = options.centerX
    this.initY = options.centerY
    this.position.set(options.centerX, options.centerY)
    this.tint = Player.options.fillColor

    this.animationSpeed = Player.options.animationSpeed
    this.play()
    this.switchState(PlayerState.right)
  }

  switchState (state: PlayerState): void {
    switch (state) {
      case PlayerState.top:
        this.rotation = -Math.PI / 2
        break
      case PlayerState.left:
        this.rotation = -Math.PI
        break
      case PlayerState.right:
        this.rotation = 0
        break
      case PlayerState.bottom:
        this.rotation = Math.PI / 2
        break
    }
    this.state = state
  }

  isPointerDown (): boolean {
    return this.pointerXDown !== null || this.pointerYDown !== null
  }

  applyTopDirection (pressed: boolean): void {
    this.pointerYDown = pressed ? -1 : null
    if (pressed) {
      this.lastPointerDirection = 'top'
    }
    logPlayerDirection(`Apply direction "${this.lastPointerDirection}" px=${this.pointerXDown} py=${this.pointerYDown}`)
  }

  applyBottomDirection (pressed: boolean): void {
    this.pointerYDown = pressed ? 1 : null
    if (pressed) {
      this.lastPointerDirection = 'bottom'
    }
    logPlayerDirection(`Apply direction "${this.lastPointerDirection}" px=${this.pointerXDown} py=${this.pointerYDown}`)
  }

  applyLeftDirection (pressed: boolean): void {
    this.pointerXDown = pressed ? -1 : null
    if (pressed) {
      this.lastPointerDirection = 'left'
    }
    logPlayerDirection(`Apply direction "${this.lastPointerDirection}" px=${this.pointerXDown} py=${this.pointerYDown}`)
  }

  applyRightDirection (pressed: boolean): void {
    this.pointerXDown = pressed ? 1 : null
    if (pressed) {
      this.lastPointerDirection = 'right'
    }
    logPlayerDirection(`Apply direction "${this.lastPointerDirection}" px=${this.pointerXDown} py=${this.pointerYDown}`)
  }

  applyPointerToDirection (pressed: boolean | undefined, x: number, y: number): void {
    if (pressed === true || (pressed === undefined && this.isPointerDown())) {
      const myBounds = this.getDiffBounds()
      const pX = this.x
      const pY = this.y
      const absDiffX = Math.abs(x - pX)
      const absDiffY = Math.abs(y - pY)
      // logPlayerDirection(`Abs x=${x} y=${y} px=${pX} py=${pY} absDiffX=${absDiffX} absDiffY=${absDiffY}`)
      if (x >= myBounds.left && x <= myBounds.right) {
        // pure vertical line, no horizontal
        this.pointerXDown = null
        if (y > pY) {
          this.pointerYDown = 1
          this.lastPointerDirection = 'bottom'
        } else {
          this.pointerYDown = -1
          this.lastPointerDirection = 'top'
        }
      } else if (y >= myBounds.top && y <= myBounds.bottom) {
        // pure horizontal line, no vertical
        this.pointerYDown = null
        if (x > pX) {
          this.pointerXDown = 1
          this.lastPointerDirection = 'right'
        } else {
          this.pointerXDown = -1
          this.lastPointerDirection = 'left'
        }
      } else {
        if (absDiffX >= absDiffY) {
          // more pressure by X than by Y
          if (x > myBounds.right) {
            this.pointerXDown = 1
            this.lastPointerDirection = 'right'
          } else if (x < myBounds.left) {
            this.pointerXDown = -1
            this.lastPointerDirection = 'left'
          }
        } else {
          // more pressure by Y than by X
          if (y > myBounds.bottom) {
            this.pointerYDown = 1
            this.lastPointerDirection = 'bottom'
          } else if (y < myBounds.top) {
            this.pointerYDown = -1
            this.lastPointerDirection = 'top'
          }
        }
      }
      if (this.isPointerDown()) {
        logPlayerDirection(`Move px=${this.pointerXDown} py=${this.pointerYDown} at x=${x} y=${y}`)
      } else {
        logPlayerDirection(`Down px=${this.pointerXDown} py=${this.pointerYDown} at x=${x} y=${y}`)
      }
    } else if (pressed === false) {
      this.pointerXDown = null
      this.pointerYDown = null
      logPlayerDirection('Released')
    }
  }

  updateVelocity (): void {
    const { options: { moveSpeed } } = Player
    const { pointerXDown, pointerYDown, velocity } = this
    if (typeof pointerYDown === 'number') {
      logPlayerVelocity(`before vy=${velocity.vy}`)
      if (pointerYDown < 0) {
        velocity.vy = -moveSpeed
      } else if (pointerYDown > 0) {
        velocity.vy = moveSpeed
      }
      logPlayerVelocity(`after vy=${velocity.vy}`)
    }
    if (typeof pointerXDown === 'number') {
      logPlayerVelocity(`before vx=${velocity.vx}`)
      if (pointerXDown < 0) {
        velocity.vx = -moveSpeed
      } else if (pointerXDown > 0) {
        velocity.vx = moveSpeed
      }
      logPlayerVelocity(`after vx=${velocity.vx}`)
    }
  }

  updateState (): void {
    if (this.velocity.vx > 0) {
      this.switchState(PlayerState.right)
    } else if (this.velocity.vx < 0) {
      this.switchState(PlayerState.left)
    } else if (this.velocity.vy > 0) {
      this.switchState(PlayerState.bottom)
    } else if (this.velocity.vy < 0) {
      this.switchState(PlayerState.top)
    }
  }

  setKilled (): void {
    this.pointerXDown = null
    this.pointerYDown = null
    this.velocity.vx = 0
    this.velocity.vy = 0
  }

  getDiffBounds (): {
    top: number
    right: number
    bottom: number
    left: number
  } {
    const centerX = this.x
    const centerY = this.y
    const { radius } = Player.options
    return {
      top: centerY - radius,
      right: centerX + radius,
      bottom: centerY + radius,
      left: centerX - radius
    }
  }

  checkIfMove ({ vx = null, vy = null, boundaries, padding = 0 }: { vx?: number | null, vy?: number | null, boundaries: Boundary[], padding?: number }): boolean {
    const playerBounds = this.getDiffBounds()
    const playerBoundsWithPadding = {
      left: playerBounds.left - padding,
      right: playerBounds.right + padding,
      top: playerBounds.top - padding,
      bottom: playerBounds.bottom + padding
    }
    const collideIndex = boundaries.findIndex(boundary => {
      const boundaryBounds = boundary.getMyBounds()
      const isCollide = Collision.checkCollisionMBxB(
        {
          bounds: playerBoundsWithPadding,
          velocity: {
            vx: vx ?? 0,
            vy: vy ?? 0
          }
        },
        boundaryBounds
      )
      return isCollide
    })
    if (collideIndex > -1) {
      const collideWithBoundary = boundaries[collideIndex]
      logPlayerCheck(`Collide vx=${vx} vy=${vy}`)
      const boundaryBounds = collideWithBoundary.getMyBounds()
      logPlayerCheck(`Player my bounds t=${playerBounds.top}(${playerBoundsWithPadding.top}) r=${playerBounds.right}(${playerBoundsWithPadding.right}) b=${playerBounds.bottom}(${playerBoundsWithPadding.bottom}) l=${playerBounds.left}(${playerBoundsWithPadding.left}) pad=${padding}`)
      logPlayerCheck(`Boundary my bounds t=${boundaryBounds.top} r=${boundaryBounds.right} b=${boundaryBounds.bottom} l=${boundaryBounds.left} pad=${padding} "${collideWithBoundary.code}" i=${collideIndex}`)
      if (logPlayerCheck.enabled) {
        const bounds = playerBoundsWithPadding
        const velocity = { vx: vx ?? 0, vy: vy ?? 0 }
        const b = collideWithBoundary.getMyBounds()
        logPlayerCheck(`${bounds.top + velocity.vy} <= ${b.bottom} [${bounds.top + velocity.vy <= b.bottom}]
        ${bounds.right + velocity.vx} >= ${b.left} [${bounds.right + velocity.vx >= b.left}]
        ${bounds.bottom + velocity.vy} >= ${b.top} [${bounds.bottom + velocity.vy >= b.top}]
        ${bounds.left + velocity.vx} <= ${b.right} [${bounds.left + velocity.vx <= b.right}]`)
      }
      if (vx != null) {
        this.velocity.vx = 0
      }
      if (vy != null) {
        this.velocity.vy = 0
      }
      return true
    } else {
      logPlayerCheck(`No collision detected vx=${vx} vy=${vy}`)
      if (vx != null) {
        this.velocity.vx = vx
      }
      if (vy != null) {
        this.velocity.vy = vy
      }
    }
    return false
  }

  checkIfMoveUp (boundaries: Boundary[], padding = 0): void {
    this.checkIfMove({ vy: -Player.options.moveSpeed, boundaries, padding })
  }

  checkIfMoveLeft (boundaries: Boundary[], padding = 0): void {
    this.checkIfMove({ vx: -Player.options.moveSpeed, boundaries, padding })
  }

  checkIfMoveDown (boundaries: Boundary[], padding = 0): void {
    this.checkIfMove({ vy: Player.options.moveSpeed, boundaries, padding })
  }

  checkIfMoveRight (boundaries: Boundary[], padding = 0): void {
    this.checkIfMove({ vx: Player.options.moveSpeed, boundaries, padding })
  }

  updatePosition (): void {
    if (this.velocity.vx !== 0 || this.velocity.vy !== 0) {
      logPlayerPosition(`Before posX=${this.position.x} vx=${this.velocity.vx} posY=${this.position.y} vy=${this.velocity.vy}`)
    }
    this.position.x += this.velocity.vx
    this.position.y += this.velocity.vy
    if (this.velocity.vx !== 0 || this.velocity.vy !== 0) {
      logPlayerPosition(`After posX=${this.position.x} vx=${this.velocity.vx} posY=${this.position.y} vy=${this.velocity.vy}`)
    }
  }

  restart (): void {
    this.position.set(this.initX, this.initY)
    this.velocity.vx = this.velocity.vy = 0
    this.pointerXDown = null
    this.pointerYDown = null
  }
}
