const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const UserCollection = mongoose.model('UserCollection')
const MovieCollection = mongoose.model('MovieCollection')
const Category = mongoose.model('Category')

const paginationFun = async (query, page, pageSize) => {
    const count = await Movie.countDocuments(query)
    let movies = await Movie.find(query)
    let totalPages = 1
    let currentPage = 1
    if(pageSize) {
      totalPages = Math.ceil(count / pageSize)
      currentPage = page > totalPages ? totalPages : page
      movies = await Movie.find(query).skip((currentPage-1)*pageSize).limit(pageSize)
    }
    return {
      movies,
      currentPage,
      totalPages,
      totalMovies: count
    }
}

const paginationList = async (schema, query, page, pageSize) => {
  const count = await schema.countDocuments(query)
  let list = await schema.find(query)
  let totalPages = 1
  let currentPage = 1
  if(pageSize) {
    totalPages = Math.ceil(count / pageSize)
    currentPage = page > totalPages ? totalPages : page
    list = await schema.find(query).skip((currentPage-1)*pageSize).limit(pageSize)
  }
  return {
    list,
    currentPage,
    totalPages,
    totalData: count
  }
}




 // 基于用户收藏行为的协同过滤算法函数 
 const userCF = async (userId) => {

  // 从数据库中检索该用户收藏的电影列表
  const favorites = await UserCollection.find({userId})
  const favoritesId = favorites.map((favorite) => favorite.doubanId)

  // 获取与该用户收藏相似的其他用户
  const otherFavorites = await UserCollection.find({doubanId: {$in: favoritesId}, userId: {$ne: userId}})
  const otherUserIds = otherFavorites.map((favorite) => favorite.userId)

  // 根据用户收藏的相同的电影数量来计算用户相似度
  const similarUsers = await Promise.all(otherUserIds.map(async (userId) => {
    const similarScore = otherFavorites.reduce((score, favorite) => {
      if(favorite.userId === userId) {
        score += 1
      }
      return score
    }, 0)
    return {userId, similarScore}
  }))

  // 找到与该用户最相似的一些用户，并获取这些用户的电影收藏列表
  const topUsers = similarUsers.filter((user) => user.similarScore>0)
  let recommenddoubanIds = await Promise.all(topUsers.map(async (user) => {
    const otherFavorites = await UserCollection.find({userId: user.userId})
    const otherMovieIds = otherFavorites.map((favorite)=>favorite.doubanId)
    return otherMovieIds
  }))
  // 去除用户已收藏的电影
  recommenddoubanIds = Array.from(new Set(recommenddoubanIds.flatMap(doubanIds=>doubanIds))).filter((doubanId) => favoritesId.indexOf(doubanId)===-1)
  const recommendMovieList = await Movie.find({doubanId: {$in: recommenddoubanIds}})

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

  return sortedRecommentedMovies
}


// 基于电影特征（收藏数据，类型）的协同过滤算法函数 
const itemCF = async (movieTypes) => {

  // 从数据库中检索与该电影类型相似的其他电影
  const categories = await Category.find({name: {$in: movieTypes}})
  const moviesId = Array.from(new Set(...categories.map(category => category.movies)))
  const movies = await Movie.find({_id: {$in: moviesId}})
  const newNovies = await Promise.all(movies.map(async movie => {
    const collection = await MovieCollection.findOne({doubanId: movie.doubanId})
    return {collectionVotes: collection.collectionVotes, ...movie['_doc']}
  }))

  // 统计所有相似电影被收藏的次数，并排序
  const sortedMovies = newNovies.sort((a,b) => b.collectionVotes - a.collectionVotes)

  // 返回相似电影
  return sortedMovies
}


module.exports = {
    paginationFun,
    paginationList,
    userCF,
    itemCF
}