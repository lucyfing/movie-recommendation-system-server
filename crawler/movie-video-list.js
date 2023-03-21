/**** 爬虫文件，爬取豆瓣电影视频数据 *************/ 

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const writePath = path.resolve(__dirname, './data/movie-video-list2.js')
const base = 'https://movie.douban.com/subject/';

const sleep = (time) => new Promise(resolve => {
  setTimeout(resolve, time);
})

const crawlAllMovieVideo = async (num) => {
  console.log('Start visit the target page');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    dumpio: false
  });
  const page = await browser.newPage();

  const moviesListLen = globalThis.moviesList.length;
  let movieVideoList = [];
  for(let i=num; i<num+5; i++) {

    await page.goto(base + globalThis.moviesList[i].doubanId, {
      waitUntil: 'networkidle2'
    });
    await sleep(1000);
  
    const result = await page.evaluate(() => {
      let $ = window.$;
      let it = $('.related-pic-video');
  
      if (it && it.length > 0) {
        let link = it.attr('href');
        return {
          link
        }
      }
  
      return {}
    });
  
    let video;
    if (result.link) {
      await page.goto(result.link, {
        waitUntil: 'networkidle2'
      });
      await sleep(2000);
  
      video = await page.evaluate(() => {
        var $ = window.$;
        var it = $('source');
  
        if (it && it.length > 0) {
          return it.attr('src')
        }
  
        return ''
      })
    }

    movieVideoList.push({
      ...globalThis.moviesList[i],
      video: video
    })
  }
  await browser.close();

  const flag = fs.existsSync(writePath);
  if(flag) require(writePath);
  globalThis.movieVideoList = flag ? [...globalThis.movieVideoList, ...movieVideoList] : movieVideoList;
  fs.writeFileSync(writePath, `globalThis.movieVideoList = ${JSON.stringify(globalThis.movieVideoList)}`, 'utf8');
  console.log('end');
  return true;
}

;(async ()=>{
  require('./data/movies-list');
  let i = 240;
  while(i<=245) {
    await crawlAllMovieVideo(i);
    await sleep(3000);
    i = i+5;
  }
  console.log('quit');
})();

