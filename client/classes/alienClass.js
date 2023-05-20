import * as THREE from  'three'
import * as TWEEN from '@tweenjs/tween.js'

export class Alien{
    constructor(model, mixer, animationsMap, currentAction){
        this.model = model
        this.mixer = mixer
        this.animationsMap = animationsMap
        this.currentAction = currentAction
        this.coneGeometry = new THREE.ConeGeometry(6,30,32)
        this.coneMaterial = new THREE.MeshBasicMaterial({
            color: 'white',
            opacity: 0.4,
            transparent: true
        })
        this.coneMesh = new THREE.Mesh(this.coneGeometry,this.coneMaterial)

    }
    updateDelta(delta){
        this.animationsMap.get(this.currentAction)?.play()
        this.mixer.update(delta)
    }
    updatePosition(destination){
        console.log(destination)
        const tweenGo = new TWEEN.Tween(this.model.position)
        .to({x: destination.x, y: destination.y, z: destination.z}, 4000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        tweenGo.start()
    }
    getPacman(pacman,scene){
        function callBack(coneMesh, model, pacmanGhost){
            coneMesh.visible = false
            const goBack = new TWEEN.Tween(model.position)
            .to({x:0 ,y: model.position.y,z:0 }, 3000)
            .easing(TWEEN.Easing.Quadratic.InOut)

            //makeGhostAppear
            const targetScale = new THREE.Vector3(2.5,2.5,2.5)
            let tweenPosition = new TWEEN.Tween(pacmanGhost.position)
            .to({x: pacmanGhost.position.x, y: 1, z: pacmanGhost.position.z}, 3000)
            .easing(TWEEN.Easing.Quadratic.InOut);
            let tweenScale = new TWEEN.Tween(pacmanGhost.scale)
            .to(targetScale,3000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            goBack.start()
            goBack.onComplete(() => {
                coneMesh.position.x = model.position.x
                coneMesh.position.z = model.position.z
                coneMesh.position.y = model.position.y / 2 
                coneMesh.visible = true 
                console.log('ura') 
                console.log(pacman)
                pacmanGhost.visible = true

                tweenPosition.start()
                tweenScale.start()
                tweenPosition.onComplete(() =>{
                    console.log('ha')
                    coneMesh.visible = false
                })
            })
        }


        const tweenGo = new TWEEN.Tween(this.model.position)
        .to({x: pacman.model.position.x,z: pacman.model.position.z, y: this.model.position.y}, 2000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        tweenGo.start()
        tweenGo.onComplete(()=>{
            this.coneMesh.position.x = this.model.position.x
            this.coneMesh.position.z = this.model.position.z
            this.coneMesh.position.y = this.model.position.y / 2
            this.coneMesh.visible = true
            pacman.disappear(scene, (model) => {callBack(this.coneMesh,this.model, model)})
        })
        
        
    }
}