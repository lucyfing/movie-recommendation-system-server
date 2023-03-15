const mongoose = require('mongoose')
const Category = mongoose.model('Category')

const getAllCategory = async () => {
    const categories = await Category.find({}, {_id:1, name: 1})
    return categories
}

module.exports = {
    getAllCategory
}