import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export class Wall {
    constructor(randomHeight = 2){
        this.color = 'violet'
        this.width = 4
        this.height = randomHeight
        this.depth = 4
        this.geometry = new RoundedBoxGeometry(this.width,this.height,this.depth,10,1)
        this.material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.1,
        })
        this.mesh = new THREE.Mesh(this.geometry,this.material)
    }
}