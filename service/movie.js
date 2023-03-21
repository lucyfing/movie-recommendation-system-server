// 处理电影信息的操作，直接与数据库进行交互

const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const utils = require('./utils/index')

// 获取所有电影列表
export const getAllMovies = async (type, year, page, pageSize) => {
  // 在mongodb中空query可以查询所有数据  
  let query = {}

  if (type) {
    query.movieTypes = {$in: [type]}
  }
  if (year) {
    query.year = Number(year)===2009 ? {$lte: 2009} : {$eq: Number(year)}
  }

  const movieList = await utils.paginationFun(query, page, pageSize)
  return movieList
}

// 获取电影地区列表
export const getAllcountry = async () => {
  let countries = await Movie.distinct('countries')
  // 获取去重后的地区
  countries = Array.from(new Set(countries.join(',').split(',')))
  return countries
}

// 获取语言列表
export const getAllLanguage = async () => {
  let languages = await Movie.distinct('languages')
  // 获取去重后的地区
  languages = Array.from(new Set(languages.join(',').split(',')))
  return languages
}

// 根据查询条件获取符合的电影列表
export const getFilterMovieList = async (name, rate, countries, languages, page, pageSize) => {
  let query = {}
  if(name) {
    query.name = {$regex: name}
  }
  if(rate) {
    query.rate = {$gte: Number(rate)}
  }
  if(countries) {
    query.countries = {$in: [countries]}
  }
  if(languages) {
    query.languages = {$in: [languages]}
  }
  const movieList = await utils.paginationFun(query, page, pageSize)
  return movieList
}

// 删除电影
export const deleteMovies = async (doubanIds) => {
  let result = await Movie.deleteMany({ doubanId: {$in: [...doubanIds]} });
  return result.deletedCount;
}


// 获取同类推荐电影
export const getRelativeMovies = async (movie) => {
  const relativeMovies = await Movie.find({
    movieTypes: {$in: movie.movieTypes}
  })

  return relativeMovies
}

// 获取单个电影信息
export const getSingleMovie = async (doubanId) => {
  const movie = await Movie.findOne({doubanId: doubanId})

  return movie
}
