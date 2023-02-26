const { resolve } = require('path')
const { Route } = require('../lib/decorator')

export const router = app => {
    const apiPath = resolve(__dirname, '../routes')
    const instance = new Route(app, apiPath)

    instance.init()
}