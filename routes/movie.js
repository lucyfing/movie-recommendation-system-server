const { controller, get, post, put } = require('../lib/decorator')
const { 
    getAllMovies,
    getSingleMovie, 
    getRelativeMovies
} = require('../service/movie')

@controller('/movies')
export default class MovieController {
    @get('/')
    // 获取所有电影列表
    async getMovies (ctx, next) {
        const { type, year } = ctx.query
        const movies = await getAllMovies(type, year)
    
        ctx.body = {
            movies
        }
    }
  
    @get('/:id')
    // 获取单个电影信息
    async getMovieDetail (ctx, next) {
        const id = ctx.params.id
        const movie = await getSingleMovie(id)
        const relativeMovies = await getRelativeMovies(movie)

        ctx.body = {
            data: {
                movie,
                relativeMovies
            },
            success: true
        }
    }
}



// module.exports = router