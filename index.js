const Koa = require('koa');
const { connect, initUser, initCategory, initMovie, initMovieCollection } = require('./database/init');
const R = require('ramda');
const { resolve } = require('path');
const { mongoose } = require('mongoose');
const MIDDLEWARES = ['common', 'router'];
const cors = require('@koa/cors');
const path = require('path');
const serve = require('koa-static');

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
    // await initUser();
    // await initCategory();
    // await initMovie();
    // await initMovieCollection();

    const app = new Koa()
    app.use(cors())
    await useMiddlewares(app)

    // 将 uploads 目录指定为静态资源目录
    app.use(serve(__dirname + '/public'));

    app.listen(4455)
})()
