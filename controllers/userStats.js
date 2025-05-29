const UserOverallStats= require('../models/leaderBoard.js');
const User= require('../models/users.js');

exports.createUserStats= async (userId, username)=>{
    try{
        const exists= await UserOverallStats.findOne({userId: userId});
        if(!exists){
            await UserOverallStats.create({
                userId: userId,
                username: username
            });
        }
    }
    catch(err){
        console.error('Error while creating user Stats', err.message);
    }
}

exports.getStatsByUserId= async(req,res)=>{
    try{
        const {userId}= req.params;
        const stats= await UserOverallStats.findOne({userId: userId});

        if(!stats){
            return res.status(404).json({"message": 'Stats not found for this one user'});
        }
        return res.status(200).json({"message": "User Stats found Successfully", stats: stats});
    }
    catch(err){
        return res.status(500).json({"message": "Error while finding user Stats"});
    }
}

exports.updateStatsAfterGame= async(req,res)=>{
    try{
        const {userId}= req.params;
        const {score, won}= req.body;

        const stats= await UserOverallStats.findOne({userId: userId});
        if(!stats){
            return res.status(404).json({"message": "User Stats not found"});
        }
        stats.totalScore+= score;
        stats.gamesPlayed+= 1;
        if(won){
            stats.gamesWon+=1;
        }

        stats.averageScore= stats.totalScore/stats.gamesPlayed;
        stats.lastPlayedAt= new Date();

        await stats.save();
    }
    catch(err){
        return res.status(500).json({"message": "Failed to update Stats", error: err.message});
    }
}
exports.getLeaderboard = async (req, res) => {
    try {
        const pageSize = 10;
        const pageNo = parseInt(req.params.pageNo, 10) || 1;
        const skipAmount = (pageNo - 1) * pageSize;
        const topPlayers = await UserOverallStats.find({})
            .sort({
                totalScore: -1
            }) 
            .skip(skipAmount) // Skip documents based on page number
            .limit(pageSize); // Limit to the defined page size

        const totalPlayers = await UserOverallStats.countDocuments();
        const totalPages = Math.ceil(totalPlayers / pageSize);
        return res.status(200).json({
            success: true,
            message: 'Leaderboard fetched successfully.',
            leaderboard: topPlayers,
            pagination: {
                currentPage: pageNo,
                pageSize: pageSize,
                totalPlayers: totalPlayers,
                totalPages: totalPages,
                hasNextPage: pageNo < totalPages,
                hasPreviousPage: pageNo > 1,
            },
        });

    } catch (err) {
        console.error("Error fetching leaderboard:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch leaderboard due to an internal server error.",
            error: err.message, 
        });
    }
};

exports.recalculateRanks= async(req,res)=>{
    try{
        const allStats= await UserOverallStats.find({}).sort({totalScore: -1});

        for(let i=0;i< allStats.length; i++){
            allStats[i].rank=i+1;
            await allStats[i].save();
        }
        return res.status(200).json({"message": "Ranks Calculated Successfully"});
    }
    catch(err){

    }
}