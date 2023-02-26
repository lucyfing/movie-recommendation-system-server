const { resolve } = require('path')
const Bundler = require('parcel-bundler')
const views = require('koa-views')
const serve = require('koa-static')

const r = path => resolve(__dirname, path)

const bundler = new Bundler(r('../../../movie-recommendation-system/public/index.html'), {
  publicUrl: '/',
  watch: true
})

export const dev = async app => {
  // 进行构建  
  await bundler.bundle()

  app.use(serve(r('../../../dist')))

  app.use(views(r('../../../dist'), {
    extension: 'html'
  }))

  app.use(async (ctx) => {
    await ctx.render('index.html')
  })
}
