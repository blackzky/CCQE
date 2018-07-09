/* jshint esversion: 6 */

(() => {
    'use strict';

    const VERSION = "v1.0.0";
    const PORT = 3000;
    const FOLDER_NAME = 'quiz';
    const FILE_EXTENSION = 'quiz';

    const fs = require('fs');
    const express = require('express');
    const bodyParser = require('body-parser');
    const app = express();


    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({
        extended: true
    })); // support encoded bodies
    app.use(setCORS);

    app.post('/extract', handleExtractRoute);

    app.listen(PORT, () => {
        console.log(`Cleancoder Exam Extractor (v${VERSION}) running on port ${PORT}!`);
    });

    function handleExtractRoute(req, res) {
        let quiz = req.body.quiz;
        let filename = createFilename(quiz.title);
        let writeData = parseQuiz(quiz);

        saveQuiz(res, filename, JSON.stringify(writeData))
    }

    function parseQuiz(quiz) {
        let writeData = {};
        writeData.title = sanitizeFilename(quiz.title);
        writeData.quizItems = [];

        for (let i = 0; i < quiz.quizItems.length; i++) {
            let quizItem = {};

            quizItem.question = quiz.quizItems[i].question;
            quizItem.choices = [];

            for (let y = 0; y < quiz.quizItems[i].choices.length; y++) {
                quizItem.choices.push({
                    letter: quiz.quizItems[i].choices[y].letter,
                    data: quiz.quizItems[i].choices[y].data
                });
            }

            quizItem.answer = {
                letter: quiz.quizItems[i].answer.letter,
                data: quiz.quizItems[i].answer.data
            };

            writeData.quizItems.push(quizItem);
        }

        return writeData;
    }

    function saveQuiz(res, filename, data) {
        fs.writeFile(filename, data, (err) => {
            if (err) {
                return console.log(err);
            }

            console.log(`Quiz saved to ${filename}`);
            res.send('DONE');
        });
    }

    function createFilename(title) {
        return `${FOLDER_NAME}/${sanitizeFilename(title)}.${FILE_EXTENSION}`;
    }

    function sanitizeFilename(text) {
        return text.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }
    
    function setCORS(req, res, next) {

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', 'https://cleancoders.com');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET POST');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        // Pass to next layer of middleware
        next();
    }

})();

// TODO: Load existing quiz and append new data