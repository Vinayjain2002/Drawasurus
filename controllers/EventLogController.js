const EventLog= require("../models/Notification.js");

exports.createEvent= async(req,res)=>{
    try{
        const {gameId, eventType, userId, details}= req.body;
        if(!gameId || !eventType){
            return res.status(400).json({message: "Game ID and Event Type are required"});
        }

        const newEvent= new EventLog({
            gameId: gameId,
            eventType: eventType,
            userId: userId,
            details: details
        });

        const savedEvent= await newEvent.save();
        return res.status(201).json({"message": "Event Logged Successfullly"});
    }
    catch(err){
        return res.status(500).json({"message": "Internal Server Error"});
    }
}

exports.getEventsByGame= async(req,res)=>{
    try{
        const {gameId}= req.params;

        const events= await EventLog.find({gameId: gameId}).sort({createdAt: -1}).populate("userId", "username");

        return res.status(200).json({"message": "Event Logs Retrieved Successfully", "events": events});
    }
    catch(err){
        return res.status(500).json({"message": "Intenal Server Error"});
    }
}

exports.clearEventsByGame= async(req,res)=>{
    try{
        const {gameId} = req.params;
        const result= await EventLog.deleteMany({gameId: gameId});
        return res.status(200).json({"message": "Event Logs Deleted Successfully", "result": result});
    }
    catch(err){
        return res.status(500).json({"message": "Internal Server Error"});
    }
}