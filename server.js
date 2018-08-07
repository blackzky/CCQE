/* jshint esversion: 6 */

(() => {
    'use strict';

    const VERSION = "v1.0.1";
    const PORT = 3000;
    const FOLDER_NAME = 'quiz';
    const FILE_EXTENSION = 'quiz';
    const ENCODING = 'utf8';

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
        console.log(`Cleancoder Exam Extractor (${VERSION}) running on port ${PORT}!`);
    });

    function handleExtractRoute(req, res) {
        let quiz = req.body.quiz;
        let filename = createFilename(quiz.title);
        let parsedQuiz = parseQuiz(quiz);
        let writeData = JSON.stringify(parsedQuiz);

        saveQuiz(
                filename,
                writeData)
            .then((parsedData) => {
                // Save file
                console.log('[Has existing data] Updating file...');
                return saveFile(filename, JSON.stringify(parsedData));
            }).then((result) => {
                console.log('RESULT: ', result);
                res.send(result);
            }).catch((err) => {
                console.log('[No existing data] Saving new file...');
                saveFile(
                        filename,
                        writeData)
                    .then((result) => {
                        console.log('RESULT: ', result);
                        res.send(result);
                    }).catch((err) => {
                        console.log('[ERROR] Failed to save quiz.');
                        console.log(err);
                        console.log('RESULT: ERROR');
                        res.send('ERROR');
                    })
            });
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

    function saveQuiz(filename, writeData) {
        return new Promise((resolve, reject) => {
            // Open file if it exist
            fs.readFile(filename, ENCODING, (err, readData) => {
                let updatedData = writeData;
                console.log('\n [New data] Cheking if file exist...');
                if (err) {
                    console.log('[Read file] ERROR: File does not exist');
                    return reject(err);
                }

                if (readData) {
                    console.log('[Read file] Existing data found');
                    updatedData = updateData(readData, writeData);
                    // Add new entries if
                } else {
                    console.log('[Read file] readData is null');
                }
                resolve(updatedData);
            });
        });
    }

    function updateData(currentData, newData) {
        let cData = JSON.parse(currentData);
        let nData = JSON.parse(newData);

        let updatedData = cData;
        console.log('[Read file] Existing number of quiz: ', cData.quizItems.length);

        let newEntries = 0;
        if (cData.title === nData.title) {
            for (let i in nData.quizItems) {
                // console.log(cData.quizItems[i].question);

                let found = cData.quizItems.find((quiz) => {
                    return quiz.question === nData.quizItems[i].question;
                });
                if (!found) {
                    newEntries++;
                    updatedData.quizItems.push(nData.quizItems[i]);
                }
            }
            console.log('[Update data] New entries added: ', newEntries);
        } else {
            console.log('[Updating data] ERROR: Title is not the same!');
            console.log('currentData: ', cData.title);
            console.log('newData: ', nData.title);
        }
        return updatedData;
    }

    function saveFile(filename, parsedData) {
        return new Promise(function (resolve, reject) {
            return fs.writeFile(filename, parsedData, (err) => {
                if (err) {
                    return console.log('[Write file] ERROR:', err);
                    return reject(err);
                }
                console.log(`[Write file] SUCCESS: Quiz saved to ${filename}`);
                resolve('DONE');
            });
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