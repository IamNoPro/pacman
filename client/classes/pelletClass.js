import * as THREE from 'three'

export class Pellet{
    constructor(i,position, show){
        this.position = position
        this.id = i
        this.show = show
        this.radius = 0.8
        this.points = 10
        this.color = 'white'
        this.geometry = new THREE.SphereGeometry(this.radius, 32,32)
        this.material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.2,
            metalness: 0,
            flatShading: true
        })
        this.mesh = new THREE.Mesh(this.geometry, this.material)
    }

}