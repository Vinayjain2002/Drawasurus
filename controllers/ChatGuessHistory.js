const ChatGuessHistory= require('../models/chatGuessing.js');

exports.createMessage= async(req,res)=>{
    try{
        const {gameId, userId, message, isGuess= false, isCorrect= false}= req.body;

        if(!gameId || !userId || !message){
            return res.status(400).json({"message": "Required Creds are not provided"});
        }
        if(isGuess && typeof isCorrect !== 'boolean'){
            return res.status(400).json({"message": "Is Correct need to be provided"});
        }
        const chatEtntry= new ChatGuessHistory({
            gameId,
            userId,
            message,
            isGuess,    
            isCorrect
        });

        await chatEtntry.save();
        return res.status(201).json({"message": "Message Saved Successfully"});
    }
    catch(err){
        return res.status(500).json({"message": "Internal Server Error"});
    }
}

exports.getChatHistoryByGame= async(req,res)=>{
    try{
        const {gameId}= req.params;
        const history= await ChatGuessHistory.find({gameId}).sort({timestamp: 1}).populate('userId', 'username');

        return res.status(200).json({"message": "Chatting History Retrived Successfully", history: history});
    }   
    catch(err){
        return res.status(500).json({"message": "Internal Server Error"});
    }
}


exports.getGuessesByGame= async(req,res)=>{
    try{
        const{gameId}= req.params;
        const guesses = await ChatGuessHistory.find({gameId, isGuess: true}).sort({timestamp: 1});

        return res.status(200).json({"message": "Chat Guess History Fetched", guesses: guesses});
    }
    catch(err){ 
        return res.status(500).json({"message": "Internal Server Error"});
    }
}


exports.clearChatHistory= async(req,res)=>{
    try{
        const {gameId}= req.params;

        if(!gameId){
            return res.status(400).json({"message": "Provide the GameId"});
        }
        const result= await ChatGuessHistory.deleteMany({gameId: gameId});

        return res.status(200).json({"message": "Chat History Deleted Successfully","result": "result" });
    }
    catch(err){
        return res.status(500).json({"message": "Internal Server Error"});
    }
}