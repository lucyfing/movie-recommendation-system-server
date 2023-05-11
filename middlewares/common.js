// 解析post请求体的中间件
import bodyParser from 'koa-bodyparser'
import logger from 'koa-logger'
import koaBody from 'koa-body'

export const addLogger = app => {
    app.use(logger())
}

export const addBody = app => {
    app.use(koaBody({ multipart: true }))
}