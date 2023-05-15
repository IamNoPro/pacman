import { io } from 'socket.io-client';
import Model from './modules/ghost_purpleusdz.glb'
const socket = io();

socket.on('connect', (socket) => {
  console.log('Connected to server');
});