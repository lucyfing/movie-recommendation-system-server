/************ 补充top250电影的详细信息并根据类型生成电影类型表并插入数据库 *************/


const rp = require('request-promise-native')
const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const Category = mongoose.model('Category')

;(async () => {
  let movies = await Movie.find({
    $or: [
      {description: {$exists: false}},
      {description: null},
      {year: {$exists: false}},
      {description: ''}
    ]
  }).exec();
  require('../crawler/data/movies-detail-list');
  require('../crawler/data/movies-video-list');

  for(let i=30; i<130; i++) {
    let movie = movies[i];
    movie.description = globalThis.movieDetailList[i].description;
    movie.year = Number(globalThis.movieDetailList[i].year);
    movie.movieTypes = globalThis.movieDetailList[i].movieTypes;
    movie.languages = globalThis.movieDetailList[i].languages;
    movie.countries = globalThis.movieDetailList[i].countries;
    movie.actors = globalThis.movieDetailList[i].actors;
    movie.directors = globalThis.movieDetailList[i].directors;
    movie.video = globalThis.movieVideoList[i].video;
    for(let i=0; i<movie.movieTypes.length; i++) {
        let item = movie.movieTypes[i]
        let cat = await Category.findOne({
          name: item
        })

        if(!cat) {
          cat = new Category({
            name: item,
            movies: [movie._id]
          })
        } else {
          if(cat.movies.indexOf(movie._id) === -1) {
            cat.movies.push(movie._id)
          }
        }

        await cat.save()

        if(!movie.category) {
          movie.category.push(cat._id)
        } else {
          if(movie.category.indexOf(cat._id) === -1) {
            movie.category.push(cat._id)
          }
        }
      }

      let pubdates = [] // 电影出版时间
      pubdates.push({
        date: new Date(movie.year),
        countries: movie.countries
      })
      movie.pubdate = pubdates
      await movie.save()
  }
})();








