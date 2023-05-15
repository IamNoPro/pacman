import express from  'express'
import http from  'http'
import { Server } from  'socket.io'
import {createServer} from 'vite'


async function createMainServer(){

    const app = express();
    const server = http.createServer(app)
    const io = new Server(server)

    // const vite = await createServer({
    //     server:{
    //         middlewareMode: true,
    //         // hmr:{
    //         //     server
    //         // }
    //     }
    // })
    
    app.use(express.static('dist'))

    io.on('connection', (socket) => {
        console.log(`user connected ${socket.id}`)
    })
    server.listen(3000, ()=>{
        console.log('server listening on port 3000')
    })
}

createMainServer()





