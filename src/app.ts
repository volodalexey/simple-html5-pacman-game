import './styles.css'
import { SceneManager } from './SceneManager'
import { MainScene } from './MainScene'
import { LoaderScene } from './LoaderScene'

async function run (): Promise<void> {
  const ellipsis: HTMLElement | null = document.querySelector('.ellipsis')
  if (ellipsis != null) {
    ellipsis.parentElement?.removeChild(ellipsis)
  }
  await SceneManager.initialize()
  const loaderScene = new LoaderScene({
    viewWidth: SceneManager.width,
    viewHeight: SceneManager.height
  })
  await SceneManager.changeScene(loaderScene)
  await loaderScene.initializeLoader()
  const { spritesheet: { textures } } = loaderScene.getAssets()
  await SceneManager.changeScene(new MainScene({
    app: SceneManager.app,
    viewWidth: SceneManager.width,
    viewHeight: SceneManager.height,
    textures: {
      blockTexture: textures['block.png'],
      capBottomTexture: textures['capBottom.png'],
      capLeftTexture: textures['capLeft.png'],
      capRightTexture: textures['capRight.png'],
      capTopTexture: textures['capTop.png'],
      pipeConnectorBottomTexture: textures['pipeConnectorBottom.png'],
      pipeConnectorLeftTexture: textures['pipeConnectorLeft.png'],
      pipeConnectorRightTexture: textures['pipeConnectorRight.png'],
      pipeConnectorTopTexture: textures['pipeConnectorTop.png'],
      pipeCornerBottomLeftTexture: textures['pipeCornerBottomLeft.png'],
      pipeCornerBottomRightTexture: textures['pipeCornerBottomRight.png'],
      pipeCornerTopLeftTexture: textures['pipeCornerTopLeft.png'],
      pipeCornerTopRightTexture: textures['pipeCornerTopRight.png'],
      pipeCrossTexture: textures['pipeCross.png'],
      pipeHorizontalTexture: textures['pipeHorizontal.png'],
      pipeVerticalTexture: textures['pipeVertical.png']
    }
  }))
}

run().catch((err) => {
  console.error(err)
  const errorMessageDiv: HTMLElement | null = document.querySelector('.error-message')
  if (errorMessageDiv != null) {
    errorMessageDiv.classList.remove('hidden')
    errorMessageDiv.innerText = ((Boolean(err)) && (Boolean(err.message))) ? err.message : err
  }
  const errorStackDiv: HTMLElement | null = document.querySelector('.error-stack')
  if (errorStackDiv != null) {
    errorStackDiv.classList.remove('hidden')
    errorStackDiv.innerText = ((Boolean(err)) && (Boolean(err.stack))) ? err.stack : ''
  }
  const canvas: HTMLCanvasElement | null = document.querySelector('canvas')
  if (canvas != null) {
    canvas.parentElement?.removeChild(canvas)
  }
})
