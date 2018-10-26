
//Required files and modules
require("dotenv").config();

var keys = require('./keys.js');
var Spotify = require('node-spotify-api');
var request = require('request');
var fs = require("fs")

var moment = require('moment');
moment().format();

//Global vars
var userCommand = process.argv[2];
var userEntry = process.argv[3];

var tomatometer;
var imdbRating;

//userEntry can be multiple words long
for (var i = 4; i < process.argv.length; i++) {
    userEntry += ' ' + process.argv[i];
}

//Retreive keys from keys.js
var spotify = new Spotify(keys.spotify);

//Possible commands and LIRI triggers
var startLIRI = function(){
    if (userCommand === "concert-this"){
        getConcert()
    } else if (userCommand === "spotify-this-song"){
        getSpotify();
    } else if (userCommand === "movie-this"){
        getMovie();
    } else if (userCommand === "do-what-it-says"){
        doIt();
    } else {
        console.log("\n===> Error: enter a valid command <===\n\n- concert-this\n- spotify-this-song\n- movie-this\n- do-what-it-says\n")
    }
};

//When userCommand = concert-this
var getConcert = function (concertName){
    
    if (userEntry === undefined) {
        console.log("\nError: You have to search for a band!\n");
        return;
    } else {
        concertName = userEntry
    };

    console.log("\n===> Concert Search: " + concertName + " <===\n");

    var queryUrl = "https://rest.bandsintown.com/artists/" + concertName + "/events?app_id=e321c5df3b581205409373ce3eb9c448";

    request(queryUrl, function (error, response, body){

        if (!error && response.statusCode === 200) {

            var data = JSON.parse(body);

            console.log("\nThese are upcoming concerts by " + concertName.toUpperCase());

            for (var i = 0; i < data.length; i++) {

                var date = data[i].datetime;
                date = moment(date).format("MM/DD/YYYY");

                console.log("\nDate: " + date)

                console.log("Venue: " + data[i].venue.name);
                
                if (data[i].venue.region == "") {
                    console.log("Location: " + data[i].venue.city + ", " + data[i].venue.country);

                } else {
                    console.log("Location: " + data[i].venue.city + ", " + data[i].venue.region + ", " + data[i].venue.country);
                };
            }
            console.log("\n-----------------------------------\n");
        }
    })
};

//When userCommand = spotify-this-song
var getSpotify = function (songName) {

    if (userEntry === undefined) {
        songName = "The Sign Ace of Base";
    } else {
        songName = userEntry
    };

    console.log("\n===> Song Search: " + songName + " <===\n");

    spotify.search(
        {
            type: "track",
            query: songName
        },
        function (err, data) {
            if (err) {
                console.log("Error occurred: " + err);
                return;
            }
            var songs = data.tracks.items;

            for (let i = 0; i < songs.length; i++) {
                console.log(i);
                console.log("Artist: " + songs[i].artists[0].name);
                console.log("Song: " + songs[i].name);
                console.log("Album: " + songs[i].album.name);
                console.log("Preview: " + songs[i].preview_url);
                console.log("\n-----------------------------------\n");
            }
        }
    );
};

//When userCommand = movie-this
var getMovie = function (movieName){

    if (userEntry === undefined) {
        movieName = "Mr. Robot";
    } else {
        movieName = userEntry
    };

    console.log("\n===> Movie Search: " + movieName + " <===\n");

    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&tomatoes=true&apikey=trilogy";

    request(queryUrl, function (error, response, body) {

        if (!error && response.statusCode === 200) {

            var data = JSON.parse(body);

            for (i = 0; i < data.Ratings.length; i++) {
                if (data.Ratings[i].Source === "Rotten Tomatoes") {
                    tomatometer = data.Ratings[i].Value;
                }
                if (data.Ratings[i].Source === "Internet Movie Database") {
                    imdbRating = data.Ratings[i].Value;
                }
            }

            console.log("Title: " + data.Title);
            console.log("Release Year: " + data.Year);
            console.log("IMdB Rating: " + imdbRating);
            console.log("Tomatometer: " + tomatometer);
            console.log("Country: " + data.Country);
            console.log("Language: " + data.Language);
            console.log("Plot: " + data.Plot);
            console.log("Actors: " + data.Actors);
            console.log("\n-----------------------------------\n");

        } else {
            console.log("Something went wrong :(\n")
        }
    })
};

var doIt = function(){
    fs.readFile("random.txt", "utf8", function(err, data) {
        if (err) {
          return console.log(err);
        }

        doItEntry = data.split(",")

        userCommand = doItEntry[0];
        userEntry = doItEntry[1];

        startLIRI();
    });
};

startLIRI();