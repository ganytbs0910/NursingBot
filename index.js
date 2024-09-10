"use strict";

const express = require("express");
const line = require("@line/bot-sdk");
const ngrok = require("ngrok");
const config = require("./config");
const userState = require("./userState");
const miniGame = require("./miniGame");
const nursingNews = require("./nursing-news");  // 新しいモジュールをインポート
const analysis = require("./analysis");
const quiz = require("./quiz");
const path = require('path');
const nursingDiary = require("./nursingDiary");
const app = express();
const PORT = process.env.PORT || 3000;

app.use('/images', express.static(path.join(__dirname, 'images')));
app.post("/webhook", line.middleware(config), (req, res) => {
    console.log(req.body.events);

    Promise.all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error("Error in handleEvent:", err);
            res.status(500).end();
        });
});

const client = new line.Client(config);

async function handleEvent(event) {
    if (event.type !== "message" && event.type !== "postback") {
        return Promise.resolve(null);
    }

    const userId = event.source.userId;
    const state = userState.getState(userId);
    let text = event.type === "message" ? event.message.text : event.postback.data;

    let replyMessage;

    switch (text) {
        case '育成ミニゲーム':
            replyMessage = miniGame.getMiniGameMessage();
            break;
        case '看護ニュース':  // 「ナース運勢占い」を「看護ニュース」に変更
            replyMessage = await nursingNews.getNursingNewsMessage(state);  // 非同期関数に変更
            break;
        case 'あなたの分析':
            replyMessage = analysis.getAnalysisMessage();
            break;
        case '医療知識クイズ':
            replyMessage = quiz.getQuizMessage(state);
            break;
        case '看護日記':
            replyMessage = nursingDiary.getDiaryPrompt();
            break;
        default:
            if (text.startsWith('miniGame:')) {
                replyMessage = miniGame.handleMiniGameSelection(text, state);
            } else if (text.startsWith('activity:')) {
                replyMessage = analysis.handleActivitySelection(text, state);
            } else if (text.startsWith('クイズ回答:')) {
                replyMessage = quiz.handleQuizAnswer(text, state);
            } else if (text.startsWith('日記:')) {
                replyMessage = nursingDiary.handleDiaryEntry(text.substring(3), state);
            } else {
                replyMessage = getDefaultMessage();
            }
    }

    return client.replyMessage(event.replyToken, replyMessage);
}

function getDefaultMessage() {
    return {
        type: 'text',
        text: '以下のいずれかの機能を選んでください：\n・育成ミニゲーム\n・看護ニュース\n・あなたの分析\n・医療知識クイズ\n・看護日記'
    };
}

app.listen(PORT, async () => {
    console.log(`Server running at ${PORT}`);

    try {
        const url = await ngrok.connect(PORT);
        console.log(`ngrok tunnel created at: ${url}`);
        console.log(`Webhook URL: ${url}/webhook`);
    } catch (err) {
        console.error("Error creating ngrok tunnel:", err);
        process.exit(1);
    }
});