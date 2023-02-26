const Koa = require('koa');
const { connect, initSchemas } = require('./database/init');
const R = require('ramda');
const { resolve } = require('path')
const MIDDLEWARES = ['router']

const useMiddlewares = (app) => {
    R.map(
        R.compose(
            R.forEachObjIndexed(
                initWith => initWith(app)
                // e => e(app)
            ),
            require,
            name => resolve(__dirname, `./middlewares/${name}`)
        )
    )(MIDDLEWARES)
}


;(async () => {
    await connect()
    // const Movie = mongoose.model('Movie')
    // const movies = await Movie.find({})
    // console.log(movies)

    // require('./tasks/movie') 

    const app = new Koa()
    // const cors = require('koa-cors')
    const cors = require('@koa/cors');

    app.use(cors())

    await useMiddlewares(app)

    app.listen(4455)

})()
