import * as THREE from  'three'
import * as TWEEN from '@tweenjs/tween.js'

export class Pacman{
    constructor(model, mixer, animationsMap, currentAction){
        this.model = model
        this.mixer = mixer
        this.animationsMap = animationsMap
        this.currentAction = currentAction
        this.rotateQuaternion = new THREE.Quaternion()
        this.score = 0
        this.angle = 0
        this.animateCollisionStarted = false
        
    }

    updatePosition(backendPacman){
        if(backendPacman){
            this.currentAction ='eat once.011'
            this.model.position.x = backendPacman.position.x
            this.model.position.z = backendPacman.position.z
            this.rotateQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), backendPacman.angle)
            this.model.quaternion.copy(this.rotateQuaternion) 
            this.score = backendPacman.score
            this.angle = backendPacman.angle
            
        }
    }
    updateDelta(delta){
        if(this.animateCollisionStarted){
            this.animationsMap.get(this.currentAction)?.stop()
        }
        this.animationsMap.get(this.currentAction)?.play()
        this.mixer.update(delta)
    }
    animateCollision(){
        this.animateCollisionStarted = true
        let tweenUp
        let tweenDown
        let tweenY
        let lookBack
        if(this.angle === 0 || this.angle === Math.PI){
            tweenUp = new TWEEN.Tween(this.model.rotation)
            .to({ x: this.model.rotation.x + Math.PI / 2, y:this.model.rotation.y + Math.PI / 2, z: 0 + this.model.rotation.z }, 1000) // Rotate 
            .easing(TWEEN.Easing.Quadratic.InOut);

            tweenDown = new TWEEN.Tween(this.model.rotation)
            .to({ x: this.model.rotation.x - Math.PI / 2, y: this.model.rotation.y - Math.PI / 2, z: this.model.rotation.z + 0 }, 1000) // Rotate
            .easing(TWEEN.Easing.Quadratic.InOut);
        } else {
            tweenUp = new TWEEN.Tween(this.model.rotation)
            .to({ x: this.model.rotation.x + 0, y: this.model.rotation.y + Math.PI / 2, z: this.model.rotation.z + Math.PI / 2 }, 1000) // Rotate 
            .easing(TWEEN.Easing.Quadratic.InOut);

            tweenDown = new TWEEN.Tween(this.model.rotation)
            .to({ x: this.model.rotation.x, y: this.model.rotation.y - Math.PI / 2, z: this.model.rotation.z - Math.PI / 2 }, 1000) // Rotate
            .easing(TWEEN.Easing.Quadratic.InOut);
        }
        tweenY = new TWEEN.Tween(this.model.rotation)
        .to({ x: this.model.rotation.x, y: this.model.rotation.y + Math.PI * 2, z: this.model.rotation.z }, 2000) // Rotate fully around Y-axis
        .easing(TWEEN.Easing.Quadratic.InOut)

        lookBack = new TWEEN.Tween(this.model.rotation)
        .to({x: this.model.rotation.x, y: this.model.rotation.y + Math.PI, z: this.model.rotation.z},1000 )
        .easing(TWEEN.Easing.Quadratic.InOut)

        tweenUp.chain(tweenDown);
        tweenDown.chain(tweenY);
        tweenY.chain(lookBack)

        tweenUp.start()
        lookBack.onComplete(() =>{
            this.animateCollisionStarted = false
        })
    }
}