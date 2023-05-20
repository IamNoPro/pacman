import {collisionCheck} from '../utils/collisionCheck.js'


export class Pacman {
    constructor(position,velocity){
        this.angle = 0
        this.velocity = velocity
        this.position = position
        this.radius = 3
        this.speed = 0.3
        this.score = 0
        this.lastkey =''
        this.collisionWithPacman = false
        this.isGhost = false
        this.scared = false
    }

    updateLastKey(){
        if(this.angle === 0){
            this.lastkey = 'w'
        } else if(this.angle === Math.PI){
            this.lastkey = 's'
        } else if(this.angle === Math.PI / 2){
            this.lastkey = 'a'
        } else if(this.angle === -Math.PI / 2){
            this.lastkey = 'd'
        }
    }

    updateMovement(walls){
        if(/*keys.w.pressed && */ this.lastkey === 'w'){
            for(let i = 0; i < walls.length; i++){
                const wall = walls[i]
                if(collisionCheck({
                    player: {
                        ...this,
                        velocity: {
                            x: 0,
                            z: -this.speed
                        }
                    }, wall
                })){
                    this.velocity.z = 0
                    break
                } else {
                    this.velocity.z = -this.speed
                    
                }
            }
        } else if(/*keys.a.pressed && */ this.lastkey === 'a'){
            
            for(let i = 0; i < walls.length; i++){
                const wall = walls[i]
                if(collisionCheck({
                    player: {
                        ...this,
                        velocity: {
                            x: -this.speed,
                            z: 0
                        }
                    }, wall
                })){
                    this.velocity.x = 0
                    break
                } else {
                    this.velocity.x = -this.speed
                    
                }
            }
        } else if(/*keys.s.pressed && */ this.lastkey === 's'){
            
            for(let i = 0; i < walls.length; i++){
                const wall = walls[i]
                if(collisionCheck({
                    player: {
                        ...this,
                        velocity: {
                            x: 0,
                            z: this.speed
                        }
                    }, wall
                })){
                    this.velocity.z = 0
                    break
                } else {
                    this.velocity.z = this.speed
                    
                }
            }
        } else if(/*keys.d.pressed && */ this.lastkey === 'd'){
            
            for(let i = 0; i < walls.length; i++){
                const wall = walls[i]
                if(collisionCheck({
                    player: {
                        ...this,
                        velocity: {
                            x: this.speed,
                            z: 0
                        }
                    }, wall
                })){
                    this.velocity.x = 0
                    break
                } else {
                    this.velocity.x = this.speed
                    
                }
            }
        }
        walls.forEach((wall) => {
            if(collisionCheck({player: {...this},wall})){
                this.velocity.x = 0
                this.velocity.z = 0
            }
        })
        if(this.velocity.x > 0) this.angle = Math.PI/2
        else if(this.velocity.x < 0) this.angle = -Math.PI/2
        else if(this.velocity.z < 0 ) this.angle =  Math.PI
        else if(this.velocity.z > 0) this.angle = 0
        this.position.x += this.velocity.x
        this.position.z += this.velocity.z
    }
}