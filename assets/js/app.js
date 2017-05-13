/*********** ALGORITHM ***********

- Get a list of 20 popular movies from themovieDB.org
- Get 1 of the 20 movies as a question using RNG.
- Set question display to movie's plot/description.
- Push movie title to currentAnswers.
- Get cast for the currentMovie.
- Get lead actor/actress ID from cast response.
- Get IMDB_ID using person's themovieDB id.
- Use IMDB_ID to get data from ext. source: imdb.
- Get top 3 movies the person is known for, push to currentAnswers.
- Display the 4 answers in random order using RNG.

IF timer hits 0 seconds:
    THEN - Wrong answer function
            Change display to notify user that they ran out of time. Increment wrong guesses(?)
            setTimeout to change display to new question after a few seconds
IF answer is wrong:
    THEN - Wrong answer function
            Change display to notify user that they guessed wrong. Increment wrong guesses
            setTimeout to change display to new question after a few seconds
IF answer is right:
    THEN - Right answer function
            Change display to notify user that they guessed correct. Increment right guesses
            setTimeout to change display to new question after a few seconds

**********************************/


var TriviaGame = {
    // used to set how many movies (questions) to grab in ajax request
    'gameLength': 20,
    'playCount': 0,
    'questionNum': 1,
    'timeLeft': 30,
    'displayClockInterval': '',
    'questionTimer': '',
    'newQuestionDelay': '',
    // APIKey for themoviedb.org
    'APIKey': 'a7f81ba434e0b69771bbcc1977a29d87',
    'ajaxSettings': {
        "async": true,
        "crossDomain": true,
        "url": "",
        "method": "GET",
        "headers": {},
        "data": "{}"
    },
    // used to store data from init ajax request
    'questions': {},
    // used to store current question
    'currentQuestion': {},
    'currentPersonId': '',
    'currentAnswers': [],
    'correctAnswers': 0,
    'wrongAnswers': 0,
    // used to store already asked questions
    'askedQuestions': [],
    // reset game to prepare for restart
    'gameReset': function () {
        $('#results').toggle('fast');
        TriviaGame.questionNum = 1;
        TriviaGame.questions = {};
        TriviaGame.correctAnswers = 0;
        TriviaGame.wrongAnswers = 0;
        TriviaGame.askedQuestions = [];
    },
    // gets movie data from themoviedb.org
    'getQuestions': function () {
        var url = "https://api.themoviedb.org/3/movie/popular?region=us&page=1&language=en-US&api_key=" + TriviaGame.APIKey;
        TriviaGame.ajaxSettings.url = url;

        $.ajax(TriviaGame.ajaxSettings).done(function (response) {
            //console.log(response);
            TriviaGame.questions = response;
            TriviaGame.newQuestion();
        });
    },
    // queues a new random trivia question
    'newQuestion': function () {
        TriviaGame.resetCurrent();
        // generate random number, keep generating until you get a movie question that hasn't been asked already
        do {
            var randNum = Math.floor(Math.random() * TriviaGame.gameLength);
            // set currentQuestion using rng from questions prop
            TriviaGame.currentQuestion = TriviaGame.questions.results[randNum];
        } while (TriviaGame.askedQuestions.includes(TriviaGame.currentQuestion) && TriviaGame.askedQuestions.length < TriviaGame.questions.results.length);

        // push the newly generated movie question to askedQuestions
        TriviaGame.askedQuestions.push(TriviaGame.currentQuestion);
        // push title from currentQuestion into currentAnswers
        TriviaGame.currentAnswers.push(TriviaGame.currentQuestion.title);
        // get the cast for the movie in currentQuestion
        TriviaGame.getCast();
    },
    // gets the cast for currentQuestion movie
    'getCast': function () {
        // get movieId, use movieId for new ajax request to get cast of movie
        var movieId = TriviaGame.currentQuestion.id;
        var url = "https://api.themoviedb.org/3/movie/" + movieId + "/credits?api_key=" + TriviaGame.APIKey;
        TriviaGame.ajaxSettings.url = url;

        $.ajax(TriviaGame.ajaxSettings).done(function (response) {
            // gets the id from whoever is at the top of the cast list, passes
            // the id to getIMDB() method
            TriviaGame.currentPersonId = response.cast[0].id;
            TriviaGame.getIMDB(TriviaGame.currentPersonId);
        });
    },
    'getIMDB': function (personId) {
        var url = "https://api.themoviedb.org/3/person/" + personId + "/external_ids?language=en-US&api_key=" + TriviaGame.APIKey;
        TriviaGame.ajaxSettings.url = url;

        $.ajax(TriviaGame.ajaxSettings).done(function (response) {
            // pass the imdb_id to getAnswers() 
            TriviaGame.getAnswers(response.imdb_id);
        });
    },
    // gets answers for currentQuestion - uses imdb_id to get 3 movies the person is known for, push them into currentAnswers
    'getAnswers': function (imdbId) {
        var url = "https://api.themoviedb.org/3/find/" + imdbId + "?external_source=imdb_id&language=en-US&api_key=" + TriviaGame.APIKey;
        TriviaGame.ajaxSettings.url = url;

        // request data from imdb using actor's imdb_id
        $.ajax(TriviaGame.ajaxSettings.url).done(function (response) {

            var knownFor = response.person_results[0].known_for;
            for (var i = 0; i < knownFor.length; i++) {
                var t = knownFor[i].title;
                // makes sure there's no duplicate answers
                if (TriviaGame.currentAnswers.indexOf(t) === -1) {
                    TriviaGame.currentAnswers.push(t);
                }
            }
            // if currentAnswers has 4 elements, good to go
            // if there's less than 4, calls getAnotherMovie() to grab a random movie with the same actor
            if (TriviaGame.currentAnswers.length === 4) {
                console.log('timer set');
                TriviaGame.setTimers();
                TriviaGame.updateUI();
            } else if (TriviaGame.currentAnswers.length < 4) {
                TriviaGame.getAnotherMovie();
            } else {
                console.log('quit breaking stuff');
            }

        });
    },
    // gets called if not enough answers, find an extra movie with specified actor
    'getAnotherMovie': function () {
        TriviaGame.ajaxSettings.url = "https://api.themoviedb.org/3/person/" + TriviaGame.currentPersonId + "/movie_credits?language=en-US&api_key=" + TriviaGame.APIKey;

        $.ajax(TriviaGame.ajaxSettings).done(function (response) {
            var mvArr = response.cast;
            while (TriviaGame.currentAnswers.length < 4) {
                var rng = Math.floor(Math.random() * mvArr.length);
                var newMov = mvArr[rng].title;
                if (TriviaGame.currentAnswers.indexOf(newMov) === -1) {
                    TriviaGame.currentAnswers.push(newMov);
                }
            }
            TriviaGame.setTimers();
            TriviaGame.updateUI();
        });

    },
    'shuffle': function (array) {
        var count = array.length;
        
        // while still elements in array
        while (count > 0) {
            // pick random i
            var i = Math.floor(Math.random() * count);
            
            // decrement count
            count--;
            
            // swap
            var temp = array[count];
            array[count] = array[i];
            array[i] = temp;
        }
        
        return array;
    },
    'updateUI': function () {
        var q = this.currentQuestion.overview;
        var t = TriviaGame.currentQuestion.title;
        // if the movie's plot contains the title of the movie, use RegExp to replace any instance of the title with '--------'
        if (q.includes(t)) {
            var regex = new RegExp(t, 'gi');
            q = q.replace(regex, '----------');
        }
        $('#question').html(q);
        
        var shuffledArray = TriviaGame.shuffle(TriviaGame.currentAnswers);
        // update display with possible answers
        $.each(shuffledArray, function (i, v) {
            $('#radio-' + (i + 1)).attr('value', v);
            $('#answer-' + (i + 1)).html(v);
        });
        $('#question-num').html(this.questionNum);
        TriviaGame.questionNum++;
    },
    // set timers. setInterval for display clock so user knows how much time is left
    // setTimeout to move onto the next question if they run out of time
    setTimers: function () {
        TriviaGame.displayClockInterval = setInterval(function () {
            TriviaGame.timeLeft--;
            $('#time-remaining').html(TriviaGame.timeLeft);
        }, 1000);

        TriviaGame.questionTimer = setTimeout(function () {
            // if they run out of time, pass empty string to checkAnswer() so that they get the question wrong
            TriviaGame.checkAnswer('');
        }, 30200);
    },
    // check if they answered right or wrong
    'checkAnswer': function (selectedAnswer) {
        if (selectedAnswer === this.currentQuestion.title) {
            this.correctAnswers++;
            $('#answer-btn').toggle(50);
            $('#right-or-wrong').html('Correct!');
        } else {
            this.wrongAnswers++;
            $('#answer-btn').toggle(50);
            $('#right-or-wrong').html('Wrong!');
        }
        // clear the intervals for the 2 timers
        clearInterval(TriviaGame.questionTimer);
        clearInterval(TriviaGame.displayClockInterval);

        // if there are questions remaining, get a newQuestion (at a delay of 2 seconds)
        if (TriviaGame.askedQuestions.length < TriviaGame.questions.results.length) {
            TriviaGame.newQuestionDelay = setTimeout(TriviaGame.newQuestion, 2000);
        } else if (TriviaGame.askedQuestions.length === TriviaGame.questions.results.length) {
            // if there are no more questions, display their results/score
            TriviaGame.results();
        } else {
            // error...
            console.log('wtf did you do... refresh your browser');
        }

    },
    // resets all of the current... properties to prepare for next question
    'resetCurrent': function () {
        $('#answer-btn').show('fast');
        console.log('new ? timer cleared');
        clearInterval(TriviaGame.newQuestionDelay);
        this.currentQuestion = {};
        this.currentPersonId = '';
        this.currentAnswers = [];
        // uncheck all radio buttons
        $("input:radio[name='answer']").each(function (i) {
            this.checked = false;
        });
        $('#right-or-wrong').html('');
        // reset timer display
        TriviaGame.timeLeft = 30;
        $('#time-remaining').html(TriviaGame.timeLeft);
    },
    'results': function () {
        var c = TriviaGame.correctAnswers;
        var w = TriviaGame.wrongAnswers;
        var l = TriviaGame.gameLength;
        var s = (c / l) * 100;

        $('#start-button-div').toggle('slow');
        $('#results').toggle('slow');
        $('#question-area').toggle('fast');
        $('#right-or-wrong').html('');
        $('#correct-results').html(c);
        $('#wrong-results').html(w);
        $('#score').html(s + '%');
    },
    'startGame': function () {
        $('#start-button-div').toggle('slow');
        this.getQuestions();
        $('#question-area').show('fast');
        //$('.question-num-h3').toggle('slow');
        //$('.answer-h2').toggle('slow');
        //$('#answers').toggle('slow');
        $('#time-clock').show('slow');
    },
};

$('#start-btn').on('click', function () {
    if (TriviaGame.playCount === 0) {
        TriviaGame.playCount++;
        TriviaGame.startGame();
    } else {
        TriviaGame.gameReset();
        TriviaGame.playCount++;
        TriviaGame.startGame();
    }
});

$('#answer-btn').on('click', function (e) {
    e.preventDefault();
    var selectedAnswer = $('#answers-form').serialize();
    selectedAnswer = selectedAnswer.split('=');
    selectedAnswer = selectedAnswer[1].replace(/%20/g, ' ');
    selectedAnswer = selectedAnswer.replace(/%3A/g, ':');
    console.log(selectedAnswer);
    TriviaGame.checkAnswer(selectedAnswer);
});
