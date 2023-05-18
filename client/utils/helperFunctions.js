import * as THREE from 'three'
import { CSG } from 'three-csg-ts'
import {Wall} from '../classes/wallClass'
import {Pellet} from '../classes/pelletClass'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

//CONSTANTS
const WIDTH = 104
const HEIGHT = 88
const DEPTH = 2
const loader = new GLTFLoader()
const textureLoader = new THREE.TextureLoader()
//INITIALZING SCENE
export function initScene(){
    const scene = new THREE.Scene() 
    scene.background = new THREE.TextureLoader().load('/textures/texture_0.jpeg')
    // scene.backgroundBlurrines = 0.5
    // scene.background = new THREE.Color('white')
    return scene
}
export function initCamera(){
    const camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,200)
    camera.position.set(0,100,60)
    camera.rotation.set(-Math.PI/3, 0, 0)
    return camera
}

export function initRenderer(){
    const renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.shadowMap.enabled = true
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    // document.body.appendChild(renderer.domElement)
    return renderer
}

//LIGHT
export function initLights(){
    // const ambientlight = new THREE.AmbientLight('blue', 0.3)
    const light = new THREE.DirectionalLight('white', 1)
    light.castShadow = true
    light.position.set(0,90,55)
    light.shadow.mapSize.width = 200;
    light.shadow.mapSize.height = 200;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 200;
    light.shadow.camera.top = 50;
    light.shadow.camera.bottom = - 50;
    light.shadow.camera.left = - 50;
    light.shadow.camera.right = 50;
  
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
    dirLight.position.set(0, 100, 0);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = - 50;
    dirLight.shadow.camera.left = - 50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 200;
    dirLight.shadow.mapSize.height = 200;
    // scene.add(dirLight);
    // scene.add(ambientlight)
    return {light, dirLight};
}
//CREATING GROUND FOR BOARD
export function createGround(){
    //THREE JS
    const groundTexture = textureLoader.load('/textures/texture_2.jpeg')

    const box = new THREE.Mesh(
        new THREE.BoxGeometry(WIDTH-6,HEIGHT-6,DEPTH-1),
        new THREE.MeshStandardMaterial({map: groundTexture})
      );
    box.rotation.x = - Math.PI / 2
    const box2 = new THREE.Mesh(
        new THREE.BoxGeometry(10,12,20),
        new THREE.MeshBasicMaterial({color:'blue'})
    );
    box2.position.set(-20,0,HEIGHT/2-4)
    box.updateMatrix()
    box2.updateMatrix()
    let subRes = CSG.subtract(box, box2);
    subRes.rotation.x = - Math.PI / 2
    box2.position.set(20,0,HEIGHT/2-4)
    box2.updateMatrix()
    subRes = CSG.subtract(subRes, box2)
    box2.position.set(-20,0,-HEIGHT/2+4)
    box2.updateMatrix()
    subRes = CSG.subtract(subRes,box2)
    box2.position.set(20,0,-HEIGHT/2+4)
    box2.updateMatrix()
    subRes = CSG.subtract(subRes,box2)
    subRes.receiveShadow = true
    return subRes
  
  }
//RENDERING BOARD
export function renderBoard(scene, walls){
    
    for(let i = 0; i < walls.length; i++){
      const backendWall = walls[i]
      const frontendWall = new Wall(backendWall.height)
      if(frontendWall){
        frontendWall.mesh.position.x = backendWall.position.x
        frontendWall.mesh.position.y = backendWall.position.y
        frontendWall.mesh.position.z = backendWall.position.z
        walls[i] = frontendWall
        scene.add(frontendWall.mesh)
      }
    } 
}

//RENDERING PELLETS
export function renderPellets(scene,backendPellets, pellets){
  for(let i=0; i < backendPellets.length; i++){
    const pelletBackend = backendPellets[i];
    const frontendPellet = new Pellet(i,pelletBackend.position, pelletBackend.show)
    if(frontendPellet){
      frontendPellet.mesh.position.x = frontendPellet.position.x
      frontendPellet.mesh.position.y = frontendPellet.position.y
      frontendPellet.mesh.position.z = frontendPellet.position.z
      pellets[i] = frontendPellet
      scene.add(frontendPellet.mesh)
    }

  }
}

//Loading Ghost Model
export async function loadGhost(){
  const ghostData = await loader.loadAsync('client/modules/ghost_purpleusdz.glb')
  const model = ghostData.scene
  
  model.traverse(function(object){
        if(object.isMesh) object.castShadow = true
    })
  model.scale.set(2.5,2.5,2.5)
  const gltfAnimations = ghostData.animations
  const mixer = new THREE.AnimationMixer(model)
  const animationMap = new Map()
  gltfAnimations.forEach((a) => {
        animationMap.set(a.name, mixer.clipAction(a))
  })
  return {model,mixer,animationMap}
}

export async function loadPacman(){
  const pacmanData = await loader.loadAsync('client/modules/pacman_animated.glb')
  const model = pacmanData.scene

  model.traverse(function(object){
      if(object.isMesh) object.castShadow = true
  })
  model.scale.set(3,3,3)
  const gltfAnimations = pacmanData.animations
  const mixer = new THREE.AnimationMixer(model)
  const animationMap = new Map()
  gltfAnimations.forEach((a) => {
      animationMap.set(a.name, mixer.clipAction(a))
  })
  return {model,mixer,animationMap}
}