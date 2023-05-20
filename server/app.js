import express from  'express'
import http from  'http'
import { Server } from  'socket.io'
import {createServer} from 'vite'
import { BOARD, ROWS, COLS, TICK_RATE} from './utils/constants.js'
import { Wall } from './classes/wallClass.js'
import {Ghost} from './classes/ghostClass.js'
import {Pacman} from './classes/pacmanClass.js'
import {Pellet} from './classes/pelletClass.js'
import {Alien} from './classes/alienClass.js'
import {makeGameCode} from  './utils/makeGameCode.js'

//STATE CONTROLL
const walls = []
let ghost;
let alien;
let stopEverything = false
const socketRooms = {}
const players = {}
const pellets = []


//-----------------------------------------------------------//

//put renderBoard and CreatePellets into utils folder
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
    alien = new Alien({
        x: 0,
        z: 0,
        y: 30
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
                io.sockets.in(roomName).emit('initAlienPosition', alien.position)
                tick(roomName)
                tickAlien(roomName)
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
    function tickAlien(roomName){
        const intervalId = setInterval(() =>{
            if(stopEverything){
                return
            }
            if(alien instanceof Alien){
                
                alien.getRandomPosition()
                io.sockets.in(roomName).emit('alienUpdatePosition', alien.position)
                    
                
                
                
            }
        },5000)
    }
    function tick(roomName){
        const intervalId = setInterval(() =>{
            if(stopEverything){
                return
            }
            //handleGhostMovement
            if(ghost instanceof Ghost){
                if(!ghost.stop){
                    ghost.updateMovement(walls)
                }
                io.sockets.in(roomName).emit('ghostUpdatePosition', {x: ghost.position.x, z: ghost.position.z, angle: ghost.angle})
            } 
        
        
            //HandlePlayerMovement && Pellets
            const pelletsToRemove = []
            for(const key in players){
                const playerPacman = players[key].pacman

                //handle Pellets
                if(!playerPacman.isGhost){
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
                }

                //handle Ghost and Player Collision
                if(!playerPacman.isGhost){
                    if(Math.hypot(ghost.position.x - playerPacman.position.x,ghost.position.z - playerPacman.position.z) < ghost.radius + playerPacman.radius){
                        if(ghost.scared){
                            ghost.position.x = 0
                            ghost.position.z = 0
                            ghost.stop = true
                            setTimeout(() => {
                                ghost.stop = false
                            }, 2000)
                        } else {
                            stopEverything = true
                            
                            
                            io.sockets.in(roomName).emit('pacmanDied',key)
                            setTimeout(() =>{
                                playerPacman.position.x = 0
                                playerPacman.position.z = 0
                                alien.position.x = 0
                                alien.position.z = 0
                                playerPacman.isGhost = true
                                stopEverything = false
                            },20000)
                        }
                    }
                }
                
                //handlePlayerMovement
                if(!playerPacman.collisionWithPacman){
                    playerPacman.updateMovement(walls)
                }
            }
            

            //Handle Pacman to Pacman Collision
            for(const player1key in players){
                const player = players[player1key].pacman
                if(player.collisionWithPacman){
                    continue
                }
                if(player.isGhost){
                    continue
                }
                for(const player2key in players){
                    if(player2key !== player1key ){
                        const player2 = players[player2key].pacman
                        if(Math.hypot(player.position.x - player2.position.x,player.position.z - player2.position.z) < (player.radius + player2.radius)){
                            if(player2.isGhost){
                                stopEverything = true
                                io.sockets.in(roomName).emit('pacmanDied',player1key)
                                setTimeout(() =>{
                                    player.position.x = 0
                                    player.position.z = 0
                                    alien.position.x = 0
                                    alien.position.z = 0
                                    player.isGhost = true
                                    stopEverything = false
                                },20000)
                            } else {    
                                player.collisionWithPacman = true
                                player2.collisionWithPacman = true
                                console.log('whyyy')
                                io.sockets.in(roomName).emit('pacmanToPacmanCollision', [player1key,player2key])
                                player.updateLastKey()
                                player2.updateLastKey()
                                setTimeout(() => {
                                    player.collisionWithPacman = false
                                    player2.collisionWithPacman = false
                                },5000)
                            }
                        }
                    }
                }
            }
            
            
            io.sockets.in(roomName).emit('pacmanUpdatePosition', players)
            io.sockets.in(roomName).emit('pelletsToRemove', pelletsToRemove)
            
            
           

            
        }, 1000/TICK_RATE)
        
    }   
}

createMainServer()





