/** 初始化数据库 */

const mongoose = require('mongoose')
const db = 'mongodb://localhost/douban-test'
const glob = require('glob')
const { resolve } = require('path')
const {MovieSchema} = require('./schema/movie')
const {categorySchema} = require('./schema/category')
const {UserSchema} = require('./schema/user')

mongoose.Promise = global.Promise

exports.initSchemas = () => {
    glob.sync(resolve(__dirname, './schema', '**/*.js')).forEach(
        require)
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
            // const Dog = mongoose.model('Dog', {name: String})
            // const doga = new Dog({name: '阿尔法'})

            // doga.save().then(()=>{
            //     console.log('wang')
            // })
            // console.log('MovieSchema: ', MovieSchema)
            mongoose.model('Movie', MovieSchema)
            mongoose.model('Category', categorySchema)
            mongoose.model('User', UserSchema)

            resolve()
            console.log('MongoDB Connection successfully!')
        })
    })
}