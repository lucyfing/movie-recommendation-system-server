/** 创建电影分类的数据模型 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {ObjectId, Mixed} = Schema.Types

const categorySchema = new mongoose.Schema({
  name: { // 类型名字
    unique: true,
    type: String
  },
  movies: [{ // 关联电影
    type: ObjectId,
    ref: 'Movie'
  }],
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

categorySchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }

  next()
})

exports.categorySchema = categorySchema

