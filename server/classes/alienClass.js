const minX = -50
const minZ = -50
const maxX = 50
const maxZ = 50



export class Alien{
    constructor(position){
        this.position = position
        this.needsUpdate = false
    }


    getRandomPosition(){
        this.position.x = Math.random() * (maxX - minX + 1) + minX
        this.position.z = Math.random() * (maxZ - minZ + 1) + minZ
    }
}