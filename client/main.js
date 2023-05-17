import * as THREE from 'three'
import { io } from 'socket.io-client'
import {initScene,initCamera,initRenderer, initLights, createGround, renderBoard, loadGhost} from './utils/helperFunctions'
import {Ghost} from './classes/ghostClass'

//GLOBAL VARIABLES
let scene, camera, renderer, controls
let animationId
let ghost
let prevtime = 0
const clock = new THREE.Clock()
let ghostBackendData
let walls = []

//CONSTANTS
const socket = io()



async function main(){
    scene = initScene()
    camera = initCamera()
    renderer = initRenderer()
    
    //adding light to the scene
    const {light, dirlight} = initLights()
    scene.add(light)

    //adding ground to scene
    const ground = createGround()
    scene.add(ground)
    socket.on('renderBoard', (backendWalls) => {
        console.log('wowo')
        walls = backendWalls
        console.log(walls)
        renderBoard(scene,walls)
    })
    
    

    //init GHOST 
    const ghostData = await loadGhost()
    socket.on('initGhostPosition', (backendGhostData) => {
      ghost = new Ghost(ghostData.model,ghostData.mixer,ghostData.animationMap,'Animation')
      ghost.model.position.x = backendGhostData.x
      ghost.model.position.y = backendGhostData.y
      ghost.model.position.z = backendGhostData.z
      console.log('ghostPosition')

      scene.add(ghost.model)
    })
    


    
    animate()
}


function animate(){
  const deltaGhost = clock.getDelta()
  if(ghost){
    socket.on('ghostUpdatePosition', (backendGhostData) => {
      ghost.updatePosition(backendGhostData)
  })
  ghost.updateDelta(deltaGhost)
  }
  renderer.render(scene, camera)
  animationId = requestAnimationFrame(animate)
  
  
}

//RUNNING
main()
