/** 创建 用户-收藏 数据模型 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {ObjectId, Mixed} = Schema.Types

const UserCollectionSchema = new mongoose.Schema({
  userId: {
    type: String
  },
  doubanId: {
    type: String
  },
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})

UserCollectionSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }

  next()
})

exports.UserCollectionSchema = UserCollectionSchema

