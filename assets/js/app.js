/*********** ALGORITHM ***********

Create a set of questions and matching answers. Arrays?Objects?
Select one answer as the correct answer.
Display question and answers to user. setInterval to 30 seconds
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

// Question constructor
function Question(question, answers, correctAnswer) {
    this.question = question;
    this.answers = answers;
    this.correctAnswer = correctAnswer;
}

var question1Answers = ['obama', 'bush', 'trump', 'clinton'];
var correctAnswer = 'trump';
var question1 = new Question('who is the president?', question1Answers, correctAnswer);

var triviaGame = {
    'gameLength': 20,
    'questions': [],
    'addQuestion': function(question) {
        this.questions.push(question);  
    },
    'loadQuestions': function () {
        for (var i = 0; i < this.gameLength; i++) {
//            $.ajax({
//                'url': 
//            })
        }
    },
    'startGame': function() {
        $('#start-button-div').toggle('slow');
    },
};

$('#start-button').on('click', function() {
    triviaGame.startGame();
});