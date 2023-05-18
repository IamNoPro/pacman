import * as THREE from  'three'

export class Pacman{
    constructor(model, mixer, animationsMap, currentAction){
        this.model = model
        this.mixer = mixer
        this.animationsMap = animationsMap
        this.currentAction = currentAction
        this.rotateQuaternion = new THREE.Quaternion()
        this.score = 0
        
    }

    updatePosition(backendPacman){
        if(backendPacman){
            this.currentAction ='eat once.011'
            this.model.position.x = backendPacman.position.x
            this.model.position.z = backendPacman.position.z
            this.rotateQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), backendPacman.angle)
            this.model.quaternion.copy(this.rotateQuaternion) 
            this.score = backendPacman.score
        }
    }
    updateDelta(delta){
        this.animationsMap.get(this.currentAction)?.play()
        this.mixer.update(delta)
    }
}