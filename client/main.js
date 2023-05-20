import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
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
  renderPellets,
  loadAlien
} from './utils/helperFunctions'
import {Ghost} from './classes/ghostClass'
import {Pacman} from './classes/pacmanClass'
import {Alien} from './classes/alienClass'

//GLOBAL VARIABLES
let scene, camera, renderer, controls
let animationId
let ghost = null
let alien = null
let pacman
let prevtime = 0
let lastkey = ''
let walls = []
let pellets = []
let gameActive = false
let ghostBackendData

const pacmanDelta = 0.025
const alienDelta = 0.04
const players = {}
const clock = new THREE.Clock()


const socket = io()





//---------SOCKET-----------//

socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('startGame', handleStartGame);
socket.on('ghostUpdatePosition',handleBackendGhostData);
// socket.on('ghostScared', handleGhostScared);
socket.on('pacmanToPacmanCollision', handlePacmanToPacmanCollision);
socket.on('pacmanUpdatePosition',handlePacmanUpdatePosition);
socket.on('pelletsToRemove', handlePellets);
socket.on('alienUpdatePosition', handleAlienUpdatePosition)
socket.on('pacmanDied', handlePacmanDied)
socket.on('gameEnd', handleGameEnd)



//---------------------//




const initialScreen = document.getElementById('initialScreen');
const initialPage = document.getElementById('initialPage');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const canvasContainer = document.getElementById('canvasContainer')

//do not code like this
const playerOneName = document.getElementById('playerName1')
const playerTwoName = document.getElementById('playerName2')
const playerThreeName = document.getElementById('playerName3')
const playerFourName = document.getElementById('playerName4')
const playerOneAvatar = document.getElementById('playerAvatar1')
const playerTwoAvatar = document.getElementById('playerAvatar2')
const playerThreeAvatar = document.getElementById('playerAvatar3')
const playerFourAvatar = document.getElementById('playerAvatar4')
const playerOneScore = document.getElementById('playerScore1')
const playerTwoScore = document.getElementById('playerScore2')
const playerThreeScore = document.getElementById('playerScore3')
const playerFourScore = document.getElementById('playerScore4')


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
  initialScreen.style.display = 'none'
  socket.emit('joinGame', code);
  handleNotification('Please wait for others to join')

}
function handleGameCode(gameCode) {
  initialScreen.style.display = 'none'
  handleNotification(
    `Your game code is: ${gameCode}`
  )
}

function handleUnknownCode() {
  initialScreen.style.display = 'none'
  
  handleNotification('Unknown Code, Please enter valid code', 4000)
  setTimeout(() =>{
    initialScreen.style.display = 'flex'
  }, 4000)
}

function handleTooManyPlayers() {
  initialScreen.style.display = 'none'
  handleNotification('Game is already in progress, join another game', 4000)
  setTimeout(() =>{
    initialScreen.style.display = 'flex'
  }, 4000)
  
}
function handleStartGame(){
  gameActive = true
  initialPage.style.display = 'none'
  canvasContainer.style.display = 'block'
  main()
  handleNotification(
    'Welcome to Pacman Battle for the last, game starts in a few seconds', 10000
  )
  
  
}
function handleBackendGhostData(backendGhostData){
  ghostBackendData = backendGhostData
  ghost?.updatePosition(ghostBackendData)
}
// function handleGhostScared(data){
//   scene?.remove(ghost?.model)
//   ghost = null
// }
function handlePacmanToPacmanCollision(data){
  for(let i =0; i< data?.length; i++){
    const playerPacman = players[data[i]]?.pacman
    console.log(playerPacman)
    playerPacman?.animateCollision()
  }
}
function handlePacmanUpdatePosition(backendPacmanData){
  if(Object.keys(players).length !==0){
    for(const key in players){
      const pacman = players[key].pacman
      const backendPacman = backendPacmanData[key].pacman
      pacman.updatePosition(backendPacman)
      //handleScoreBoard
      if(backendPacmanData[key].playerNumber === 'One'){
        playerOneScore.innerHTML = backendPacmanData[key].pacman.score
      } else if(backendPacmanData[key].playerNumber === 'Two'){
        playerTwoScore.innerHTML = backendPacmanData[key].pacman.score
      } else if(backendPacmanData[key].playerNumber === 'Three'){
        playerThreeScore.innerHTML = backendPacmanData[key].pacman.score
      } else if(backendPacmanData[key].playerNumber === 'Four'){
        playerFourScore.innerHTML = backendPacmanData[key].pacman.score
      }
    }
  }
}
function handlePellets(backendPelletsToRemove){
  for(let i=0; i<backendPelletsToRemove.length; i++){
    const backendPellet = backendPelletsToRemove[i]
    const frontendPellet = pellets[backendPellet.id]
    frontendPellet.show = false
    scene.remove(frontendPellet.mesh)
  }
}

function handleAlienUpdatePosition(alienBackendPosition){
  alien?.updatePosition(alienBackendPosition)
}
function handlePacmanDied(pacmanKey){
  const pacman = players[pacmanKey].pacman
  alien.getPacman(pacman, scene)
  handleNotification(
    "Pacman Died, wait until it revives as a Ghost!!!",
    14000
  )
}

function handleNotification(message,duration = null){
  const notification = document.getElementById('notification');
  const notificationText = document.getElementById('notificationText');
  notificationText.textContent = message;

  notification.classList.add('show');
  if(duration){
    setTimeout(function() {
    notification.classList.remove('show');
  }, duration);
  }
}
function handleNotificationRemove(){
  const notification = document.getElementById('notification');
  notification.classList.remove('show');
}


function handleGameEnd(winnerKey){
  if(socket.id === winnerKey){
    handleNotification(
      'Congratulations!!! You are the winner!!!'
    )
  } else{
    handleNotification(
      'You lost, better luck next time!!!'
    )
  }
}



//---------------------------------------------------//




async function main(){
    scene = initScene()
    camera = initCamera()
    renderer = initRenderer()
    canvasContainer.appendChild(renderer.domElement)
    
    
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
    
    

    //init ALIEN
    socket.on('initAlienPosition', async (backendAlienData) =>{
        const alienModel = await loadAlien()
        alien = new Alien(alienModel.model,alienModel.mixer,alienModel.animationMap, "CINEMA_4D_Main")
        alien.model.position.x = backendAlienData.x
        alien.model.position.y = backendAlienData.y
        alien.model.position.z = backendAlienData.z
        scene.add(alien.model)
        alien.coneMesh.visible = false
        scene.add(alien.coneMesh)
    })


    //init GHOST 
    let initGhostBackendData;
    socket.on('initGhostPosition', async (backendGhostData) => {
      initGhostBackendData = backendGhostData
      const ghostModel = await loadGhost('purple')
      console.log("here")
      ghost = new Ghost(ghostModel.model,ghostModel.mixer,ghostModel.animationMap,'Animation')
      ghost.model.position.x = initGhostBackendData.x
      ghost.model.position.y = initGhostBackendData.y
      ghost.model.position.z = initGhostBackendData.z
      scene.add(ghost.model)
    })
    //init Pacman
    let initPacmanData;
    socket.on('initPacmanPosition', async (backendPacmanData) =>{
      console.log('backbackbackPacman',backendPacmanData)
      initPacmanData = backendPacmanData
      for(const key in initPacmanData){
        const backendPacman = initPacmanData[key].pacman
        const pacmanModel = await loadPacman(initPacmanData[key].color)
        const pacman = new Pacman(pacmanModel.model,pacmanModel.mixer,pacmanModel.animationMap, '', initPacmanData[key].color)
        pacman.model.position.x = backendPacman.position.x
        pacman.model.position.y = backendPacman.position.y
        pacman.model.position.z = backendPacman.position.z
        pacman.rotateQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), backendPacman.angle)
        pacman.model.quaternion.copy(pacman.rotateQuaternion)
        players[key] = {pacman: pacman}
        scene.add(pacman.model)


        //InitScoreBoard
        if(initPacmanData[key].playerNumber === 'One'){
          playerOneAvatar.style.background = `linear-gradient(135deg, ${initPacmanData[key].color}, #ffbf69)`
        } else if(initPacmanData[key].playerNumber === 'Two'){
          playerTwoAvatar.style.background = `linear-gradient(135deg, ${initPacmanData[key].color}, #ffbf69)`
        } else if(initPacmanData[key].playerNumber === 'Three'){
          playerThreeAvatar.style.background = `linear-gradient(135deg, ${initPacmanData[key].color}, #ffbf69)`
        } else if(initPacmanData[key].playerNumber === 'Four'){
          playerFourAvatar.style.background = `linear-gradient(135deg, ${initPacmanData[key].color}, #ffbf69)`
        }
        if(socket.id === key){
          if(initPacmanData[key].playerNumber === 'One'){
            playerOneName.innerHTML = 'You'
          } else if(initPacmanData[key].playerNumber === 'Two'){
            playerTwoName.innerHTML = 'You'
          } else if(initPacmanData[key].playerNumber === 'Three'){
            playerThreeName.innerHTML = 'You'
          } else if(initPacmanData[key].playerNumber === 'Four'){
            playerFourName.innerHTML = 'You'
          }
        }

      }
      console.log('frontendPlayers', players)
      
    })

    
    animate()
}


function animate(){
  TWEEN.update()
  const delta = clock.getDelta()
  
  //HANDLE GHOST
  if(ghost !== null){
    ghost?.updateDelta(delta)
  }

  //HANDLE PACMAN
  if(Object.keys(players).length !== 0){
    for(const key in players){
      const pacman = players[key].pacman
      pacman.updateDelta(pacmanDelta)
    }
  }

  //HANDLE ALIEN
  if(alien !==null){
    alien.updateDelta(alienDelta)
  }
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


window.addEventListener('resize', function(){
  if(renderer){
    renderer.setSize(innerWidth,innerHeight)
  }
  if(camera){
    camera.aspect =innerWidth/innerHeight
    camera.updateProjectionMatrix()
  }
})

//RUNNING
