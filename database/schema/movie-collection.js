/** 创建 用户-收藏 数据模型 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MovieCollectionSchema = new mongoose.Schema({
  doubanId: {
    unique: true,
    type: String
  },
  collectionVotes: {
    type: Number,
    default: 0
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

MovieCollectionSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }

  next()
})

exports.MovieCollectionSchema = MovieCollectionSchema

