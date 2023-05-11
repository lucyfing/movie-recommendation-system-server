const Redis = require('redis')
//创建客户端
const redis = Redis.createClient({
    host: '127.0.0.1',
    port: 6379
})
redis.connect()

// 缓存数据
function setRedis(key, val, timeout = 60*60){
    if(typeof val == 'object'){
        val = JSON.stringify(val)
    }
    redis.set(key, val)
    redis.expire(key,timeout)
}

// 获取缓存数据
async function getRedis(key){
    const data = await redis.get(key)
    return JSON.parse(data)
    // return new Promise((resolve, reject)=>{
    //     redis.get(key,(err,val)=>{
    //         if(err) {
    //             console.log(222)
    //             reject(err)
    //             return
    //         }
    //         if(val ==  null) {
    //             console.log(333)
    //             resolve(null)
    //             return
    //         }
    //         try {
    //             console.log(444)
    //             resolve(
    //                 JSON.parse(val)
    //             )
    //         } catch (error) {
    //             resolve(val)
    //         }
    //     })
    // })
}


module.exports = {
    getRedis,
    setRedis
}
