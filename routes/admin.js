const mongoose = require('mongoose')
const {
  controller,
  get,
  post,
  put,
  del
} = require('../lib/decorator')
const {
    checkPassword,
    getAllUsers,
    createUser,
    delUsers,
    getUsersCount
} = require('../service/user')

const {
  getCategoryList,
  addCategory,
  deleteCategory,
  getMovieLen
} = require('../service/category')

const {
  getHottstMovies,
  getMoviesCount,
  getCountryMovies,
  getAllcountry,
  addMovie
} = require('../service/movie')


@controller('/admin')
export default class userController {
  @post('/login')
  async login (ctx, next) {
    const { email, password } = ctx.request.body
    const matchData = await checkPassword(email, password)

    if (!matchData.user) {
        return (ctx.body = {
          success: false,
          err: '用户不存在'
        })
      }    

    if (matchData.match) {
      return (ctx.body = {
        success: true,
      })
    }

    return (ctx.body = {
      success: false,
      err: '密码错误'
    })
  }

  @post('/userList')
  // 获取用户列表
  async getUserList (ctx, next) {
    const { username, email, status, page, pageSize } = ctx.request.body
    const {list, currentPage, totalPages, totalData} = await getAllUsers(username, email, status, page, pageSize)
    return (ctx.body = {
      list,
      currentPage, 
      totalPages, 
      totalData
    })
  }

  @post('/addUser')
  // 新建用户
  async addUser (ctx, next) {
    const {username, password, email} = ctx.request.body
    const {success, message} = await createUser(username, password, email)
    return (ctx.body = {
      success,
      message
    })
  }


  @del('/delUsers')
  // 删除用户
  async delUsers (ctx, next) {
    const {_ids} = ctx.query
    const deletedCount = await delUsers(JSON.parse(_ids))
    return (ctx.body = {deletedCount})
  }

  @get('/categoryList')
  // 获取类型列表
  async getCategoryList (ctx, next) {
    const {page, pageSize, name} = ctx.query
    const {list, currentPage, totalPages, totalData} = await getCategoryList(page, pageSize, name)
    return (ctx.body = {
      list, 
      currentPage, 
      totalPages, 
      totalData
    })
  }

  @post('/addCategory')
  // 新增电影类型
  async addCategory (ctx, next) {
    const {name} = ctx.request.body
    const {success, message} = await addCategory(name)
    return (ctx.body = {
      success,
      message
    })
  }

  @del('/deleteCategory')
  // 删除类型
  async deleteCategory (ctx, next) {
    const {_id} = ctx.query
    const {deletedCount} = await deleteCategory(_id)
    return (ctx.body = {
      deletedCount
    })
  }

  @get('/getHottstMovies')
  // 获取最热的10部电影
  async getHottstMovies (ctx, next) {
    const movies = await getHottstMovies()
    return (ctx.body = {
      movies
    })
  }


  @get('/getAllCount')
  // 获取电影和用户总数
  async getAllCount (ctx, next) {
    const userCount = await getUsersCount()
    const moviesCount = await getMoviesCount()
    return (ctx.body = {
      userCount,
      moviesCount
    })
  }


  @get('/getMovieLen')
  // 获取类型关联的电影个数
  async getMovieLen (ctx, next) {
    const moviesArr = await getMovieLen()
    return (ctx.body = {
      moviesArr
    })
  }

  @get('/getCountryMovies')
  // 获取国家电影分布
  async getCountryMovies(ctx, next) {
    const countries = await getAllcountry()
    const result = await getCountryMovies(countries)
    return (ctx.body = {
      result
    })
  }

  @post('/addMovie')
  // 新增电影
  async addMovie (ctx, next) {
    const {newMovie} = ctx.request.body
    const {success, message} = await addMovie(newMovie)
    return (ctx.body = {
      success,
      message
    })
  }
}
