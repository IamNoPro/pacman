import {collisionCheck} from '../utils/collisionCheck.js'


export class Ghost {
    constructor(position,velocity){
        this.position = position
        this.velocity = velocity
        this.scared = true
        this.speed = 0.3
        this.radius = 3
        this.direction = 'down'
        this.maxSteps = 10
        this.stepsTaken = 0
        this.threshold = Math.floor(Math.random() * 314) + 159
        this.threshold2 = Math.floor(Math.random() * 314) + 159
        this.angle = 0

    }

    updateMovement(walls){
        const collisions = []
        walls.forEach((wall) => {
            if(!collisions.includes('right')
             && collisionCheck({
                 player: {
                     ...this,
                     velocity: {
                         x: this.speed,
                         z: 0
                     }
                 },
                 wall
            })){
                 collisions.push('right')
            }
            if(!collisions.includes('left')
             && collisionCheck({
                 player: {
                     ...this,
                     velocity: {
                         x: -this.speed,
                         z: 0
                     }
                 },
                 wall
            })){
                 collisions.push('left')
            }
            if(!collisions.includes('up')
             && collisionCheck({
                 player: {
                     ...this,
                     velocity: {
                         x: 0,
                         z: -this.speed
                     }
                 },
                 wall
            })){
                 collisions.push('up')
            }
            if(!collisions.includes('down')
             && collisionCheck({
                 player: {
                     ...this,
                     velocity: {
                         x: 0,
                         z: this.speed
                     }
                 },
                 wall
            })){
                 collisions.push('down')
            }
        })
        let pathways = [];
        let oppositeDirection;
        if (this.direction === 'down') oppositeDirection = 'up';
        else if (this.direction === 'up') oppositeDirection = 'down';
        else if (this.direction === 'right') oppositeDirection = 'left';
        else if (this.direction === 'left') oppositeDirection = 'right';
        
        const initial_pathways = ['right', 'left', 'up', 'down']
        pathways = initial_pathways.filter((collision)=> {
            return !collisions.includes(collision)
        })
        pathways = pathways.filter(direction => direction !== oppositeDirection)
        if(this.stepsTaken >= this.maxSteps || !pathways.includes(this.direction)){
            this.direction = pathways[Math.floor(Math.random() * pathways.length)]
            this.stepsTaken = 0
            this.maxSteps = Math.floor(Math.random() * 30) + 31
        }

        if((this.direction == 'down' || this.direction =="up") && this.threshold < 0){
            if(this.position.x < -20){
                
                if(pathways.includes('right')){
                    
                    this.direction = 'right'
                    this.threshold = Math.floor(Math.random() * 314) +159
                }
            }else if(this.position.x > 20){
                
                if(pathways.includes('left')){
                    
                    this.direction = 'left'
                    this.threshold = Math.floor(Math.random() * 314) + 159
                }
            }
        }
        if(this.direction =='right' || this.direction =='left' && this.threshold2 < 0){
            
            if(((this.position.z > -25 && this.position.z < -18) || (this.position.z < 25 && this.position.z >20)) && this.position.x < 22 && this.position.x > -22){
                if((Math.floor(Math.random() * 3) + 1) >= 2){
                    if(pathways.includes('down')){
                        
                        this.direction = 'down'
                        this.threshold2 = Math.floor(Math.random() * 314) +159
                    }
                } else{
                    if(pathways.includes('up')){
                        
                        this.direction = 'up'
                        this.threshold2 = Math.floor(Math.random() * 314) +159
                    }
                }
                
            }
        }
        
        this.threshold --
        this.threshold2 --


        switch (this.direction){
            case 'down':
                this.velocity.z = this.speed
                this.velocity.x = 0
                this.angle = 0
                this.direction = 'down'
                break
            case 'up':
                this.velocity.z = -this.speed
                this.velocity.x = 0
                this.angle =  Math.PI
                this.direction = 'up'
                break
            case 'right':
                this.velocity.z = 0
                this.velocity.x = this.speed
                this.angle = Math.PI/2
                this.direction = 'right'
                break
            case 'left':
                this.velocity.z = 0
                this.velocity.x = -this.speed
                this.angle =  -Math.PI/2
                this.direction = 'left'
                break
        }
        this.stepsTaken ++
        this.position.x += this.velocity.x
        this.position.z += this.velocity.z
    }

}