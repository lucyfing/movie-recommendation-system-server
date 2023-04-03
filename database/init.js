/** 初始化数据库 */

const mongoose = require('mongoose')
const db = 'mongodb://localhost/douban-test'
const glob = require('glob')
const {MovieSchema} = require('./schema/movie')
const {categorySchema} = require('./schema/category')
const {UserSchema} = require('./schema/user')
const {UserCollectionSchema} = require('./schema/user-collection')
const  {MovieCollectionSchema} = require('./schema/movie-collection')

mongoose.Promise = global.Promise

// 初始化用户表
exports.initUser = async () => {
    const User = mongoose.model('User')
    const user = await User.findOne({
        username: 'guest'
    })
    const admin = await User.findOne({
        username: 'admin'
    })

    if(!user) {
        const user = new User({
            username: 'guest',
            email: '2665724078@qq.com',
            password: 'guest',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
            description: ''
        })
        await user.save()
    }

    if(!admin) {
        const admin = new User({
            role: 'admin',
            username: 'admin',
            email: 'lucy202306@163.com',
            password: 'ant.design',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
            description: ''
        })
        await admin.save()
    }
}

// 初始化电影表
exports.initMovie = async () => {
    require('../crawler/data/movies-detail-list');
    const Movie = mongoose.model('Movie')
    globalThis.movieDetailList.forEach(async item => {
        let movie = await Movie.findOne({
        doubanId: item.doubanId
        });

        if(!movie) {
        movie = new Movie(item);
        await movie.save();
        }
    })
}

// 初始化类型表
exports.initCategory = async () => {
    const Movie = mongoose.model('Movie')
    const Category = mongoose.model('Category')
    let movies = await Movie.find({})
    for(let i=0; i<movies.length; i++) {
        const movie = movies[i]
        for(let j=0; j<movie.movieTypes.length; j++) {
            let item = movie.movieTypes[j]
            let cat = await Category.findOne({
              name: item
            })
            if(!cat) {
              cat = new Category({
                name: item,
                movies: [movie._id]
              })
            } else {
              if(cat.movies.indexOf(movie._id) === -1) {
                cat.movies.push(movie._id)
              }
            }
            await cat.save()
        }
    }    
}

// 初始化电影-收藏表
exports.initMovieCollection = async () => {
    require('../crawler/data/movies-detail-list')
    const MovieCollection = mongoose.model('MovieCollection')
    globalThis.movieDetailList.forEach(async item=>{
        let collection = await MovieCollection.findOne({
            doubanId: item.doubanId
        });
    
        if(!collection) {
            collection = new MovieCollection(item);
            await collection.save();
        }
    })
}


exports.connect = () => {
    let maxConnectTimes = 0

    return new Promise((resolve, reject) => {
        if(process.env.NODE_ENV !== 'production') {
            mongoose.set('debug', true)
        }

        mongoose.connect(db)

        mongoose.connection.on('disconnected', () => {
            maxConnectTimes++

            if(maxConnectTimes < 5) {
                mongoose.connect(db)
            } else {
                throw new Error('数据库已挂')
            }
        })

        mongoose.connection.on('error', err => {
            reject()
            console.log(err)
        })

        mongoose.connection.on('open', () => {
            mongoose.model('Movie', MovieSchema)
            mongoose.model('Category', categorySchema)
            mongoose.model('User', UserSchema)
            mongoose.model('UserCollection', UserCollectionSchema)
            mongoose.model('MovieCollection', MovieCollectionSchema)

            resolve()
            console.log('MongoDB Connection successfully!')
        })
    })
}