/** 创建电影的数据模型 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {ObjectId, Mixed} = Schema.Types

const MovieSchema = new mongoose.Schema({
  doubanId: {
    unique: true,
    type: String
  },
  category: [{
    type: ObjectId,
    ref: 'Category'
  }],

  rate: Number, //电影评分
  name: String, // 电影名称
  description: String, // 电影简介
  video: String, // 电影预告
  poster: String, // 电影海报
  movieTypes: [String], // 电影类型
  pubdate: Mixed,
  year: Number, // 电影年份
  languages: [String], // 电影语言
  countries: [String], // 电影地区
  actors: [String], // 电影演员
  directors: [String], // 电影导演
  writers: [String], // 电影编剧
  dateReleased: {
    type: String,
    default: '未知'
  }, // 上映时间
  videoKey: String,
  coverKey: String,
  posterKey: String,
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

MovieSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }

  next()
})

exports.MovieSchema = MovieSchema

