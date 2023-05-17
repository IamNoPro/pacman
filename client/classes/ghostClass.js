import * as THREE from  'three'

export class Ghost{
    constructor(model, mixer, animationsMap, currentAction){
        this.model = model
        this.mixer = mixer
        this.animationsMap = animationsMap
        this.currentAction = currentAction
        this.rotateQuaternion = new THREE.Quaternion()
        this.scared = false 

    }
    updatePosition(backendGhost){
        if(backendGhost){
            this.model.position.x = backendGhost.x
            this.model.position.z = backendGhost.z
            this.rotateQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), backendGhost.angle)
            this.model.quaternion.copy(this.rotateQuaternion)
            
            
            
        }
        
    }
    updateDelta(delta){
        this.animationsMap.get(this.currentAction)?.play()
        this.mixer.update(delta)
    }
}