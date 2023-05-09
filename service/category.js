const mongoose = require('mongoose')
const Category = mongoose.model('Category')
const utils = require('./utils')

// 获取所有类型名称
const getAllCategory = async () => {
    const categories = await Category.find({}, {_id:1, name: 1})
    return categories
}

// 获取类型列表
const getCategoryList = async (page, pageSize, name) => {
    const query = {}
    if(name) {
        query.name = name
    }
    const {list, currentPage, totalPages, totalData} = await utils.paginationList(Category, query, Number(page), Number(pageSize))
    return {list, currentPage, totalPages, totalData}
}

// 新增类型
const addCategory = async (name) => {
    const category = await Category.findOne({name})
    if(!category) {
        await Category.insertMany({name: name})
        return {
            success: true,
            message: '新类型创建成功'
        }
    }
    return {
        success: false,
        message: '该类型已存在'
    }
}

// 删除类型
const deleteCategory = async (_id) => {
    const result = await Category.deleteOne({_id})
    return result.deletedCount
}

// 获取所有类型及其关联电影数量
const getMovieLen = async () => {
    let moviesArr = await Category.find({},{name:1, movies:1})
    moviesArr = moviesArr.sort((a,b) => b.movies.length-a.movies.length)
    return moviesArr.map(movie => ({
        name: movie.name,
        len: movie.movies.length
    }))
}

module.exports = {
    getAllCategory,
    getCategoryList,
    addCategory,
    deleteCategory,
    getMovieLen
}