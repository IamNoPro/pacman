import express from  'express'
import http from  'http'
import { Server } from  'socket.io'
import {createServer} from 'vite'
import { BOARD, ROWS, COLS, TICK_RATE} from './constants.js'
import { Wall } from './classes/wallClass.js'
import {Ghost} from './classes/ghostClass.js'
import {Pacman} from './classes/pacmanClass.js'
import {makeGameCode} from  './utils/makeGameCode.js'

//STATE CONTROLL
const walls = []
let ghost;
const socketRooms = {}
const players = {}


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
            console.log(roomName)
            const room = io.of("/").adapter.rooms.get(roomName)

            
            if(room === undefined){
                socket.emit('unknownCode')
                return
            } else if(room.size > 1){
                socket.emit('tooManyPlayers')
                return
            }

            socketRooms[socket.id] = roomName;
            socket.join(roomName)
            players[socket.id] = {
                pacman: new Pacman({
                    x:31,
                    z:24,
                    y:4
                },{
                    x:0,
                    y:0,
                    z:0,
                },)}
            io.sockets.in(roomName).emit("startGame")
            io.sockets.in(roomName).emit('renderBoard', walls)
            io.sockets.in(roomName).emit('initGhostPosition', ghost.position)
            io.sockets.in(roomName).emit('initPacmanPosition', players)

            tick(roomName)
        }


        function handleNewGame(){
            let roomName = makeGameCode(5)
            socketRooms[socket.id] = roomName
            socket.emit('gameCode', roomName)
            socket.join(roomName)
            players[socket.id] = {
                pacman: new Pacman({
                    x:-31,
                    z:-24,
                    y:4
                },{
                    x:0,
                    y:0,
                    z:0,
                })
            }
            

        }
     
    })





    
    server.listen(3000, ()=>{
        console.log('server listening on port 3000')
    })
    function tick(roomName){
        const intervalId = setInterval(() =>{
            if(ghost instanceof Ghost){
                ghost.updateMovement(walls)
                io.sockets.in(roomName).emit('ghostUpdatePosition', {x: ghost.position.x, z: ghost.position.z, angle: ghost.angle})
            } 
            for(const key in players){
                const playerPacman = players[key].pacman
                playerPacman.updateMovement(walls)
            }
            io.sockets.in(roomName).emit('pacmanUpdatePosition', players)
           

            
        }, 1000/TICK_RATE)
        
    }   
}

createMainServer()




