//spotify client ID 2068d1e2fe424348b8b3fcf5a4554b06
//spotify client secret 62d6844d9f20430ba911bdffed904742
var client_id = '2068d1e2fe424348b8b3fcf5a4554b06';
var client_secret = '62d6844d9f20430ba911bdffed904742';
var SPOTIFY_BASE_URL = 'https://api.spotify.com/v1/';
var MUSIXMATCH_BASE_URL = 'http://api.musixmatch.com/ws/1.1/';
var MUSIXMATCH_API_KEY = '0fc0aa6919ea42060464b32ac6d9f687';

$('#js-search-form').submit(function(e) {
    e.preventDefault();
    var searchTerm = $(this).find('#js-band').val();

    $.getJSON(SPOTIFY_BASE_URL + "search", {
        q: searchTerm,
        type: 'artist'
    }, function(data) {
        if (!data.artists) {
            $('#js-search-results').html('<p>No results</p>');
            return;
        }

        var resultElement = '';

        if (data.artists) {
            data.artists.items.forEach(function (item) {
                resultElement += '<div class="panel panel-default" data-id="'+item.id+'"><div class="panel-heading" role="button">'+item.name+'</div></div>';
            });
        }

        $('#js-search-results').html(resultElement).on('click', '.panel', function () {
            if ($(this).find('table').length > 0) {
                return;
            }

            var resultsTable = $('#table-template').clone().removeAttr('id').removeClass('hidden').appendTo(this);

            for (var i = 0; i < 5; i++) {
                var row = '<tr><td>'+(i + 1)+'</td><td class="song-title" role="button"></td><td class="album-title"></td><td class="related-artists" role="button"></td></tr>';

                resultsTable.find('tbody').append(row);
            }

            ////// SONGS /////
            var artistId = $(this).data('id');

            var songQuery = {
                country: "US"
            };

            //creates the song list under the artist name
            $.getJSON(SPOTIFY_BASE_URL + "artists/" + artistId + "/top-tracks", songQuery, function (response) {
                for (var i = 0; i < response.tracks.length && i < 5; i++) {
                    var row = resultsTable.find('tbody').find('tr:nth-child('+(i+1)+')');

                    row.find('.song-title').text(response.tracks[i].name).attr('data-album', response.tracks[i].artists[0].name);
                }
            });

            ///// ALBUMS ////

            var albumQuery = {
                album_type: 'album',
                market: 'US'
            };

            $.getJSON(SPOTIFY_BASE_URL + "artists/" + artistId + "/albums", albumQuery, function (response) {
                for (var i = 0; i < response.items.length && i < 5; i++) {
                    var row = resultsTable.find('tbody').find('tr:nth-child('+(i+1)+')');

                    row.find('.album-title').text(response.items[i].name);
                }
            });

            ///// RELATED ARTISTS /////
            $.getJSON(SPOTIFY_BASE_URL+ "artists/" + artistId + "/related-artists", function(response){
                for (var i = 0; i < response.artists.length && i < 5; i++) {
                    var row = resultsTable.find('tbody').find('tr:nth-child('+(i+1)+')');

                    row.find('.related-artists').text(response.artists[i].name);
                }
            })
        });
    });
});


$('#js-search-results').on('click', '.song-title', function () {
    //getting the artist ID from musix match
    var songName = $(this).text();
    var artistName = $(this).data('album');

    $.ajax({
        type: "GET",
        data: {
            apikey:MUSIXMATCH_API_KEY,
            q_track:songName,
            q_artist:artistName,
            f_has_lyrics: 1,
            format:"jsonp"
        },
        url: "http://api.musixmatch.com/ws/1.1/track.search",
        dataType: "jsonp",
        jsonpCallback: '$callback',
        success: function(data) {
            $.ajax({
                type: "GET",
                data: {
                    apikey:MUSIXMATCH_API_KEY,
                    track_id: data.message.body.track_list[0].track.track_id,
                    f_has_lyrics: 1,
                    format:"jsonp"
                },
                url: "http://api.musixmatch.com/ws/1.1/track.lyrics.get?",
                dataType: "jsonp",
                jsonpCallback: '$callback',
                contentType: 'application/json',
                success: function(data) {
                    alert(data.message.body.lyrics.lyrics_body);
                }
            });

        }
    });
});

$('#js-search-results').on('click', '.related-artists', function(){
    var    relatedArtistName = $(this).text();

    $('#js-search-results').empty();
    $('#js-band').val(relatedArtistName);
    $('#js-search-form').trigger('submit');
})