import { io } from 'socket.io-client';

const socket = io('ws://localhost:8111/updates');

socket.on('session', data => {
	console.log('Session:', data);
});

socket.on('character.updated', data => {
	console.log('Character updated:', data);
});
