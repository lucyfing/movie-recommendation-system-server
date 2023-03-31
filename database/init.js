/** 初始化数据库 */

const mongoose = require('mongoose')
const db = 'mongodb://localhost/douban-test'
const glob = require('glob')
const {MovieSchema} = require('./schema/movie')
const {categorySchema} = require('./schema/category')
const {UserSchema} = require('./schema/user')

mongoose.Promise = global.Promise

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

            resolve()
            console.log('MongoDB Connection successfully!')
        })
    })
}