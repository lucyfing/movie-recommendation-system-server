// 处理电影信息的操作，直接与数据库进行交互

const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')

// 获取所有电影列表
export const getAllMovies = async (type, year) => {
  // 在mongodb中空query可以查询所有数据  
  let query = {}

  if (type) {
    query.movieTypes = {$in: [type]}
  }
  if (year) {
    query.year = year
  }

  const movies = await Movie.find(query)

  return movies
}

// 获取同类推荐电影
export const getRelativeMovies = async (movie) => {
  const relativeMovies = await Movie.find({
    movieTypes: {$in: movie.movieTypes}
  })

  return relativeMovies
}

// 获取单个电影信息
export const getSingleMovie = async (id) => {
  const movie = await Movie.findOne({_id: id})

  return movie
}
