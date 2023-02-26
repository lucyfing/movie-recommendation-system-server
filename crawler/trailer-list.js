/**** 爬虫文件，爬取豆瓣top250电影信息 */ 

const puppeteer = require('puppeteer') // 引入爬虫工具puppeteer
const url = `https://movie.douban.com/top250` //爬取的电影地址

// 延时函数
const sleep = time => new Promise(resolve => {
    setTimeout(resolve, time)
})


// 爬取每部电影的详细信息
const scrapeMovieData = async (url) => {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const title = $('h1 span').text(); // 标题
  const year = $('h1 span.year').text().slice(1, -1); // 年份
  const rating = $('strong.rating_num').text(); // 评分
  let summary = ''; // 简介
  $('div.indent span').each(function() {
    const attr = $(this).attr('property');
    if(attr === 'v:summary') {
        summary = $(this).text().trim();
    }
  })
  const directors = []; // 导演
  const stars = []; // 演员
  $('div.info span.attrs a').each(function () {
    const attr = $(this).attr('rel');
    if (attr === 'v:directedBy') {
      directors.push($(this).text());
    } else if (attr === 'v:starring') {
      stars.push($(this).text());
    }
  });
  const poster = $('div#mainpic img').attr('src');  // 海报
  const movieData = {
    title,
    year,
    rating,
    summary,
    directors,
    stars,
    poster,
  };
  return movieData;
};













  
// 声明自动执行的异步函数
;(async () => {
    console.log('Start visit the target page')

    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        dumpio: false
    })

    const page = await browser.newPage()
    // 当网络空闲时，页面加载完毕
    await page.goto(url, {
        waitUntil: 'domcontentloaded'
    })
    // await page.waitForSelector('.grid_view')

    await sleep(3000)

    // await page.waitForSelector('.paginator .next a')
    // for (let i = 0; i < 2; i++) {
    //     await sleep(3000)
    //     await page.click('.paginator .next a')
    // }

    // 获取网页内容
    const result = await page.evaluate(() => {
        var items = document.querySelectorAll('.grid_view li') // 拿到所有列表
        var links = []
        if (items.length >= 1) {
          items.forEach((item, index) => {
            let doubanId = item.querySelector('a').getAttribute('href').split('subject/')[1].split('/')[0]
            let title = item.querySelector('.title').textContent
            let rate = Number(item.querySelector('.rating_num').textContent)
            let poster = item.querySelector('img').getAttribute('src').replace('s_ratio', 'l_ratio')
                links.push({
                    doubanId,
                    title,
                    rate,
                    poster
                })
          })
        }

        return links
    })

    browser.close()

    console.log(result)
    // process.send({result}) // 发送result结果
    // process.exit(0) // 退出进程

})()
  




// const scrapeTopMovies = async () => {
//   let movies = [];
//   let page = 0;
//   while (page < 250) {
//     const response = await axios.get(`${baseURL}?start=${page}&filter=`);
//     const $ = cheerio.load(response.data);
//     $('div.item').each(async function () {
//       const movieUrl = $('div.hd a', this).attr('href');
//       const movieData = await scrapeMovieData(movieUrl);
//       movies.push(movieData);
//     });
//     await sleep(3000);
//     page += 25;
//   }
//   return movies;
// };

// scrapeTopMovies().then((movies) => {
// //   console.log(movies);
// }).catch((error) => {
//   console.error(error);
// });

   

//     // 点击下一页
//     const nextLink = await page.$('.next a');
//     if (!nextLink) break;
//     await nextLink.click();




