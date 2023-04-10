// 处理电影信息的操作，直接与数据库进行交互
const redis = require('redis')
const { promisify } = require('util')
const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const User = mongoose.model('User')
const Category = mongoose.model('Category')
const MovieCollection = mongoose.model('MovieCollection')
const UserCollection = mongoose.model('UserCollection')
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

// 根据电影名搜索电影
export const queryMovie = async (name) => {
  const movieList = await Movie.find({name: {$regex: name}})
  return movieList
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


// 特定电影下（登录和未登录）推荐电影
export const recommendSomeMovies = async (userId, doubanId) => {
  let result = []

  if(userId) {
    // 获取基于用户收藏行为的协同过滤算法函数推荐的电影
    const otherUserFavorates = await utils.userCF(userId)
    if(otherUserFavorates.length >= 10) return otherUserFavorates.slice(0, 10)
    result = otherUserFavorates
  } 

  // 根据电影类型推荐收藏最多的电影
  const len = result.length
  const resultIds = new Set(result.map(movie => movie.doubanId))
  if(len>=0 && len<10) {
    const {movieTypes} = await Movie.findOne({doubanId}, {movieTypes: 1})
    const newNovies = await utils.itemCF(movieTypes)

    let favoritesId = []

    if(userId) {
      // 获取指定用户的收藏列表
      const favorites = await UserCollection.find({userId})
      favoritesId = favorites.map((favorite) => favorite.doubanId)
    }

    const sortedMovies = newNovies
    .filter((movie) => len===0 || (!resultIds.has(movie.doubanId) && favoritesId.indexOf(movie.doubanId)===-1))
    .slice(0, 10)

    result = [...result, ...sortedMovies.slice(0, sortedMovies.length-len)]
  }

  return result
}



// 将所有电影按情况（登录和未登录）进行推荐
export const recommendAllMovies = async (userId) => {

  // 用户登录，按推荐算法推荐
  if(userId) {
    const userFavorites = await UserCollection.find({userId})
    // 获取基于用户收藏行为的协同过滤算法函数推荐的电影
    const otherUserFavorates = await utils.userCF(userId)

    // 如果推荐数<50，则继续获取基于电影特征(类型、收藏数量)的协同过滤算法函数推荐的电影
    if(otherUserFavorates.length < 50) {

      // 获取最新收藏的10条电影数据
      const latestCollections = await UserCollection
      .find({userId})
      .sort({ atUpdate: -1 })
      .limit(10)

      const lastestMoviesId = latestCollections.map(item => item.doubanId)
      const movies = await Movie.find({doubanId: {$in: lastestMoviesId}})

      // 获取收藏最多的三种类型
      const movieTypes = movies.map(movie => movie.movieTypes).flatMap(types => types) 
      const countTypeMap = movieTypes.reduce((acc, cur) => {
        if (cur in acc) {
          acc[cur]++;
        } else {
          acc[cur] = 1;
        }
        return acc;
      }, {})
      const maxTypes = Object.entries(countTypeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(item => item[0])

      // 基于电影推荐
      let similarMovies = await utils.itemCF(maxTypes)

      // 排除用户已收藏和基于用户收藏行为推荐的电影，并根据收藏数排序
      const favoriteIds = [...userFavorites, ...otherUserFavorates].map(favorite => favorite.doubanId)
      similarMovies = similarMovies
      .flatMap(movie => movie)
      .filter(movie => favoriteIds.indexOf(movie.doubanId)===-1)
      .sort((a, b) => b.collectionVotes - a.collectionVotes)
      .slice(0, 50-otherUserFavorates.length+1)

      return [...otherUserFavorates, ...similarMovies]
    }

    return otherUserFavorates.slice(0, 50)
  }

  // 用户未登录，按电影收藏热点推荐
  let collections = await MovieCollection.find({})
  collections = collections.sort((a,b) => b.collectionVotes - a.collectionVotes).slice(0, 50)
  const recommendedMovies = await Promise.all(collections.map(async item => {
    const movie = await Movie.findOne({doubanId: item.doubanId})
    return {collectionVotes: item.collectionVotes, ...movie['_doc']}
  }))
  return recommendedMovies
}

