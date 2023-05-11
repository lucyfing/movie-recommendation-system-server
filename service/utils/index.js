const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const UserCollection = mongoose.model('UserCollection')
const MovieCollection = mongoose.model('MovieCollection')
const Category = mongoose.model('Category')
const User = mongoose.model('User')

const paginationFun = async (query, page, pageSize) => {
    const count = await Movie.countDocuments(query)
    let movies = await Movie.find(query)
    let totalPages = 1
    let currentPage = 1
    if(pageSize) {
      totalPages = Math.ceil(count / pageSize) > 0 ? Math.ceil(count / pageSize) : 1
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
  if(count === 0) return {
    list: [],
    currentPage: 1,
    totalPages: 1,
    totalData: 0
  }
  
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

// 计算两个向量之间的余弦相似度
const cosineSimilarity = (vector1, vector2) => {
  const dotProduct = Object.keys(vector1).reduce((acc, movie) => acc + (vector1[movie] * vector2[movie]) , 0);
  const magnitude1 = Math.sqrt(Object.values(vector1).reduce((acc, val) => acc + val * val, 0));
  const magnitude2 = Math.sqrt(Object.values(vector2).reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (magnitude1 * magnitude2);
}

// 基于用户收藏行为的协同过滤算法函数
const newUserCF = async (userId) => {
  // 获取指定用户的电影收藏列表
  const userCollects = await UserCollection.find({userId})
  if(userCollects.length <= 0) return []
  const userCollectsId = userCollects.map(item => item.doubanId)
  // 获取其他用户的收藏情况，并计算相似度
  const similarities = {}
  // const allUsers = await User.find({role: 'user'},{_id: 1})
  const allUsers = await UserCollection.find({doubanId: {$in: userCollectsId}}, {userId:1})
  const movies = await Movie.find({})
  for (let otherUser of allUsers) {
    // const otherUserId = otherUser._id
    const otherUserId = otherUser.userId
    if(otherUserId !== userId) {
      const otherCollects = await UserCollection.find({userId: otherUserId})
      if(otherCollects.length <= 0) {
        console.log(`${otherUserId}收藏列表为空，无法计算相似度`)
        continue
      }
      const otherCollectsId = otherCollects.map(item => item.doubanId)
      // 构建用户-电影收藏矩阵，每个用户对应一个对象，对象中键为电影ID，值为1或0，表示该用户是否收藏了该电影
      const userMovieMatrix = {}
      for (const movie of movies) {
        userMovieMatrix[movie.doubanId] = {
          [userId]: userCollectsId.includes(movie.doubanId),
          [otherUserId]: otherCollectsId.includes(movie.doubanId)
        }
      }
      // 计算两个向量之间的余弦相似度，并保存到相似度对象中
      const userVector = userMovieMatrix[userCollects[0].doubanId]
      const otherVector = userMovieMatrix[otherCollects[0].doubanId]
      const similarity = cosineSimilarity(userVector, otherVector)
      similarities[otherUserId] = similarity
    }
  }
  // 选出Top10个最近邻用户
  const nearestNeighbors = Object.keys(similarities).sort((a, b) => similarities[b] - similarities[a]).slice(0, 10)
  // 根据最近邻用户的相似度和电影收藏热度，计算推荐电影的加权平均数，并返回排名前10的电影ID
  const scores = {}
  for (const movie of movies) {
    // 只推荐该用户没有收藏过的电影
    if(!userCollectsId.includes(movie.doubanId)) {
      let weightedSum = 0
      let weightSum = 0
      for (const neighbor  of nearestNeighbors) {
        const neighborCollects = await UserCollection.find({userId: neighbor})
        const neighborCollectsId = neighborCollects.map(item => item.doubanId)
        // 只考虑最近邻用户中有收藏该电影的用户
        if(neighborCollectsId.includes(movie.doubanId)) {
          const similarity = similarities[neighbor]
          const {collectionVotes} = await MovieCollection.findOne({doubanId: movie.doubanId})
          // 计算相似度和电影收藏量的加权值
          const weight = similarity * collectionVotes
          // 计算加权和
          weightedSum += weight
          // 计算权重和
          weightSum += weight 
        }
      }
      if(weightSum > 0) {
        scores[movie.doubanId] = weightedSum / weightSum
      }
    }
  }
  // 根据加权得分从大到小排序
  const recommendedMoviesId = Object.keys(scores).sort((a, b) => scores[b] - scores[a])
  const recommendedMovies = await Movie.find({doubanId: {$in: recommendedMoviesId}})
  return recommendedMovies
}


// 基于物品的协同过滤算法函数
const newItemCF = async (doubanId) => {
  // 获取指定电影的类型列表
  const { movieTypes } = await Movie.findOne({doubanId}, {movieTypes: 1})
  // 获取同类型的其他电影
  const movies = await Movie.find({movieTypes: {$in: movieTypes}})
  // 获取全部电影类型
  const categories = await Category.find({}, {name: 1})
  // 计算同类型电影的相似度
  const similarities = {}
  // 遍历同类型的其他电影
  for (const otherMovie of movies) {
    // 不考虑当前选中的电影本身
    if(otherMovie.doubanId !== doubanId) {
        const userVector = {}
        const otherVector = {}
        const otherMovieTypes = otherMovie.movieTypes
        // 构建电影-类型矩阵，每个对象键为类型ID，值为1或0，表示该电影是否属于某个类型
        for (let category of categories) {
          userVector[category.name] = Number(movieTypes.includes(category.name));
          otherVector[category.name] = Number(otherMovieTypes.includes(category.name));
        }
        // 计算两个向量之间的余弦相似度，并保存到相似度对象中
        const similarity = cosineSimilarity(userVector, otherVector)
        similarities[otherMovie.doubanId] = similarity
    }
  }
  // 根据相似度和电影收藏量，计算推荐电影的加权平均数，并返回排名靠前的电影ID
  const scores = {}
  // 对于所有同类型电影，计算推荐得分
  for (let otherMovie of movies) { 
    // 不考虑当前选中的电影本身
    if (otherMovie.doubanId !== doubanId) {
      let weightedSum = 0
      let weightSum = 0
      const similarity = similarities[otherMovie.doubanId];
      // 只考虑与选中电影相似的电影
      if (similarity) {
        // 计算相似度和电影收藏量的加权值
        const {collectionVotes} = await MovieCollection.findOne({doubanId: otherMovie.doubanId}, {collectionVotes: 1})
        const weight = similarity * collectionVotes
        weightedSum += weight
        weightSum += similarity
      }
      // 如果存在相似的电影，计算加权平均数
      if (weightSum > 0) {
        scores[otherMovie.doubanId] = weightedSum / weightSum;
      }
    }
  }
  // 根据加权得分从大到小排序，并返回前K个电影的ID
  const recommendedMoviesId = Object.keys(scores)
  .sort((a, b) => scores[b] - scores[a])
  .filter(id => id!==doubanId)
  const recommendedMovies = movies.filter(movie => recommendedMoviesId.includes(movie.doubanId))
  return recommendedMovies
}

module.exports = {
    paginationFun,
    paginationList,
    newUserCF,
    newItemCF
}