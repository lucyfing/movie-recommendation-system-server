/** 包含豆瓣电影信息的爬虫脚本的子进程文件 */

const cp = require('child_process') // 引入子进程模块
const { resolve } = require('path')
const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')

;(async () => {
  const script = resolve(__dirname, '../crawler/trailer-list') // 获取爬虫脚本
  const child = cp.fork(script, []) // 返回含爬虫脚本的子进程对象
  let invoked = false // 标识该爬虫进程是否被运行

  child.on('error', err => {
    if (invoked) return

    invoked = true

    console.log(err)
  })

  child.on('exit', code => {
    if (invoked) return

    invoked = true
    let err = code === 0 ? null : new Error('exit code ' + code)

    console.log(err)
  })

  // 子进程消息的获取
  child.on('message', data => {
    let result = data.result
    // console.log('result: ', result)

    result.forEach(async item => {
      let movie = await Movie.findOne({
        doubanId: item.doubanId
      })

      if(!movie) {
        movie = new Movie(item)
        await movie.save()
      }
    });
  })
})()