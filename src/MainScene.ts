import { Container, type FederatedPointerEvent, Graphics, type Application, type Texture } from 'pixi.js'
import { ScoreBar } from './ScoreBar'
import { Player } from './Player'
import { logKeydown, logKeyup, logLayout, logPlayerBounds, logPointerEvent } from './logger'
import { type IScene } from './SceneManager'
import { StartModal } from './StartModal'
import { type IMapOptions, Map } from './Map'

interface IShootingSceneOptions {
  app: Application
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
    this.addEventLesteners()
  }

  setup ({ textures }: IShootingSceneOptions): void {
    this.background = new Graphics()
    this.addChild(this.background)

    this.scoreBar = new ScoreBar()
    this.addChild(this.scoreBar)

    this.map = new Map({
      app: this.app,
      textures
    })
    this.map.position.set(this.scoreBar.x, this.scoreBar.y + this.scoreBar.height + ScoreBar.options.padding * 2)
    this.addChild(this.map)

    this.drawBackground()

    this.player = new Player({})
    this.addChild(this.player)

    this.startModal = new StartModal({ viewWidth: this.background.width, viewHeight: this.background.height })
    this.startModal.visible = false
    this.addChild(this.startModal)
  }

  drawBackground (): void {
    const { background, scoreBar, map } = this
    background.beginFill(this.backgroundSettings.color)
    background.drawRect(0, 0, map.width, scoreBar.height + ScoreBar.options.padding + map.height)
    background.endFill()
  }

  handleResize (options: { viewWidth: number, viewHeight: number }): void {
    this.resizeBackground(options)
    this.centerModal(options)
  }

  centerModal ({ viewWidth, viewHeight }: { viewWidth: number, viewHeight: number }): void {
    this.startModal.position.set(viewWidth / 2 - this.startModal.boxOptions.width / 2, viewHeight / 2 - this.startModal.boxOptions.height / 2)
  }

  resizeBackground ({ viewWidth, viewHeight }: { viewWidth: number, viewHeight: number }): void {
    const availableWidth = viewWidth
    const availableHeight = viewHeight
    const totalWidth = this.background.width
    const totalHeight = this.background.height
    let scale = 1
    if (totalHeight >= totalWidth) {
      scale = availableHeight / totalHeight
      if (scale * totalWidth > availableWidth) {
        scale = availableWidth / totalWidth
      }
      logLayout(`By height (sc=${scale})`)
    } else {
      scale = availableWidth / totalWidth
      logLayout(`By width (sc=${scale})`)
      if (scale * totalHeight > availableHeight) {
        scale = availableHeight / totalHeight
      }
    }
    const occupiedWidth = Math.floor(totalWidth * scale)
    const occupiedHeight = Math.floor(totalHeight * scale)
    const x = availableWidth > occupiedWidth ? (availableWidth - occupiedWidth) / 2 : 0
    const y = availableHeight > occupiedHeight ? (availableHeight - occupiedHeight) / 2 : 0
    logLayout(`aw=${availableWidth} (ow=${occupiedWidth}) x=${x} ah=${availableHeight} (oh=${occupiedHeight}) y=${y}`)
    this.x = x
    this.width = occupiedWidth
    this.y = y
    this.height = occupiedHeight
    logLayout(`x=${x} y=${y} w=${this.width} h=${this.height}`)
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
