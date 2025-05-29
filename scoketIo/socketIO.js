// socket.js
const words = ['apple', 'banana', 'car', 'elephant', 'guitar', 'house']; // You can expand this or pull from DB
const rooms = {};// In-memory room storage (consider Redis or DB for production)

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('A user connected', socket.id);
        
        socket.on('createRoom', ({username, roomId})=>{
            socket.join(roomId);

            rooms[roomId]= {
                players: [{id: socket.id, username, score: 0}],
                drawIndex: 0,
                currentWord: null,
                roundStarted: false
            };

            console.log(`Room Created Successfully: ${roomId}`);
            io.to(roomId).emit('roomUpdate', rooms[roomId]);
        });


        socket.on('startGame', (roomId)=>{
            const room= rooms[roomId];
            if(!room || room.roundStarted) return;

            room.roundStarted= true;
            const drawer= room.players[room.drawIndex];
            const word= words[Math.floor(Math.random()*words.length)];
            room.currentWord= word;

            io.to(drawer.id).emit('yourWord', word);
            io.to(roomId).emit('roundStarted',{
                drawerId: drawer.id,
                drawerName: drawer.username,
                wordLength: word.length
            });
        });

        socket.on('joinRoom', ({username, roomId}) => {
            const room= rooms[roomId];
            if(!room){
                return socket.emit('error', 'Room Not Found');
            }
            socket.join(roomId);
            room.players.push({id: socket.id, username, score: 0});
            console.log(`${socket.id} joined room ${roomId}`);
            io.to(roomId).emit('roomUpdate', room);

        });

        socket.on('drawingData', ({roomId, drawing}) => {
            socket.to(roomId).emit('drawingData', drawing);
        });

        socket.on('guessWord', ({roomId, guess, username})=>{
            const room= rooms[roomId];

            if(!room || !room.currentWord){
                return;
            }

            if(guess.toLowerCase()== room.currentWord.toLowerCase()){
                const player= room.players.find(p=> p.id== socket.id);

                if(player){
                    player.score += 10;
                }
                io.to(roomId).emit('correctGuess', {username, guess});
                io.to(roomId).emit('roomUpdate', room);

                // Move to the Next Round
                room.drawIndex= (room.drawIndex+1) % room.players.length;
                room.roundStarted= false;
                room.currentWord= null;
                setTimeout(()=>{
                    io.to(roomId).emit('nextRound');
                }, 3000);
            }
            else{
                socket.to(roomId).emit('guessFeedback', {username, guess});
            }
        });

        socket.on('endRoom', (roomId)=>{
            const room= rooms[roomId];
            if(!room){
                return;
            }

            io.to(roomId).emit('roomEnded');

            const socketsInRoom= io.sockets.adapter.rooms.get(roomId);
            if(socketsInRoom){
                for(const socketId of socketsInRoom){
                    const clientSocket= io.sockets.sockets.get(socketId);
                    if(clientSocket){
                        clientSocket.leave(roomId);
                    }
                }
            }

            delete rooms[roomId];
            console.log(`Room $[roomId] has been changed`);
        })
      

        socket.on('disconnect', () => {
            console.log('User Disconnected', socket.id);
            for(const roomId in rooms){
                const room= rooms[roomId];
                room.player= room.players.filter(p=> p.id != socket.id);

                io.to(roomId).emit('roomUpdate', room);
                if(room.players.length === 0){
                    delete rooms[roomId];
                }
            }
        });
    });
};
