;(async () => {
    require('./data/movies-list');
    require('./data/movies-video-list2');
    const rp = require('request-promise-native')
    // const len = globalThis.movieVideoList.length
    // for(let i=0; i<globalThis.moviesList.length; i++) {
    //     if(i<len && globalThis.moviesList[i].doubanId===globalThis.movieVideoList[i].doubanId) continue;
    //     console.log(globalThis.moviesList[i].name, globalThis.moviesList[i].doubanId, i)
    // }

    // const arr = globalThis.movieVideoList.map(movie=>movie.doubanId)
    // const newArr = arr.map((item, index)=>arr.indexOf(item)!==index&&item).filter(Boolean)
    // globalThis.moviesList.forEach(movie=>{
    //     if(newArr.includes(movie.doubanId)) console.log(movie.name)
    // })

    // const arr = globalThis.movieVideoList.map(movie=>movie.video)
    // console.log(arr.length)
    // console.log(Array.from(new Set(arr)).length)
    // console.log('loading')
    let res = await rp('https://api.wmdb.tv/movie/api?id=1295124');
    try {
      res = JSON.parse(res);
      console.log(res)
    } catch (err) {
      console.log(err)
      res = null
    }
})();