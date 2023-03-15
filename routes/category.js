const { controller, get, post, put } = require('../lib/decorator')
const { 
    getAllCategory
} = require('../service/category.js')

@controller('/category')
export default class CategoryController {
    @get('/')
    // 获取所有类型
    async getCategories (ctx, next) {
        const categories = await getAllCategory()
        ctx.body = {
            categories
        }
    }
}