const mongoose = require('mongoose')
const User = mongoose.model('User')
const bcrypt = require('bcrypt')
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
