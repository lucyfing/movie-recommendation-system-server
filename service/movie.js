// 处理电影信息的操作，直接与数据库进行交互

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


// 推荐电影
export const recommendMovies = async (userId, doubanId) => {
  let result = []
  if(userId) {
    // 获取指定用户的收藏列表
    const favorites = await UserCollection.find({userId})
    const favoritesId = favorites.map((favorite) => favorite.doubanId)
    // 获取该用户收藏的所有电影信息
    const movies = await Promise.all(favorites.map(async (favorite) => {
      const movie = await Movie.findOne({doubanId: favorite.doubanId})
      return {userId: favorite.userId, ...movie['_doc']}
    }))

    // 获取与该用户收藏相似的其他用户
    const favoriteDoubanIds = movies.map(movie => movie.doubanId)
    const otherFavorites = await UserCollection.find({doubanId: {$in: favoriteDoubanIds}, userId: {$ne: userId}})
    const otherUserIds = otherFavorites.map((favorite) => favorite.userId)
    const otherUsers = await User.find({_id: {$in: otherUserIds}})
    // 根据用户收藏的相同的电影数量来计算用户相似度
    const similarUsers = await Promise.all(otherUsers.map(async (user) => {
      const similarScore = otherFavorites.reduce((score, favorite) => {
        if(favorite.userId === String(user._id)) {
          score += 1
        }
        return score
      }, 0)
      return {userId: user._id, similarScore}
    }))

    // 找到与该用户最相似的一些用户，并获取这些用户的电影收藏列表
    const topUsers = similarUsers.sort((a,b) => b.similarScore - a.similarScore).slice(0, 10)
    const recommendMovieList = await Promise.all(topUsers.map(async (user) => {
      const otherFavorites = await UserCollection.find({userId: user.userId})
      const otherMovieIds = Array.from(new Set(otherFavorites.map((favorite)=>favorite.doubanId)))

      // 过滤该用户已经收藏的电影
      const filterMoviesId = otherMovieIds.filter((doubanId) => favoritesId.indexOf(doubanId)===-1)
      const moviesToRecommend = await Movie.find({doubanId: {$in: filterMoviesId}})
      return moviesToRecommend
    }))

    // 将推荐结果按照推荐度排序，推荐度越高排名越靠前
    const sortedRecommentedMovies = recommendMovieList
    .flatMap((movies) => movies)
    .reduce((result, movie) => {
      const index = result.findIndex((item) => item.doubanId === movie.doubanId)
      if(index !== -1) {
        result[index].recommendationScore += 1
      } else {
        result.push({...movie['_doc'], recommendationScore: 1})
      }
      return result
    }, [])
    .sort((a,b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 10)

    result = [...sortedRecommentedMovies]
  } 

  // 根据电影类型推荐收藏最多的电影
  const len = result.length
  const resultIds = new Set(result.map(movie => movie.doubanId))
  if(len>=0 && len<10) {
    const {movieTypes} = await Movie.findOne({doubanId}, {movieTypes: 1})
    const categories = await Category.find({name: {$in: movieTypes}})
    const moviesId = Array.from(new Set(...categories.map(category => category.movies)))
    const movies = await Movie.find({_id: {$in: moviesId}})
    const newNovies = await Promise.all(movies.map(async movie => {
      const collection = await MovieCollection.findOne({doubanId: movie.doubanId})
      return {collectionVotes: collection.collectionVotes, ...movie['_doc']}
    }))

    let favoritesId = []
    if(userId) {
      // 获取指定用户的收藏列表
      const favorites = await UserCollection.find({userId})
      favoritesId = favorites.map((favorite) => favorite.doubanId)
    }

    const sortedMovies = newNovies
    .sort((a,b) => b.collectionVotes - a.collectionVotes)
    .filter((movie) => len===0 || (!resultIds.has(movie.doubanId) && favoritesId.indexOf(movie.doubanId)===-1))
    .slice(0, 10)

    result = [...result, ...sortedMovies.slice(0, sortedMovies.length-len)]
  }

  return result
}
