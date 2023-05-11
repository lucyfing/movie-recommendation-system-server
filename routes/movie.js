import _ from 'lodash'

const { controller, get, post, put, del } = require('../lib/decorator')
const { 
    getAllMovies,
    getAllcountry,
    getAllLanguage,
    getFilterMovieList,
    deleteMovies,
    queryMovie,
    recommendSomeMovies,
    recommendAllMovies
} = require('../service/movie')

const {
    getRedis,
    setRedis
} = require('../service/utils/redis')

@controller('/movies')
export default class MovieController {
    @get('/')
    // 获取所有电影列表
    async getMovies (ctx, next) {
        const { type, year, page, pageSize } = ctx.query
        const {movies, currentPage, totalPages, totalMovies} = await getAllMovies(type, year, Number(page), Number(pageSize))
        ctx.body = {
            movies,
            currentPage,
            totalPages,
            totalMovies
        }
    }

    @get('/countries')
    // 获取所有的上映地区
    async getCountries (ctx, next) {
        const countries = await getAllcountry()
        ctx.body = {
            countries
        }
    }

    @get('/languages')
    // 获取所有的语言
    async getLanguages (ctx, next) {
        const languages = await getAllLanguage()
        ctx.body = {
            languages
        }
    }

    @get('/filterMovies')
    // 获取过滤后的电影
    async getFilterMovies (ctx, next) {
        const {name, rate, countries, languages, page, pageSize} = ctx.query
        const {movies, currentPage, totalPages, totalMovies} = await getFilterMovieList(name, rate, countries, languages, Number(page), Number(pageSize))
        ctx.body = {
            movies,
            currentPage,
            totalPages,
            totalMovies
        }
    }

    @del('/deleteMovies')
    // 删除电影
    async delMovies (ctx, next) {
        const {doubanIds} = ctx.query
        const deletedCount = await deleteMovies(doubanIds.split(','))
        ctx.body = {
            deletedCount
        }
    }

    @post('/recommendMovies')
    // 详情推荐
    async recommendSomeMovies (ctx, next) {
        const {_id, doubanId} = ctx.request.body
        let movies
        if(_id) {
            movies = await getRedis(_id)
            movies = movies.slice(0, 10)
        }
        else {
            movies = await recommendSomeMovies(_id, doubanId)
        }
        return (ctx.body = {
            movies
        })
    }

    @post('/recommendAllMovies')
    // 个性化推荐
    async recommendAllMovies (ctx, next) {
        const {_id} = ctx.request.body
        if(_id) {
            const movies = await getRedis(_id)
            if(movies) {
                return (ctx.body = {movies})
            }
        }
        const movies = await recommendAllMovies(_id)
        if(_id) setRedis(_id, movies)
        return (ctx.body = {
            movies
        })
    }
  
    @get('/queryMovies')
    // 查询电影
    async queryMovieList (ctx, next) {
        const {name} = ctx.query
        const movieList = await queryMovie(name)
        return (ctx.body = {
            movieList
        })
    }

}