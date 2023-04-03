const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const UserCollection = mongoose.model('UserCollection')

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



module.exports = {
    paginationFun,
    paginationList
}