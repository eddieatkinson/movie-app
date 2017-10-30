var express = require('express');
var router = express.Router();
var config = require('../config/config.js');
var request = require('request');

const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key='+ config.apiKey
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';
const anyMovie = 'https://api.themoviedb.org/3/search/movie?api_key=' + config.apiKey + '&query='

/* GET home page. */
router.get('/', function(req, res, next) {
	request.get(nowPlayingUrl, (error, response, movieData)=>{
		var parsedData = JSON.parse(movieData);
		console.log(parsedData);
		res.render('index', { 
			parsedData: parsedData.results,
			imageBaseUrl: imageBaseUrl 
		});
	});
 	// res.render('index', { title: 'Express' }); // REMOVE (or comment out) THIS LINE!!
});

router.post('/search', (req, res)=>{
	var userSearch = req.body.movieIdSearch;
	request.get(anyMovie + userSearch, (error, response, movieData)=>{
		var parsedData = JSON.parse(movieData);
		res.render('search', {
			dataForPosters: parsedData.results,
			imageBaseUrl: imageBaseUrl
		});
	});
	
});

module.exports = router;
