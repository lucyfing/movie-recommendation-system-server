const Koa = require('koa');
const { connect } = require('./database/init');
const R = require('ramda');
const { resolve } = require('path');
const { mongoose } = require('mongoose');
const MIDDLEWARES = ['router']

const useMiddlewares = (app) => {
    R.map(
        R.compose(
            R.forEachObjIndexed(
                initWith => initWith(app)
            ),
            require,
            name => resolve(__dirname, `./middlewares/${name}`)
        )
    )(MIDDLEWARES)
}


;(async () => {
    await connect();
    // require('./tasks/movie')
    // require('./tasks/category')

    const app = new Koa()
    const cors = require('@koa/cors');
    app.use(cors())
    await useMiddlewares(app)
    app.listen(4455)
})()
