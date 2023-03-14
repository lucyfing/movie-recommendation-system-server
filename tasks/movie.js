/************ 将top250电影的封面信息写入数据库 *************/
const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')

;(async () => {
  require('../crawler/data/movies-list');
  globalThis.moviesList.forEach(async item => {
    let movie = await Movie.findOne({
      doubanId: item.doubanId
    });

    if(!movie) {
      movie = new Movie(item);
      await movie.save();
    }
  })
})();