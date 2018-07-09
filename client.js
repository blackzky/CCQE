/* jshint esversion: 6 */

$(() => {
    const VERSION = 'v1.0.0';
const SERVER_URL = 'http://localhost:3000/extract';

    const EXTRACT_BTN = `
        <button 
            id="extract-quiz" 
            style="
                position: absolute; 
                top: 10px; 
                left: 10px;
                z-index: 999">
            Extract Quiz
        </button>
    `;

    if (isSupported()) {
        addView();
    } else {
        console.log('Cleancoders exam extractor not supported');
    }

    function isSupported() {
        return location.pathname.indexOf("exam") != -1;
    }

    function addView() {
        $('body').append(EXTRACT_BTN);
        $('body').on('click', '#extract-quiz', extractQuiz);
    }

    function extractQuiz(e) {
        e.preventDefault();

        let quizData = {};
        quizData.title = $('header nav section hgroup h3').text();

        let quizItemsDOM = $('div.question-content');
        let quizItems = [];

        for (let i = 0; i < quizItemsDOM.length; i++) {
            let quizItem = {};
            quizItem.question = $(quizItemsDOM[i]).find('p').text();

            let choicesDOM = $(quizItemsDOM[i]).find('ul li label');
            quizItem.choices = [];

            for (let y = 0; y < choicesDOM.length; y++) {
                if ($(choicesDOM[y]).find('span.correct-answer').length > 0) {
                    quizItem.answer = separateData($(choicesDOM[y]).text());
                }
                quizItem.choices.push(separateData($(choicesDOM[y]).text()));
            }

            quizItems.push(quizItem);
        }
        quizData.quizItems = quizItems;

        console.log(quizData);

        sendQuiz({quiz: quizData});
    }

    function sendQuiz(quiz) {
        $.post(SERVER_URL, quiz).done((data) => {
            console.log('[DONE] Extracted quiz: ' + quiz.title);
        }).fail((err) => {
            console.log('[ERROR] Failed to process quiz: ' + quiz.title);
        });
    }

    function separateData(domText) {
        domText = domText.trim();
        let data = domText.split(':');

        if (data.length == 2) {
            return {
                letter: data[0].trim(),
                data: data[1].trim()
            }

        } else {
            return null;
        }
    }
    console.log('[Loaded] Cleancoders exam extractor script ready');
});

