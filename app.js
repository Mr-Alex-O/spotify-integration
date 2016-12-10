//spotify client ID 2068d1e2fe424348b8b3fcf5a4554b06
//spotify client secret 62d6844d9f20430ba911bdffed904742
var client_id = '2068d1e2fe424348b8b3fcf5a4554b06';
var client_secret = '62d6844d9f20430ba911bdffed904742';
var SPOTIFY_BASE_URL = 'https://api.spotify.com/v1/';
var MUSIXMATCH_BASE_URL = 'http://api.musixmatch.com/ws/1.1/';
var MUSIXMATCH_API_KEY = '0fc0aa6919ea42060464b32ac6d9f687';

function getDataFromApi(searchTerm, callback) {
    var query = {
        q: encodeURIComponent(searchTerm).replace(/%20/g, " "),
        type: 'artist'
    }
    $.getJSON(SPOTIFY_BASE_URL + "search", query, callback);
}

function displaySpotifySearchData(data) {

    var resultElement ='';

    if (data.artists) {
        data.artists.items.forEach(function (item) {
            resultElement += '<div data-id="' + item.id + '" style="margin-bottom: 15px">Top five tracks for ' + item.name + '<br><ol class="top-songs"></ol></div>';
        });
    } else {
        resultElement += '<p>No results</p>';
    }

    $('.js-search-results').html(resultElement).on('click', 'div', function () {

        var songResults = $(this).find('.top-songs');
        songResults.empty();
        var artistId = $(this).data('id');

        var query = {
            country: "US"
        }

        //creates the song list under the artist name
        $.getJSON(SPOTIFY_BASE_URL + "artists/" + artistId + "/top-tracks", query, function (response) {
            for (var i = 0; i < response.tracks.length && i < 5; i++) {
                songResults.append('<li class="song">' + response.tracks[i].name + '</li>');

            }

            $('.top-songs').on('click', 'li', function () {
                //getting the artist ID from musix match
                var songName = $(this).text();
                var artistName = response.tracks[i].artists[0].name;




                $.ajax({
                    type: "GET",
                    data: {
                        apikey:MUSIXMATCH_API_KEY,
                        q_track:songName,
                        q_artist:artistName,
                        f_has_lyrics: 1,
                        format:"jsonp",
                        callback:"jsonp_callback"
                    },
                    url: "http://api.musixmatch.com/ws/1.1/track.search",
                    dataType: "jsonp",
                    jsonpCallback: 'jsonp_callback',
                    contentType: 'application/json',
                    success: function(data) {

                        $.ajax({
                            type: "GET",
                            data: {
                                apikey:MUSIXMATCH_API_KEY,
                                track_id: data.message.body.track_list[0].track.track_id,
                                f_has_lyrics: 1,
                                format:"jsonp",
                                callback:"jsonp_callback"
                            },
                            url: "http://api.musixmatch.com/ws/1.1/track.lyrics.get?",
                            dataType: "jsonp",
                            jsonpCallback: 'jsonp_callback',
                            contentType: 'application/json',
                            success: function(data) {
                                console.log(data);
                                alert.clear;
                                alert(data.message.body.lyrics.lyrics_body);
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                //console.log(jqXHR);
                                //console.log(textStatus);
                                //console.log(errorThrown);
                            }
                        });

                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        //console.log(jqXHR);
                        //console.log(textStatus);
                        //console.log(errorThrown);
                    }
                });
            });
        });

    });


}




function watchSubmit() {
    $('#js-search-form').submit(function(e) {
        e.preventDefault();
        var query = $(this).find('#js-band').val();
        
        getDataFromApi(query, displaySpotifySearchData);
    })
}

watchSubmit();
