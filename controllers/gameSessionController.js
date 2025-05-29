const GameSession= require('../models/gameSession.js');
const mongoose= require('mongoose');

exports.createGameSession= async(req,res)=>{
    try{
    const { roomCode, players, currentDrawer, currentWord, maxRounds, endedAt } = req.body;
     if (!players || !Array.isArray(players) || players.length < 2) {
        return res.status(400).json({"message": "No of the players need to be greater then 2"});
    }
    const game= await GameSession.create({
        
        gameId: new mongoose.Types.ObjectId().toString(),
        roomCode: roomCode,
        players: players,
        currentDrawer: currentDrawer,
        currentWord: currentWord,
        maxRounds: maxRounds,
        createdAt: Date.now(), // Call Date.now() to get the current timestamp
        status: 'waiting'
    });

    res.status(201).json({"nessage": "Game Session Created", game});
}catch(err){
    return res.status(500).json({"message": 'Failed to create game Sessions', "error": err.message});
    }
}

exports.startGameSession= async(req,res)=>{
    try{
        const {gameId}= req.params;
        const game= await GameSession.findOneAndUpdate({gameId}, {status: 'in-progress'}, {new: true})
        if(!game){
            return res.status(404).json({"message": 'Game Not Found'});
        }
        return res.json({"message": 'Game Started', game});
    }  
    catch(err){
        return res.status(500).json({"message": "Could not start the Game", error: err.message});
    }
}

exports.endGameSession= async (req,res)=>{
    try{
        const {gameId}= req.params;
        const game= await GameSession.findOneAndUpdate({
            gameId
        }, {status: 'finished', endedAt: new Date()},
        {new: true}
    );

    if(!game){
        return res.status(404).json({"message": "Game Not Found"});
    }

    return res.status(200).json({"message": "Game ended", game});
    }
    catch(err){
        return res.status(500).json({"message": "Error ending game", error: err.message});
    }
}

exports.updateCurrentState= async (req,res)=>{
    try{
        const {gameId}= req.params;
        const {currentDrawer, currentWord, roundNumber}= req.body;

        const game= await GameSession.findById(gameId);
        if(!game){
            return res.status(404).json({"message": 'Game Not found'});
        }

        if(currentDrawer){
            game.currentDrawer= currentDrawer;
        }
        if(currentWord){
            game.currentWord= currentWord;
        }
        if(roundNumber){
            game.roundNumber= roundNumber;
        }

        await game.save();

        return res.status(200).json({"message": 'Game Session Updated', game});
    }
    catch(err){
        return res.status(500).json({"message": "Failed to update the Game Session","error": err});
    }
};

