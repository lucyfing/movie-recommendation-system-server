/**** 爬虫文件，爬取豆瓣每条电影的详细信息 */ 

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const writePath = path.resolve(__dirname, './data/movies-detail-list2.js');
const url = 'https://api.wmdb.tv/movie/api?id=1295124'
const rp = require('request-promise-native')

// 获取电影的详细信息
const fetchMovie = async (movie) => {
    const url = `https://api.wmdb.tv/movie/api?id=${movie.doubanId}`;
    let res = await rp(url);
    let movieData = {...movie};
    try {
      res = JSON.parse(res);
      movieData.year = res.year || 0, // 电影年份
      movieData.description = res.data[0].description || '', // 电影简介
      movieData.movieTypes = res.data[0].genre.split('/') || [], // 电影类型
      movieData.languages = res.data[0].language.split(',') || [], // 电影语言
      movieData.countries = res.data[0].country.split('/') || [], // 电影地区
      movieData.actors = res.actor.map(item=>item.data[0].name) || [], // 电影演员
      movieData.directors = res.director.map(item=>item.data[0].name) || [], // 电影导演
      movieData.writers = res.writer.map(item=>item.data[0].name) || [], // 电影编剧
      movieData.dateReleased = res.dateReleased || '', // 电影上映时间
      movieData.collectionVotes = res.doubanVotes || 0 // 电影收藏数
    } catch (err) {
      console.log(err)
      res = null
    }

    return movieData
}

const sleep = time => new Promise(resolve => {
    setTimeout(resolve, time);
})

const crawlAllMovieDetail = async (num)=>{
    let movieDetailList = [];
    for (let [index, movie] of globalThis.movieVideoList.entries()) {
        if(index>=num&&index<num+5) {
            try {
                const movieDetail = await fetchMovie(movie);
                movieDetailList.push(movieDetail);
            } catch (error) {
                console.error(`error: ${movie.name}, ${error}`);
            }
            await sleep(30000);
        }
    }
    const flag = fs.existsSync(writePath);
    if(flag) require(writePath);
    globalThis.movieDetailList = flag ? [...globalThis.movieDetailList, ...movieDetailList] : movieDetailList;
    fs.writeFileSync(writePath, `globalThis.movieDetailList = ${JSON.stringify(globalThis.movieDetailList)}`, 'utf8');
}

;(async ()=>{
    require('./data/movies-video-list2.js');
    let i = 246;
    while(i<=246) {
        await crawlAllMovieDetail(i);
        await sleep(3000);
        console.log('loading');
        i = i+5;
    }

})();
  
  
  