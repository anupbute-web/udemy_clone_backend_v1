const Redis = require('ioredis');
const io_redis = new Redis({
    host : '127.0.0.1',
    port : 6379
})

io_redis.on('connect',()=>{
    console.log("redis connected")
});

io_redis.on('error',(err)=>{
    console.log('Redis error ======>',err)
});

module.exports={io_redis};