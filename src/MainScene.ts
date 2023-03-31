import { Container, type FederatedPointerEvent, Graphics, type Application, type Texture } from 'pixi.js'
import { type ScoreBar } from './ScoreBar'
import { Player } from './Player'
import { logKeydown, logKeyup, logLayout, logPlayerBounds, logPointerEvent } from './logger'
import { type IScene } from './SceneManager'
import { StartModal } from './StartModal'
import { type IMapOptions, Map } from './Map'

interface IShootingSceneOptions {
  app: Application
  viewWidth: number
  viewHeight: number
  textures: IMapOptions['textures']
}

export class MainScene extends Container implements IScene {
  public gameEnded = false
  public app!: Application
  public background!: Graphics

  public backgroundSettings = {
    color: 0x000000
  }

  public map!: Map
  public player!: Player
  public scoreBar!: ScoreBar
  public startModal!: StartModal
  public invaderTexture!: Texture

  constructor (options: IShootingSceneOptions) {
    super()
    this.app = options.app
    this.setup(options)
    this.draw(options)
    this.addEventLesteners()
  }

  setup ({ viewWidth, viewHeight, textures }: IShootingSceneOptions): void {
    this.background = new Graphics()
    this.addChild(this.background)

    this.map = new Map({
      app: this.app,
      textures
    })
    this.addChild(this.map)

    this.player = new Player({})
    this.addChild(this.player)

    this.startModal = new StartModal({ viewWidth, viewHeight })
    this.startModal.visible = false
    this.addChild(this.startModal)
  }

  draw ({ viewWidth, viewHeight }: IShootingSceneOptions): void {
    this.background.beginFill(this.backgroundSettings.color)
    this.background.drawRect(0, 0, viewWidth, viewHeight)
    this.background.endFill()
  }

  handleResize (options: { viewWidth: number, viewHeight: number }): void {
    this.resizeBackground(options)
    this.centerModal(options)
  }

  centerModal ({ viewWidth, viewHeight }: { viewWidth: number, viewHeight: number }): void {
    this.startModal.position.set(viewWidth / 2 - this.startModal.boxOptions.width / 2, viewHeight / 2 - this.startModal.boxOptions.height / 2)
  }

  resizeBackground ({ viewWidth, viewHeight }: { viewWidth: number, viewHeight: number }): void {
    logLayout(`bgw=${this.background.width} bgh=${this.background.height} vw=${viewWidth} vh=${viewHeight}`)
    this.background.width = viewWidth
    this.background.height = viewHeight
  }

  handleUpdate (): void {
    if (this.gameEnded) {
      return
    }
    this.player.updateVelocity()
    const { velocity, position } = this.player
    const playerBounds = this.player.getBounds()
    logPlayerBounds(`pl=${playerBounds.left} pr=${playerBounds.right} pw=${playerBounds.width} ph=${playerBounds.height}`)
    if (playerBounds.left + velocity.vx < this.background.x) {
      velocity.vx = 0
      position.x = this.background.x + playerBounds.width / 2
    } else if (playerBounds.right + velocity.vx > this.background.width) {
      velocity.vx = 0
      position.x = this.background.width - playerBounds.width / 2
    } else {
      position.x += velocity.vx
    }
    this.player.updateState()
  }

  addEventLesteners (): void {
    this.interactive = true
    this.on('pointerdown', this.handlePlayerStartMove)
    this.on('pointermove', this.handlePlayerKeepMove)
    this.on('pointerup', this.handlePlayerStopMove)
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
    this.startModal.on('click', this.startGame)
  }

  handlePlayerMove (pressed: boolean | undefined, e: FederatedPointerEvent): void {
    const point = this.toLocal(e.global)
    logPointerEvent(`${e.type} px=${point.x} py=${point.y}`)
    this.player.handleMove(pressed, point.x, point.y)
  }

  handlePlayerStartMove = (e: FederatedPointerEvent): void => {
    this.handlePlayerMove(true, e)
  }

  handlePlayerKeepMove = (e: FederatedPointerEvent): void => {
    this.handlePlayerMove(undefined, e)
  }

  handlePlayerStopMove = (e: FederatedPointerEvent): void => {
    this.handlePlayerMove(false, e)
  }

  handleKeyDown = (e: KeyboardEvent): void => {
    logKeydown(`${e.code} ${e.key}`)
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': case 'Space': case 'ShiftLeft':
        this.player.applyTopDirection(true)
        break
      case 'KeyA': case 'ArrowLeft':
        this.player.applyLeftDirection(true)
        break
      case 'KeyD':case 'ArrowRight':
        this.player.applyRightDirection(true)
        break
    }
  }

  handleKeyUp = (e: KeyboardEvent): void => {
    logKeyup(`${e.code} ${e.key}`)
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': case 'Space': case 'ShiftLeft':
        this.player.applyTopDirection(false)
        break
      case 'KeyA': case 'ArrowLeft':
        this.player.applyLeftDirection(false)
        break
      case 'KeyD':case 'ArrowRight':
        this.player.applyRightDirection(false)
        break
    }
  }

  startGame = (): void => {
    this.startModal.visible = false
    this.scoreBar.clearScore()
    this.gameEnded = false
  }

  endGame (): void {
    this.gameEnded = true
    this.startModal.scoreText.text = this.scoreBar.score
    this.startModal.visible = true
  }

  beginEndGame (): void {
    this.player.setKilled()
    this.endGame()
  }
}
