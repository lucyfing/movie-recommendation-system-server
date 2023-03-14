/**** 爬虫文件，爬取豆瓣top250电影信息 */ 

const puppeteer = require('puppeteer'); // 引入爬虫工具puppeteer
const cheerio = require('cheerio'); // 页面解析工具
const path = require('path');
const fs = require('fs');

const writepath = path.resolve(__dirname, './data/movies-list.js'); // 将电影数据放在文件里
const url = 'https://movie.douban.com/top250'; // 爬取的豆瓣电影地址
const movies = []; 

(async ()=>{
  const browser = await puppeteer.launch(); // 模拟浏览器操作
  const page = await browser.newPage();
  await page.goto(url);
  let hasNextPage = true; // 获取top250电影
  while (hasNextPage) {
    const html = await page.content(); // 获取当前页的 HTML
    const $ = cheerio.load(html); // 使用 cheerio 解析 HTML 并获取电影信息
    $('.grid_view .item').each((i, el) => {
      const $el = $(el);
      const name = $el.find('.title').text(); // 电影名称
      const rate = Number($el.find('.rating_num').text()); // 电影评分
      const poster = $el.find('img').attr('src'); // 海报
      const doubanId = $el.find('.hd a').attr('href').split('subject/')[1].split('/')[0]; // 电影豆瓣id
      movies.push({
        doubanId,
        name,
        rate,
        poster,
      });
    });

    const nextBtn = await page.$('.next a'); // 点击下一页按钮
    if (!nextBtn) {
      hasNextPage = false;
    } else {
      await Promise.all([page.waitForNavigation(), nextBtn.click()]); // 等待页面加载完成
    }
  }

  await browser.close(); // 关闭浏览器
  fs.writeFileSync(writepath, `globalThis.moviesList = ${JSON.stringify(movies)}`, 'utf8');
})()




