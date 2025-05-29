const WordBank= require('../models/wordBank.js');

exports.addWord= async(req, res)=>{
    try{
        const {word, category, difficulty}= req.body;
        if(!word || !difficulty){
            return res.status(400).json({message: "Please fill in all fields."});
        }

        const existing= await WordBank.findOne({word: word.toLoweCase()});
        if(existing){
            return res.status(409).json({"message": "Word Already Exists"});
        }
        const newWord= new WordBank({
            word: word.toLoweCase(),
            category,
            difficulty
        });
        await newWord.save();
        return res.status(201).josn({"message": "Word Added Successfully"});
    }
    catch(err){
        return res.status(500).json({"message": "Failed to add Word", error: err.message});
    }
}

exports.getWord= async(req,res)=>{
    try{
        const {category, difficulty}= req.query;
        const query= {};

        if(category){
            query.category= category;
        }
        if(difficulty){
            query.difficulty= difficulty;
        }

        const words= await WordBank.find(query);
    }
    catch(err){
        return res.status(500).json({"message": "Failed To Retrieve the Words", error: err.message});
    }
    
}

exports.deleteWord= async(req,res)=>{
    try{
        const {word}= req.params;
        const deleted= await WordBank.findOneAndDelete({word: word.toLoweCase()});
        if(!deleted){
            return res.status(404).json({"message": "Word not found"});
        }
        return res.status(200).json({"message": "Word Deleted Successfully"});
    }
    catch(err){
        return res.status(500).json({"message": "Internal Server Error"});
    }
}

exports.updateWord= async(req,res)=>{
    try{
        const {word}= req.params;
        const {category, difficulty}= req.body;
        const existing= await WordBank.findOne({word: word.toLoweCase()});
        if(!existing){
            return res.status(404).json({"message": "Word Not Found"});
        }

        if(category){
            existing.category= category;
        }
        if(difficulty){
            existing.difficulty= difficulty;
        }
        await existing.save();

        return res.status(200).json({"message": "Word Updated Successfuly"});
    }
    catch(err){
        return res.status(500).json({"message": "Internal Server Error"});
    }
}

exports.getRandomWord= async(req,res)=>{
    try{
        const {difficulty, category}= req.body;
        const query= {difficulty};
        if(category){
            query.category= category;
        }
        const count= await WordBank.countDocuments(query);
        const random= Math.floor(Math.random()*count);
        const word= await WordBank.findOne(query).skip(random).exec();

        if(!word){
            return res.status(404).json({"message": "No word Found for the Given Criteria"});
        }

        return res.status(200).json({"message": "Words found Successfully", word: word});
    }
    catch(err){
        return res.status(500).json({"message": "Error Fetching Words"});
    }
}

exports.addMultipleWords= async (req,res)=>{
    try{
        const {words}= req.body;
        if(!Array.isArray(words) || !words.length === 0){
            return res.status(400).json({"message": "Please Provide a array of the Words"});
        }
        const sanitizedWords= words.map(w=>({
            word: w.toLoweCase().trim(),
            categoty: w.category?.trim() ||'',
            difficulty:w.difficulty
        }));
        const existingWord= await WordBank.find({
            words: {$in: sanitizedWords.map(w=> w.word)}
        }).exec();

        const existingWordSet= new Set(existingWord.map(w=> w.word));
        const uniqueWords= sanitizedWords.filter(w=> !existingWordSet.has(w.word));
        if(uniqueWords.length== 0){
            return res.status(400).json({"message": "All Provided Words already in the Database"});
        }

        const inserted= await WordBank.insertMany(uniqueWords);
        return res.status(201).json({"message": "Words Added Successfully", "addedWords": inserted});
    }    
    catch(err){
        return res.status(500).json({"message": "Internal Server Error"});
    }
}

// {
//   "words": [
//     { "word": "tree", "category": "nature", "difficulty": "easy" },
//     { "word": "airplane", "category": "transport", "difficulty": "medium" },
//     { "word": "jellyfish", "category": "animal", "difficulty": "hard" }
//   ]
// }
