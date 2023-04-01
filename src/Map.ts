import { type Application, Container, type Texture } from 'pixi.js'
import { Boundary } from './Boundary'
import { Pellet } from './Pellet'
import { PowerUp } from './PowerUp'

/*
║ - vertical
═ - horizontal
╗ - top right corner
╝ - bottom right corner
╔ - top left corner
╚ - bottom left corner
■ - block
. - dot
╦ - connector bottom
╩ - connector top
╣ - connector left
╠ - connector right
╬ - connector cross
[ - cap left
] - cap right
_ - cap bottom
^ - cap top
P - power up
*/

const MAP = [
  ['╔', '═', '═', '═', '═', '═', '═', '═', '═', '═', '╗'],
  ['║', ' ', '.', '.', '.', '.', '.', '.', '.', '.', '║'],
  ['║', '.', '■', '.', '[', '╦', ']', '.', '■', '.', '║'],
  ['║', '.', '.', '.', '.', '_', '.', '.', '.', '.', '║'],
  ['║', '.', '[', ']', '.', '.', '.', '[', ']', '.', '║'],
  ['║', '.', '.', '.', '.', '^', '.', '.', '.', '.', '║'],
  ['║', '.', '■', '.', '[', '╬', ']', '.', '■', '.', '║'],
  ['║', '.', '.', '.', '.', '_', '.', '.', '.', '.', '║'],
  ['║', '.', '[', ']', '.', '.', '.', '[', ']', '.', '║'],
  ['║', '.', '.', '.', '.', '^', '.', '.', '.', '.', '║'],
  ['║', '.', '■', '.', '[', '╩', ']', '.', '■', '.', '║'],
  ['║', '.', '.', '.', '.', '.', '.', '.', '.', 'P', '║'],
  ['╚', '═', '═', '═', '═', '═', '═', '═', '═', '═', '╝']
]

export interface IMapOptions {
  app: Application
  textures: {
    blockTexture: Texture
    capBottomTexture: Texture
    capLeftTexture: Texture
    capRightTexture: Texture
    capTopTexture: Texture
    pipeConnectorBottomTexture: Texture
    pipeConnectorLeftTexture: Texture
    pipeConnectorRightTexture: Texture
    pipeConnectorTopTexture: Texture
    pipeCornerBottomLeftTexture: Texture
    pipeCornerBottomRightTexture: Texture
    pipeCornerTopLeftTexture: Texture
    pipeCornerTopRightTexture: Texture
    pipeCrossTexture: Texture
    pipeHorizontalTexture: Texture
    pipeVerticalTexture: Texture
  }
}

export class Map extends Container {
  static cell = 40
  public boundaries: Boundary[] = []
  public pellets: Pellet[] = []
  public powerUps: PowerUp[] = []
  public app!: Application
  public textures!: IMapOptions['textures']

  constructor (options: IMapOptions) {
    super()
    this.app = options.app
    this.textures = options.textures
    this.setup()
  }

  setup (): void {
    const {
      boundaries, pellets, powerUps,
      app,
      textures: {
        pipeHorizontalTexture,
        pipeVerticalTexture,
        pipeCornerTopLeftTexture,
        pipeCornerTopRightTexture,
        pipeCornerBottomLeftTexture,
        pipeCornerBottomRightTexture,
        blockTexture,
        capLeftTexture,
        capRightTexture,
        capTopTexture,
        capBottomTexture,
        pipeCrossTexture,
        pipeConnectorTopTexture,
        pipeConnectorBottomTexture,
        pipeConnectorLeftTexture,
        pipeConnectorRightTexture
      }
    } = this
    MAP.forEach((row, i) => {
      row.forEach((symbol, j) => {
        const initX = Map.cell * j
        const initY = Map.cell * i
        const centerX = initX + Map.cell / 2
        const centerY = initY + Map.cell / 2
        switch (symbol) {
          case '═':
            boundaries.push(
              new Boundary({
                code: symbol,
                initX,
                initY,
                texture: pipeHorizontalTexture
              })
            )
            break

          case '║':
            boundaries.push(
              new Boundary({
                code: symbol,
                initX,
                initY,
                texture: pipeVerticalTexture
              })
            )
            break

          case '╔':
            boundaries.push(
              new Boundary({
                code: symbol,
                initX,
                initY,
                texture: pipeCornerTopLeftTexture
              })
            )
            break

          case '╗':
            boundaries.push(
              new Boundary({
                code: symbol,
                initX,
                initY,
                texture: pipeCornerTopRightTexture
              })
            )
            break

          case '╝':
            boundaries.push(
              new Boundary({
                code: symbol,
                initX,
                initY,
                texture: pipeCornerBottomRightTexture
              })
            )
            break

          case '╚':
            boundaries.push(
              new Boundary({
                code: symbol,
                initX,
                initY,
                texture: pipeCornerBottomLeftTexture
              })
            )
            break

          case '■':
            boundaries.push(
              new Boundary({
                code: symbol,
                initX,
                initY,
                texture: blockTexture
              })
            )
            break

          case '[':
            boundaries.push(
              new Boundary({
                code: symbol,
                initX,
                initY,
                texture: capLeftTexture
              })
            )
            break

          case ']':
            boundaries.push(
              new Boundary({
                code: symbol,
                initX,
                initY,
                texture: capRightTexture
              })
            )
            break

          case '_':
            boundaries.push(
              new Boundary({
                code: symbol,
                initX,
                initY,
                texture: capBottomTexture
              })
            )
            break

          case '^':
            boundaries.push(
              new Boundary({
                code: symbol,
                initX,
                initY,
                texture: capTopTexture
              })
            )
            break

          case '╬':
            boundaries.push(
              new Boundary({
                code: symbol,
                initX,
                initY,
                texture: pipeCrossTexture
              })
            )
            break

          case '╩':
            boundaries.push(
              new Boundary({
                code: symbol,
                initX,
                initY,
                texture: pipeConnectorTopTexture
              })
            )
            break

          case '╠':
            boundaries.push(
              new Boundary({
                code: symbol,
                initX,
                initY,
                texture: pipeConnectorRightTexture
              })
            )
            break

          case '╦':
            boundaries.push(
              new Boundary({
                code: symbol,
                initX,
                initY,
                texture: pipeConnectorBottomTexture
              })
            )
            break

          case '╣':
            boundaries.push(
              new Boundary({
                code: symbol,
                initX,
                initY,
                texture: pipeConnectorLeftTexture
              })
            )
            break

          case '.':
            pellets.push(
              new Pellet({
                app,
                centerX,
                centerY
              })
            )
            break

          case 'P':
            powerUps.push(
              new PowerUp({
                app,
                centerX,
                centerY
              })
            )
            break
        }
      })
    })
    boundaries.forEach(item => this.addChild(item))
    pellets.forEach(item => this.addChild(item))
    powerUps.forEach(item => this.addChild(item))
  }

  cleanFromAll (): void {
    for (const boundary of this.boundaries) {
      boundary.removeFromParent()
    }
    this.boundaries = []
    for (const pellet of this.pellets) {
      pellet.removeFromParent()
    }
    this.pellets = []
    for (const powerUp of this.powerUps) {
      powerUp.removeFromParent()
    }
    this.powerUps = []
  }

  restart (): void {
    this.cleanFromAll()
    this.setup()
  }
}
