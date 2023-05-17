import * as THREE from 'three'
import { io } from 'socket.io-client'
import {
  initScene,
  initCamera,
  initRenderer, 
  initLights, 
  createGround, 
  renderBoard, 
  loadGhost, 
  loadPacman,
  renderPellets
} from './utils/helperFunctions'
import {Ghost} from './classes/ghostClass'
import {Pacman} from './classes/pacmanClass'

//GLOBAL VARIABLES
let scene, camera, renderer, controls
let animationId
let ghost
let pacman
let prevtime = 0
const clock = new THREE.Clock()
let ghostBackendData
let lastkey = ''
let walls = []
let pellets = []
const players = {}

//CONSTANTS
const socket = io()

//--------------------//

let playerNumber
let gameActive = false

//--------------------//

socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('startGame', handleStartGame)




const initialScreen = document.getElementById('initialScreen');
const initialPage = document.getElementById('initialPage');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const gameScreen = document.getElementById('gameScreen');



//-------------------//
//EVENT LISTENERS
newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);


//--------------------DELETE OR MAKE GOOD USE OF IT-----------------------------//
function newGame(){
  socket.emit('newGame')
}

function joinGame(){
  const code = gameCodeInput.value;
  socket.emit('joinGame', code);

}
function handleGameCode(gameCode) {
  initialScreen.style.display = 'none'
  gameScreen.style.display = 'block'
  gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode() {
  initialScreen.style.display = 'block'
  gameScreen.style.display = 'none'
  alert('Unknown Game Code')
}

function handleTooManyPlayers() {
  initialScreen.style.display = 'block'
  gameScreen.style.display = 'none'
  alert('This game is already in progress');
}
function handleStartGame(){
  gameActive = true
  initialScreen.style.display = "none"
  gameScreen.style.display = 'none'
  initialPage.style.display = 'none'
  main()
}



//---------------------------------------------------//




async function main(){
    scene = initScene()
    camera = initCamera()
    renderer = initRenderer()
    document.body.appendChild(renderer.domElement)
    
    
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
    //adding pellets to the scene
    socket.on('createPellets', (backendPellets) => {
      console.log('pellets')
      renderPellets(scene, backendPellets, pellets)
      
    })
    
    

    //init GHOST 
    let initGhostBackendData;
    socket.on('initGhostPosition', async (backendGhostData) => {
      console.log('real champions')
      initGhostBackendData = backendGhostData
      const ghostModel = await loadGhost()
      console.log("here")
      ghost = new Ghost(ghostModel.model,ghostModel.mixer,ghostModel.animationMap,'Animation')
      ghost.model.position.x = initGhostBackendData.x
      ghost.model.position.y = initGhostBackendData.y
      ghost.model.position.z = initGhostBackendData.z
      console.log('ghostPosition')
      scene.add(ghost.model)
    })
    //init Pacman
    let initPacmanData;
    socket.on('initPacmanPosition', async (backendPacmanData) =>{
      console.log('backbackbackPacman',backendPacmanData)
      initPacmanData = backendPacmanData
      for(const key in initPacmanData){
        const backendPacman = initPacmanData[key].pacman
        const pacmanModel = await loadPacman()
        const pacman = new Pacman(pacmanModel.model,pacmanModel.mixer,pacmanModel.animationMap, '')
        pacman.model.position.x = backendPacman.position.x
        pacman.model.position.y = backendPacman.position.y
        pacman.model.position.z = backendPacman.position.z
        pacman.rotateQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), backendPacman.angle)
        pacman.model.quaternion.copy(pacman.rotateQuaternion)
        players[key] = {pacman: pacman}
        scene.add(pacman.model)
      }
      console.log('frontendPlayers', players)
      
    })
    
    
    

    
    animate()
}


function animate(){
  const delta = clock.getDelta()
  let pacmanDelta = 0.025

  //HANDLE GHOST
  if(ghost){
    socket.on('ghostUpdatePosition', (backendGhostData) => {
      ghost.updatePosition(backendGhostData)
    })
    ghost.updateDelta(delta)
  }

  //HANDLE PACMAN
  if(Object.keys(players).length !== 0){
    socket.on('pacmanUpdatePosition', (backendPacmanData) =>{
      for(const key in players){
        const pacman = players[key].pacman
        const backendPacman = backendPacmanData[key].pacman
        pacman.updatePosition(backendPacman)
      }
    })
    for(const key in players){
      const pacman = players[key].pacman
      pacman.updateDelta(pacmanDelta)
    }
  }
  //HANDLE PELLETS
  socket.on('pelletsToRemove', (backendPelletsToRemove) =>{
    for(let i=0; i<backendPelletsToRemove.length; i++){
      const backendPellet = backendPelletsToRemove[i]
      const frontendPellet = pellets[backendPellet.id]
      frontendPellet.show = false
      scene.remove(frontendPellet.mesh)
    }
  })

  renderer.render(scene, camera)
  animationId = requestAnimationFrame(animate) 
}


//WINDOW LISTENER
window.addEventListener('keydown', ({key}) => {
  const lowerCaseKey = key.toLowerCase()
  switch(lowerCaseKey){
      case 'w':
          lastkey = "w"
          break
      case 'a':
          lastkey = 'a'
          
          break
      case 's':
          lastkey = 's'
          
          break
      case 'd':
          lastkey = 'd'
          break       
  }
  if(['w','a', 's', 'd'].includes(lastkey)){
    socket.emit('keyPressed', lastkey)
  }
})

//RUNNING
