import express from  'express'
import http from  'http'
import { Server } from  'socket.io'
import {createServer} from 'vite'
import { BOARD, ROWS, COLS, TICK_RATE} from './constants.js'
import { Wall } from './classes/wallClass.js'
import {Ghost} from './classes/ghostClass.js'
import {Pacman} from './classes/pacmanClass.js'
import {Pellet} from './classes/pelletClass.js'
import {makeGameCode} from  './utils/makeGameCode.js'

//STATE CONTROLL
const walls = []
let ghost;
const socketRooms = {}
const players = {}
const pellets = []


//-----------------------------------------------------------//


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
function createPellets(){
    let counter = 0
    for(let row = 0; row < ROWS ; row++){
        for(let col = 0; col < COLS ; col++ ){
            if(BOARD[row][col] === 1){
                const pellet = new Pellet(counter)
                counter++
                if(pellet){
                    pellet.position.x = (col * 2 - COLS) * 2 + 4
                    pellet.position.z = (row * 2 - ROWS) * 2 + 4
                    pellet.position.y = 2.5
                    pellets.push(pellet)
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
    createPellets()
    ghost = new Ghost({
        x: 8,
        z: 0,
        y: 1,
    },{
        x: 0,
        z: 0.2,
    })

    //-------------------------------------------//
    
    
    io.on('connection', (socket) => {
        
        console.log(`user connected ${socket.id}`)
        //-----------DELETE OR GOOD USE OF IT----------------//
        socket.on('newGame', handleNewGame)
        socket.on('joinGame', handleJoinGame)
        socket.on('keyPressed', handleKeyPressed)

        function handleKeyPressed(lastkey){
            const playerPacman = players[socket.id]?.pacman
            playerPacman.lastkey = lastkey
        }


        function handleJoinGame(roomName){
            
            
            const room = io.of("/").adapter.rooms.get(roomName)
            console.log("room",room)
            if(room === undefined){
                socket.emit('unknownCode')
                return
            } 
            else if(room.size === 1 && !room.has(socket.id)){
                socketRooms[socket.id] = roomName;
                socket.join(roomName)
                players[socket.id] = {
                pacman: new Pacman({
                    x:32,
                    z:-24,
                    y:4
                },{
                    x:0,
                    y:0,
                    z:0,
                }),
                playerNumber: 2
            }
            }
            else if(room.size === 2 && !room.has(socket.id)){
                socketRooms[socket.id] = roomName;
                socket.join(roomName)
                players[socket.id] = {
                pacman: new Pacman({
                    x:-32,
                    z:24,
                    y:4
                },{
                    x:0,
                    y:0,
                    z:0,
                }),
                playerNumber: 3
            }
            }
            else if(room.size === 3 && !room.has(socket.id)){
                socketRooms[socket.id] = roomName;
                socket.join(roomName)
                players[socket.id] = {
                pacman: new Pacman({
                    x:32,
                    z:24,
                    y:4
                },{
                    x:0,
                    y:0,
                    z:0,
                }),
                playerNumber: 4
            }}
            else if(room.size > 3){
                socket.emit('tooManyPlayers')
                return
            }
            if(room.size > 3){
                io.sockets.in(roomName).emit("startGame")
                io.sockets.in(roomName).emit('renderBoard', walls)
                io.sockets.in(roomName).emit('createPellets', pellets)
                io.sockets.in(roomName).emit('initGhostPosition', ghost.position)
                io.sockets.in(roomName).emit('initPacmanPosition', players)
                tick(roomName)
            }
           console.log("room", room)
           console.log("players", players)
        }


        function handleNewGame(){
            let roomName = makeGameCode(5)
            socketRooms[socket.id] = roomName
            socket.emit('gameCode', roomName)
            socket.join(roomName)
            players[socket.id] = {
                pacman: new Pacman({
                    x:-32,
                    z:-24,
                    y:4
                },{
                    x:0,
                    y:0,
                    z:0,
                }),
                playerNumber: 1
            }
            

        }
     
    })





    
    server.listen(3000, ()=>{
        console.log('server listening on port 3000')
    })
    function tick(roomName){
        const intervalId = setInterval(() =>{
            //handleGhostMovement
            if(ghost instanceof Ghost){
                ghost.updateMovement(walls)
                io.sockets.in(roomName).emit('ghostUpdatePosition', {x: ghost.position.x, z: ghost.position.z, angle: ghost.angle})
            } 
            //HandlePlayerMovement && Pellets
            const pelletsToRemove = []
            for(const key in players){
                const playerPacman = players[key].pacman

                //handle Pellets
                for(let i = 0; i < pellets.length; i++){
                    const pellet = pellets[i]
                    if(pellet.show && Math.hypot(
                        pellet.position.x - playerPacman.position.x, 
                        pellet.position.z - playerPacman.position.z) < playerPacman.radius
                    ){
                        playerPacman.score += pellet.points
                        pellet.show = false
                        pelletsToRemove.push(pellet)
                    }
                }
                //handlePlayerMovement
                playerPacman.updateMovement(walls)

                //handle Ghost and Player Collision
                if(Math.hypot(ghost.position.x - playerPacman.position.x,ghost.position.z - playerPacman.position.z) < ghost.radius + playerPacman.radius){
                    if(ghost.scared){
                        io.sockets.in(roomName).emit('ghostScared', ghost.position)
                    }
                }

            }
            io.sockets.in(roomName).emit('pacmanUpdatePosition', players)
            io.sockets.in(roomName).emit('pelletsToRemove', pelletsToRemove)
            
            
           

            
        }, 1000/TICK_RATE)
        
    }   
}

createMainServer()





