const mongoose = require('mongoose')
const Category = mongoose.model('Category')

// 获取所有类型列表
const getAllCategory = async () => {
    const categories = await Category.find({}, {_id:1, name: 1})
    return categories
}

module.exports = {
    getAllCategory
}