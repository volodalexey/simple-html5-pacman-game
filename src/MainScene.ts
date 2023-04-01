import { Container, type FederatedPointerEvent, Graphics, type Application, type Texture } from 'pixi.js'
import { ScoreBar } from './ScoreBar'
import { Player } from './Player'
import { logKeydown, logKeyup, logLayout, logPlayerCheck, logPointerEvent } from './logger'
import { type IScene } from './SceneManager'
import { StartModal } from './StartModal'
import { type IMapOptions, Map } from './Map'
import { Pellet } from './Pellet'
import { Ghost } from './Ghost'

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
  public ghosts: Ghost[] = []

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

    this.player = new Player({
      app: this.app,
      centerX: Map.cell + Map.cell / 2,
      centerY: Map.cell + Map.cell / 2
    })
    this.map.addChild(this.player)

    this.setupGhosts()

    this.startModal = new StartModal({ viewWidth: this.background.width, viewHeight: this.background.height })
    this.startModal.visible = false
    this.addChild(this.startModal)
  }

  setupGhosts (): void {
    for (const ghost of this.ghosts) {
      ghost.removeFromParent()
    }
    this.ghosts = []
    this.ghosts.push(new Ghost({
      app: this.app,
      centerX: Map.cell * 6 + Map.cell / 2,
      centerY: Map.cell + Map.cell / 2,
      fillColor: 0xc2410c
    }))
    this.ghosts.push(new Ghost({
      app: this.app,
      centerX: Map.cell * 6 + Map.cell / 2,
      centerY: Map.cell * 3 + Map.cell / 2,
      fillColor: 0xdb2777
    }))
    this.ghosts.forEach(g => this.map.addChild(g))
  }

  drawBackground (): void {
    const { background, scoreBar, map } = this
    background.beginFill(this.backgroundSettings.color)
    background.drawRect(0, 0, map.width, scoreBar.height + ScoreBar.options.padding + map.height)
    background.endFill()
  }

  handleResize (options: { viewWidth: number, viewHeight: number }): void {
    this.resizeBackground(options)
    this.centerModal()
  }

  centerModal (): void {
    this.startModal.position.set(this.background.width / 2 - this.startModal.boxOptions.width / 2, this.background.height / 2 - this.startModal.boxOptions.height / 2)
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
    const padding = (Map.cell - Player.options.radius * 2) / 2 - 1
    if (this.player.pointerYDown !== null && this.player.lastPointerDirection === 'top') {
      this.player.checkIfMoveUp(this.map.boundaries, padding)
    } else if (this.player.pointerYDown !== null && this.player.lastPointerDirection === 'bottom') {
      this.player.checkIfMoveDown(this.map.boundaries, padding)
    } else if (this.player.pointerXDown !== null && this.player.lastPointerDirection === 'left') {
      this.player.checkIfMoveLeft(this.map.boundaries, padding)
    } else if (this.player.pointerXDown !== null && this.player.lastPointerDirection === 'right') {
      this.player.checkIfMoveRight(this.map.boundaries, padding)
    }

    // detect collision between ghosts and player
    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      const ghost = this.ghosts[i]
      // ghost touches player
      if (
        Math.hypot(
          ghost.x - this.player.x,
          ghost.y - this.player.y
        ) <
      Ghost.options.radius + Player.options.radius
      ) {
        if (ghost.isScared) {
          this.ghosts.splice(i, 1)
          ghost.removeFromParent()
        } else {
          this.endGame()
        }
      }
    }

    // touch pellets here
    for (let i = this.map.pellets.length - 1; i >= 0; i--) {
      const pellet = this.map.pellets[i]

      if (
        Math.hypot(
          pellet.position.x - this.player.x,
          pellet.position.y - this.player.y
        ) <
      Pellet.options.radius + Player.options.radius
      ) {
        this.map.pellets.splice(i, 1)
        pellet.removeFromParent()
        this.scoreBar.addScore(10)
      }
    }
    if (this.player.checkIfMove({ vx: this.player.velocity.vx, vy: this.player.velocity.vy, boundaries: this.map.boundaries, padding })) {
      logPlayerCheck('Full stop')
    }
    this.player.updatePosition()
    this.player.updateState()
  }

  addEventLesteners (): void {
    this.interactive = true
    this.on('pointerdown', this.handlePointerDown)
    this.on('pointermove', this.handlePointerMove)
    this.on('pointerup', this.handlePointerUp)
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
    this.startModal.on('click', this.startGame)
  }

  handlePlayerMove (pressed: boolean | undefined, e: FederatedPointerEvent): void {
    const pointerPoint = this.map.toLocal(e.global)
    logPointerEvent(`${e.type} px=${pointerPoint.x} py=${pointerPoint.y}`)
    this.player.applyPointerToDirection(pressed, pointerPoint.x, pointerPoint.y)
  }

  handlePointerDown = (e: FederatedPointerEvent): void => {
    this.handlePlayerMove(true, e)
  }

  handlePointerMove = (e: FederatedPointerEvent): void => {
    this.handlePlayerMove(undefined, e)
  }

  handlePointerUp = (e: FederatedPointerEvent): void => {
    this.handlePlayerMove(false, e)
  }

  handleKeyDown = (e: KeyboardEvent): void => {
    logKeydown(`${e.code} ${e.key}`)
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':
        this.player.applyTopDirection(true)
        break
      case 'KeyA': case 'ArrowLeft':
        this.player.applyLeftDirection(true)
        break
      case 'KeyD':case 'ArrowRight':
        this.player.applyRightDirection(true)
        break
      case 'KeyS': case 'ArrowDown':
        this.player.applyBottomDirection(true)
        break
    }
  }

  handleKeyUp = (e: KeyboardEvent): void => {
    logKeyup(`${e.code} ${e.key}`)
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':
        this.player.applyTopDirection(false)
        break
      case 'KeyA': case 'ArrowLeft':
        this.player.applyLeftDirection(false)
        break
      case 'KeyD':case 'ArrowRight':
        this.player.applyRightDirection(false)
        break
      case 'KeyS': case 'ArrowDown':
        this.player.applyBottomDirection(false)
        break
    }
  }

  startGame = (): void => {
    this.startModal.visible = false
    this.scoreBar.clearScore()
    this.map.restart()
    this.setupGhosts()
    this.player.restart()
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
