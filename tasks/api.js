// http://api.douban.com/v2/movie/subject/1764796
/** 将爬取到的数据做一个拆分，获取到想要的数据 */


const rp = require('request-promise-native')
const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const Category = mongoose.model('Category')


async function fetchMovie (item) {
  // const url = `http://api.douban.com/v2/movie/${item.doubanId}`
  const url = `https://api.wmdb.tv/movie/api?id=${item.doubanId}`

  let res = await rp(url)

  try {
    res = JSON.parse(res)
  } catch (err) {
    console.log(err)
    res = null
  }

  return res
}

;(async () => {
  let movies = await Movie.find({
    $or: [
      {summary: {$exists: false}},
      {summary: null},
      {year: {$exists: false}},
      {title: ''},
      {summary: ''}
    ]
  }).exec()

  for (let i = 0; i < [movies[0]].length; i++) {
    let movie = movies[i]
    let movieData = await fetchMovie(movie)

    if (movieData) {
      movie.tags = [] // 电影标签
      movie.summary = movieData.data[0].description || '' // 电影描述
      movie.title = movieData.data[0].name || '' // 电影标题
      movie.rawTitle = movieData.data[1].name || '' // 电影英文标题
      movie.movieTypes = movieData.data[0].genre.split('/') || [] // 电影类型
      movie.year = movieData.year || 2500 // 电影上映年时间


      for(let i=0; i<movie.movieTypes.length; i++) {
        let item = movie.movieTypes[i]
        let cat = await Category.findOne({
          name: item
        })

        if(!cat) {
          cat = new Category({
            name: item,
            movies: [movie._id]
          })
        } else {
          if(cat.movies.indexOf(movie._id) === -1) {
            cat.movies.push(movie._id)
          }
        }

        await cat.save()

        if(!movie.category) {
          movie.category.push(cat._id)
        } else {
          if(movie.category.indexOf(cat._id) === -1) {
            movie.category.push(cat._id)
          }
        }
      }

      let pubdates = [] // 电影上映时间和地点
      let country = movieData.data[0].country || '未知'
      pubdates.push({
        date: new Date(movieData.year),
        country
      })
      movie.pubdate = pubdates

      // console.log('movie: ', movie)
      await movie.save()
    }
  }
})()


