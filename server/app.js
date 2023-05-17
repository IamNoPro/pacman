import express from  'express'
import http from  'http'
import { Server } from  'socket.io'
import {createServer} from 'vite'
import { BOARD, ROWS, COLS, TICK_RATE} from './constants.js'
import { Wall } from './classes/wallClass.js'
import {Ghost} from './classes/ghostClass.js'

const walls = []
const ghost = new Ghost({
    x: 8,
    z: 0,
    y: 1,
},{
    x: 0,
    y: 0.2,
})

function renderBoard(){
    for(let row = 0; row < ROWS; row++){
        for(let col = 0; col < COLS; col++){
            const cell = BOARD[row][col]
            if(cell === 0){
                const randomHeight = Math.random() * 5 + Math.random() * 5 + 1
                const wall =  new Wall(randomHeight)
                // board[row][col] = wall
                if(wall){
                    wall.position.x = (col * 2 - COLS) * 2 + 2
                    wall.position.z = (row * 2 - ROWS) * 2 + 2
                    wall.position.y = randomHeight/2
                    walls.push(wall)
                }  
            }
        }
    }
}



async function createMainServer(){

    const app = express();
    const server = http.createServer(app)
    const io = new Server(server)
    const vite = await createServer({
        server:{
            middlewareMode: true,
            // hmr:{
            //     server
            // }
        }
    })
    app.use(vite.middlewares)
    // app.use(express.static('dist'))
    renderBoard()
    
    
    io.on('connection', (socket) => {
        console.log(`user connected ${socket.id}`)
        io.emit('renderBoard', walls)
        socket.emit('initGhostPosition', ghost.position)
        // socket.on('needGhostData', () =>{
        //     ghost.updateMovement(walls)
        //     socket.emit('ghostData',{x: ghost.position.x, z: ghost.position.y, angle: ghost.angle})
        // })
        

    })
    server.listen(3000, ()=>{
        console.log('server listening on port 3000')
    })
    function tick(){
        if(ghost instanceof Ghost){
            ghost.updateMovement(walls)
            io.emit('ghostUpdatePosition', {x: ghost.position.x, z: ghost.position.z, angle: ghost.angle})
        }
        
    }

    setInterval(() =>{
        tick()
        
    }, 1000/TICK_RATE);


   
}

createMainServer()





