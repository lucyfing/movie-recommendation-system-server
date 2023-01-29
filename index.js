const Koa = require('koa');
const { default: mongoose } = require('mongoose');
const { connect, initSchemas } = require('./database/init');
const app = new Koa()

;(async () => {
    await connect()
    // initSchemas()

    // const Movie = mongoose.model('Movie')
    // const movies = await Movie.find({})
    // console.log(movies)

    require('./tasks/movie')
    // require('./tasks/api')

})()


app.use(async (ctx, next) => {
    ctx.body = '电影首页'
})



app.listen(4455)