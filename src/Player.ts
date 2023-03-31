import { Sprite } from 'pixi.js'
import { logPlayerMove } from './logger'

export interface IPlayerOptions {
  todo?: number
}

export enum PlayerState {
  top = 'top',
  right = 'right',
  bottom = 'bottom',
  left = 'left',
}

export class Player extends Sprite {
  public pointerXDown: number | null = null
  public pointerYDown: number | null = null
  static options = {
    moveSpeed: 6,
    bulletSpeed: -10
  }

  public velocity = {
    vx: 0,
    vy: 0
  }

  public state!: PlayerState
  constructor (options: IPlayerOptions) {
    super()
    this.anchor.set(0.5, 0.5)

    this.switchState(PlayerState.left)
  }

  switchState (state: PlayerState): void {
    switch (state) {
      case PlayerState.top:
        this.rotation = Math.PI / 2
        break
      case PlayerState.left:
        this.rotation = Math.PI
        break
      case PlayerState.right:
        this.rotation = 0
        break
      case PlayerState.bottom:
        this.rotation = -Math.PI / 2
        break
    }
    this.state = state
  }

  isPointerDown (): boolean {
    return this.pointerXDown !== null && this.pointerYDown !== null
  }

  applyTopDirection (pressed: boolean): void {
    this.pointerYDown = pressed ? -1 : null
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
