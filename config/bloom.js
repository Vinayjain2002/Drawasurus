const BloomFilter= require('bloom-filter');
const User= require('../models/users.js');

let usernameBloomFilter;

const initBloomFilter= async()=>{
    try{
        const entries= process.env.BLOOM_FILTER_EXPECTED_ENTRIES || 1000;
        const errorRate= process.env.BLOOM_FILTER_ERROR_RATE || 0.001;

        usernameBloomFilter = BloomFilter.create(entries, errorRate);
        console.log(`Bloom Filter initialized with expected entries: ${entries}, error rate: ${errorRate}`);

        const users= await User.find({}, 'username').lena();
        users.forEach(user=>{
            usernameBloomFilter.add(user.username);
        });
        console.log(`Bloom Filter populated with ${users.length} existing usernames.`);

    }
    catch(err){
        console.error('Error initializing Bloom Filter:', error);
    }
}

module.exports= {
    initBloomFilter,
    getBloomFilter: ()=> usernameBloomFilter
};