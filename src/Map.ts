import { type Application, Container, type Texture } from 'pixi.js'
import { Boundary } from './Boundary'
import { Pellet } from './Pellet'
import { PowerUp } from './PowerUp'

/*
║ - vertical
═ - horizontal
╔ - top left corner
╗ - top right corner
╚ - bottom left corner
╚ - bottom left corner
╝ - bottom right corner
■ - block
. - dot
╦ - horizontal top bottom
╩ - vertical top top
╬ - cross
[ - cap left
] - cap right
_ - cap bottom
^ - cap top
P - power up
*/

const MAP = [
  ['╔', '═', '═', '═', '═', '═', '═', '═', '═', '═', '╗'],
  ['║', '.', '.', '.', '.', '.', '.', '.', '.', '.', '║'],
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
  public boundaries: Boundary[] = []
  public pellets: Pellet[] = []
  public powerUps: PowerUp[] = []

  constructor (options: IMapOptions) {
    super()
    this.setup(options)
  }

  setup ({
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
  }: IMapOptions): void {
    const { boundaries, pellets, powerUps } = this
    MAP.forEach((row, i) => {
      row.forEach((symbol, j) => {
        const initX = Boundary.cell * j
        const initY = Boundary.cell * i
        const centerX = initX + Boundary.cell / 2
        const centerY = initY + Boundary.cell / 2
        switch (symbol) {
          case '═':
            boundaries.push(
              new Boundary({
                initX,
                initY,
                texture: pipeHorizontalTexture
              })
            )
            break

          case '║':
            boundaries.push(
              new Boundary({
                initX,
                initY,
                texture: pipeVerticalTexture
              })
            )
            break

          case '╔':
            boundaries.push(
              new Boundary({
                initX,
                initY,
                texture: pipeCornerTopLeftTexture
              })
            )
            break

          case '╗':
            boundaries.push(
              new Boundary({
                initX,
                initY,
                texture: pipeCornerTopRightTexture
              })
            )
            break

          case '╝':
            boundaries.push(
              new Boundary({
                initX,
                initY,
                texture: pipeCornerBottomRightTexture
              })
            )
            break

          case '╚':
            boundaries.push(
              new Boundary({
                initX,
                initY,
                texture: pipeCornerBottomLeftTexture
              })
            )
            break

          case '■':
            boundaries.push(
              new Boundary({
                initX,
                initY,
                texture: blockTexture
              })
            )
            break

          case '[':
            boundaries.push(
              new Boundary({
                initX,
                initY,
                texture: capLeftTexture
              })
            )
            break

          case ']':
            boundaries.push(
              new Boundary({
                initX,
                initY,
                texture: capRightTexture
              })
            )
            break

          case '_':
            boundaries.push(
              new Boundary({
                initX,
                initY,
                texture: capBottomTexture
              })
            )
            break

          case '^':
            boundaries.push(
              new Boundary({
                initX,
                initY,
                texture: capTopTexture
              })
            )
            break

          case '╬':
            boundaries.push(
              new Boundary({
                initX,
                initY,
                texture: pipeCrossTexture
              })
            )
            break

          case '╩':
            boundaries.push(
              new Boundary({
                initX,
                initY,
                texture: pipeConnectorTopTexture
              })
            )
            break

          case '╠':
            boundaries.push(
              new Boundary({
                initX,
                initY,
                texture: pipeConnectorRightTexture
              })
            )
            break

          case '╦':
            boundaries.push(
              new Boundary({
                initX,
                initY,
                texture: pipeConnectorBottomTexture
              })
            )
            break

          case '╣':
            boundaries.push(
              new Boundary({
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
    boundaries.concat(pellets).concat(powerUps).forEach(item => this.addChild(item))
  }
}
