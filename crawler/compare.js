;(() => {
    require('./data/movies-list');
    require('./data/movie-video-list');
    const len = globalThis.movieVideoList.length
    for(let i=0; i<globalThis.moviesList.length; i++) {
        if(i<len && globalThis.moviesList[i].doubanId===globalThis.movieVideoList[i].doubanId) continue;
        console.log(globalThis.moviesList[i].name, globalThis.moviesList[i].doubanId, i)
    }
    // const arr = globalThis.movieVideoList.map(movie=>movie.doubanId)
    // const newArr = arr.map((item, index)=>arr.indexOf(item)!==index&&item).filter(Boolean)
    // globalThis.moviesList.forEach(movie=>{
    //     if(newArr.includes(movie.doubanId)) console.log(movie.name)
    // })
    console.log('loading')
})();