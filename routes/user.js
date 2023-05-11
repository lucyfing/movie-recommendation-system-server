import { recommendAllMovies } from '../service/movie'

const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')
const {
  controller,
  get,
  post,
  put
} = require('../lib/decorator')
const {
    checkPassword,
    updateUsername,
    updateUser,
    updatePwd,
    userMovies,
    getCollections,
    createUser
} = require('../service/user')
const {
  getRedis,
  setRedis
} = require('../service/utils/redis')

@controller('/user')
export default class userController {

  @post('/login')
  // 登录
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
        user: matchData.user
      })
    }

    return (ctx.body = {
      success: false,
      err: '密码错误'
    })
  }

  @post('/updateUser')
  // 更新用户基本信息
  async updateUser (ctx, next) {
    const {_id, username, avatar, description} = ctx.request.body
    const user = await updateUser(_id, username, avatar, description)
    if(user) {
      return (ctx.body = {
        success: true,
        user: user
      })
    }
    return (ctx.body = {
        success: false,
        err: '用户名已存在'
      }
    )
  }

  @post('/avatar')
  // 修改头像
  async updateAvatar (ctx, next) {
    let {_id} = ctx.request.body
    let {avatar} = ctx.request.files
    // 将文件复制到静态资源目录下
    const filePath = path.resolve(__dirname, `../public/imgs/${_id}_${avatar.originalFilename}`)
    fs.copyFileSync(avatar.filepath, filePath)
    avatar = `/imgs/${_id}_${avatar.originalFilename}`
    const user = await updateUser(_id, undefined, avatar, undefined)
    return (ctx.body = {
      success: true,
      user: user
    })
  }


  @post('/updatePwd')
  // 更新密码
  async updatePassword (ctx, next) {
    let {email, password, newPassword} = ctx.request.body
    const {success} = await updatePwd(email, password, newPassword)
    if(success) {
      return (ctx.body = {
        success: true,
        message: '密码更新成功'
      })
    }

    return (ctx.body = {
      success: false,
      err: '旧密码不正确,更新失败'
    })
  }

  @post('/userMovie')
  // 收藏电影
  async updateCollection (ctx, next) {
    const {_id, doubanId, collection} = ctx.request.body
    const {collectionUser, collectionVotes} = await userMovies(_id, doubanId, collection)
    const movies = await recommendAllMovies(_id)
    setRedis(_id, movies)
    return (ctx.body = {
      collectionUser,
      collectionVotes
    })
  }


  @post('/myCollections')
  // 获取收藏列表
  async getCollectionList (ctx, next) {
    const {_id, page, pageSize} = ctx.request.body
    const {list, currentPage, totalPages, totalData} = await getCollections(_id, page, pageSize)
    return (ctx.body = {
      list, 
      currentPage, 
      totalPages, 
      totalData
    })
  }

  @post('/createUser')
  // 注册用户
  async createNewUser (ctx, next) {
    const {username, password, email} = ctx.request.body
    const {success, message} = await createUser(username, password, email)
    return (ctx.body = {
      success,
      message
    })
  }


}
