const mongoose = require('mongoose')
const User = mongoose.model('User')
const Movie = mongoose.model('Movie')
const UserCollection = mongoose.model('UserCollection')
const MovieCollection = mongoose.model('MovieCollection')
const bcrypt = require('bcrypt')
const path = require('path')
const fs = require('fs')
const utils = require('./utils/index')
const SALT_WORK_FACTOR = 10


// 校验密码
export const checkPassword = async (email, password) => {
  let match = false
  const user = await User.findOne({ email })

  if (user) {
    match = await user.comparePassword(password, user.password)
  }

  return {
    match,
    user
  }
}

// 修改用户信息
export const updateUser = async (_id, username, avatar, description) => {
  if(username) {
    const user = await User.findOne({_id, username})
    if(user) return false
    await User.update({_id},{$set:{username: username}})
  }
  if(avatar) {
    const user = await User.findOne({_id})
    if(fs.existsSync(path.resolve(__dirname, `../public${user.avatar}`))) {
      fs.unlinkSync(path.resolve(__dirname, `../public${user.avatar}`))
    }
    await User.update({_id},{$set:{avatar: avatar}})
  }
  if(description) {
    await User.update({_id},{$set:{description: description}})
  }
  const user = await User.findOne({_id})
  return user
}


// 修改密码
export const updatePwd = async (email, password, newPassword) => {
  const {match} = await checkPassword(email, password)
  if(match) {
    const hashedPassword = bcrypt.hashSync(newPassword, SALT_WORK_FACTOR);
    await User.update({email},{$set:{password: hashedPassword}})
    return {
      success: true
    }
  }

  return {
    success: false
  }
}


// 查询、收藏或取消电影收藏
export const userMovies = async (userId, doubanId, collection) => {
  let flag
  const result = await UserCollection.findOne({userId: userId, doubanId: doubanId})
  if(result) flag = true
  else flag = false
  const {collectionVotes} = await MovieCollection.findOne({doubanId:doubanId})
  let newCollectionVotes = collectionVotes

  if(collection===1 && !flag) {
    await UserCollection.create({userId: userId, doubanId: doubanId})
    await MovieCollection.updateOne({doubanId:doubanId}, {$set: {collectionVotes: newCollectionVotes+collection}})
    const {collectionVotes} = await MovieCollection.findOne({doubanId})
    newCollectionVotes = collectionVotes
    flag = true
  }
  if(collection===-1 && flag) {
    await UserCollection.deleteOne({userId: userId, doubanId: doubanId})
    await MovieCollection.updateOne({doubanId:doubanId}, {$set: {collectionVotes: newCollectionVotes+collection}})
    const {collectionVotes} = await MovieCollection.findOne({doubanId})
    newCollectionVotes = collectionVotes
    flag = false
  }

  return {
    collectionUser: flag,
    collectionVotes: newCollectionVotes
  }
}


// 用户获取收藏列表
export const getCollections = async (userId, page, pageSize) => {
  const query = {userId:userId}
  let {list, currentPage, totalPages, totalData} = await utils.paginationList(UserCollection, query, page, pageSize)
  const doubanIdArr = list.map(item=>item.doubanId)
  list = await Movie.find({doubanId: {$in: doubanIdArr}})
  return {
    list, 
    currentPage, 
    totalPages, 
    totalData
  }
}


// 注册用户
export const createUser = async (username, password, email) => {
  const user = await User.findOne({$or: [
    {username: username},
    {email: email}
  ]})
  if(!user) {
    const hashedPassword = bcrypt.hashSync(password, SALT_WORK_FACTOR);
    await User.insertMany({username, password: hashedPassword, email})
    return {
      success: true,
      message: '新用户注册成功'
    }
  }
  if(user.username === username) {
    return {
      success: false,
      message: '用户名已存在'
    }  
  }
  if(user.email === email) {
    return {
      success: false,
      message: '邮箱已存在'
    }  
  }
  return {
    success: false,
    message: '新用户注册失败'
  }
}


// 获取用户列表
export const getAllUsers = async (username, email, status, page, pageSize) => {
  const query = {}
  if(username) query.username = {$regex: username}
  if(email) query.email = email
  if(status) query.status = Number(status)
  const {list, currentPage, totalPages, totalData} = await utils.paginationList(User, query, Number(page), Number(pageSize))
  return {list, currentPage, totalPages, totalData}
}


// 删除用户
export const delUsers = async (_ids) => {
  let result = await User.deleteMany({ _id: {$in: [..._ids]} });
  return result.deletedCount;
}

// 获取用户总数
export const getUsersCount = async () => {
  const count = await User.count()
  return count
}