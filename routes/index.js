var express = require('express');
var router = express.Router();
var config = require('../config/config.js');
var request = require('request');
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');

var connection = mysql.createConnection(config.db);
connection.connect((error)=>{
	console.log(error);
});

const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key='+ config.apiKey
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';
const anyMovie = 'https://api.themoviedb.org/3/search/movie?api_key=' + config.apiKey + '&query='

/* GET home page. */
router.get('/', function(req, res, next) {
	var message = req.query.msg;
	request.get(nowPlayingUrl, (error, response, movieData)=>{
		var parsedData = JSON.parse(movieData);
		// console.log(parsedData);
		res.render('index', { 
			parsedData: parsedData.results,
			imageBaseUrl: imageBaseUrl,
			message: message 
		});
	});
 	// res.render('index', { title: 'Express' }); // REMOVE (or comment out) THIS LINE!!
});

router.post('/search', (req, res)=>{
	var userSearch = req.body.movieIdSearch;
	request.get(anyMovie + userSearch, (error, response, movieData)=>{
		var parsedData = JSON.parse(movieData);
		res.render('index', {
			parsedData: parsedData.results,
			imageBaseUrl: imageBaseUrl,
			message: ''
		});
	});
	
});

router.get('/register', (req, res, next)=>{
	res.render('register', {});
});

router.get('/login', (req, res, next)=>{
	res.render('login', {});
});

router.post('/loginProcess', (req, res, next)=>{
	var email = req.body.email;
	var password = req.body.password;
	// Check to see if the user is in the database:
	var selectQuery = "SELECT * FROM users WHERE email = ?";
	connection.query(selectQuery, [email], (error, results)=>{
		if(results.length == 0){ // user not in DB
			res.redirect('/login?msg=Not In System');
		}else{ // email in DB, check if password matches
			// compareSync takes 2 args and returns boolean:
			// 1. the english password
			// 2. the hashed password in the DB we want to check against
			var doTheyMatch = bcrypt.compareSync(password, results[0].password);
			if(doTheyMatch){
				res.redirect('/?msg=Logged In');
			}else{
				res.redirect('/?msg=Passwords Do Not Match');
			}
		}
	});
});


router.post('/registerProcess', (req, res, next)=>{
	// res.json(req.body);
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	// convert the English password to a bcrypt hash
	var hash = bcrypt.hashSync(password);

	const selectQuery = "SELECT * FROM users WHERE email = ?;";
	connection.query(selectQuery, [email], (error, results)=>{
		if(results.length == 0){ // user is not in DB
			var insertQuery = "INSERT INTO users (name, email, password) VALUES (?, ?, ?);";
			connection.query(insertQuery, [name, email, hash], (error, results)=>{
				if(error){
					throw error;
				}else{
					res.redirect('/?msg=registered');
				}
			});
		}else{ // user exists in DB
			res.redirect('/?msg=already in DB');
		}
	});
});

module.exports = router;