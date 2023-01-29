/**** 爬虫文件，爬取豆瓣电影信息 */ 

const puppeteer = require('puppeteer') // 引入爬虫工具puppeteer

// const url = `https://movie.douban.com/explore` // 豆瓣地址
const url = `https://movie.douban.com/top250`

// 延时函数
const sleep = time => new Promise(resolve => {
    setTimeout(resolve, time)
})
  
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
        waitUntil: 'networkidle2'
    })

    await sleep(3000)

    // await page.waitForSelector('.explore-more button')
    // for (let i = 0; i < 2; i++) {
    //     await sleep(3000)
    //     await page.click('.explore-more button')
    // }


    await page.waitForSelector('.paginator .next')
    for (let i = 0; i < 2; i++) {
        await sleep(3000)
        await page.click('.paginator .next')
    }

    // 获取网页内容
    const result = await page.evaluate(() => {
        var $ = window.$
        // var items = $('.explore-list li')  // 拿到所有列表
        var items = $('.grid_view').find('li')
        var links = []

        if (items.length >= 1) {
            items.each((index, item) => {
                let it = $(item)
                // let doubanId = it.find('a').attr('href').split('movie/')[1]
                // let title = it.find('.drc-subject-info-title-text').text()
                // let rate = Number(it.find('.drc-rating-num').text())
                // let poster = it.find('.drc-cover-pic').attr('src').replace('m_ratio', 'l_ratio')

                let doubanId = it.find('a').attr('href').split('subject/')[1]
                let title = it.find('.title').text()
                let rate = Number(it.find('.rating_num').text())
                let poster = it.find('img').attr('src').replace('s_ratio', 'l_ratio')

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
  