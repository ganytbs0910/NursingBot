"use strict";

const express = require("express");
const line = require("@line/bot-sdk");
const ngrok = require("ngrok");
const config = require("./config");
const userState = require("./userState");
const miniGame = require("./miniGame");
const nursingNews = require("./nursing-news");
const quiz = require("./quiz");
const path = require('path');
const nursingDiary = require("./nursingDiary");
const timecapsule = require('./timecapsule');
const app = express();
const PORT = process.env.PORT || 3000;

app.use('/images', express.static(path.join(__dirname, 'images')));

const client = new line.Client(config);

// タイムカプセルの定期チェックをスケジュール
timecapsule.scheduleTimeCapsuleChecks(client);

app.post("/webhook", line.middleware(config), (req, res) => {
    console.log(req.body.events);

    Promise.all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error("Error in handleEvent:", err);
            res.status(500).end();
        });
});

async function handleEvent(event) {
    if (event.type !== "message" && event.type !== "postback") {
        return Promise.resolve(null);
    }

    const userId = event.source.userId;
    const state = userState.getState(userId);
    let text = event.type === "message" ? event.message.text : event.postback.data;

    let replyMessage;

    try {
        // ユーザーアクション時にタイムカプセルをチェック
        await timecapsule.checkAndNotifyOpenCapsules(client);

        switch (text) {
            case '育成ミニゲーム':
                replyMessage = miniGame.getMiniGameMessage();
                break;
            case '看護ニュース':
                replyMessage = await nursingNews.getNursingNewsMessage(state);
                break;
            case '医療知識クイズ':
                replyMessage = quiz.getQuizMessage(state);
                break;
            case 'クイズをリセット':
                replyMessage = quiz.resetQuiz(state);
                break;
            case '次の問題':
                replyMessage = quiz.getQuizMessage(state);
                break;
            case '看護日記':
                replyMessage = nursingDiary.getDiaryOptions();
                break;
            case 'diary_write':
                replyMessage = nursingDiary.writeDiaryPrompt();
                state.diaryState = { action: 'write' };
                break;
            case 'diary_review':
                replyMessage = nursingDiary.reviewDiaryPrompt();
                state.diaryState = { action: 'review' };
                break;
            case 'タイムカプセル':
            case 'timecapsule_menu':
                replyMessage = timecapsule.getTimeCapsuleOptions();
                break;
            case 'timecapsule_check':
                const pendingCapsules = await timecapsule.checkPendingCapsules(userId);
                if (pendingCapsules.length === 0) {
                    replyMessage = { type: 'text', text: '現在、埋められているタイムカプセルはありません。' };
                } else {
                    replyMessage = { type: 'text', text: '埋められているタイムカプセル:\n' + pendingCapsules.join('\n') };
                }
                break;
            case 'timecapsule_bury':
                replyMessage = timecapsule.getBuryOptions();
                break;
            case 'timecapsule_bury_more':
                replyMessage = timecapsule.getBuryOptionsMore();
                break;
            case 'timecapsule_review':
                const openCapsules = await timecapsule.getOpenCapsules(userId);
                if (openCapsules.length === 0) {
                    replyMessage = { type: 'text', text: '開封可能なタイムカプセルはありません。' };
                } else {
                    const messages = openCapsules.map(capsule =>
                        `${new Date(capsule.createdAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}のメッセージ:\n${capsule.message}`
                    );
                    replyMessage = { type: 'text', text: '開封されたタイムカプセル:\n\n' + messages.join('\n\n') };
                }
                break;
            default:
                if (state.diaryState && state.diaryState.action === 'write') {
                    replyMessage = await nursingDiary.handleDiaryEntry(userId, text);
                    state.diaryState = null;
                } else if (state.diaryState && state.diaryState.action === 'review') {
                    replyMessage = await nursingDiary.getDiaryEntry(userId, text);
                    state.diaryState = null;
                } else if (text.startsWith('timecapsule_bury_')) {
                    const duration = text.replace('timecapsule_bury_', '');
                    state.timecapsuleState = { action: 'bury', duration: duration };
                    replyMessage = { type: 'text', text: `${duration}に開封するタイムカプセルのメッセージを入力してください。` };
                } else if (state.timecapsuleState && state.timecapsuleState.action === 'bury') {
                    const openDate = await timecapsule.createTimeCapsule(userId, text, state.timecapsuleState.duration);
                    replyMessage = { type: 'text', text: `タイムカプセルが作成されました！ ${openDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}に開封されます。` };
                    state.timecapsuleState = null;
                } else if (text.startsWith('クイズ回答:')) {
                    replyMessage = quiz.handleQuizAnswer(text, state);
                } else if (text.startsWith('miniGame:')) {
                    replyMessage = miniGame.handleMiniGameSelection(text, state);
                } else if (text.startsWith('activity:')) {
                    replyMessage = analysis.handleActivitySelection(text, state);
                } else {
                    replyMessage = getDefaultMessage();
                }
        }
    } catch (error) {
        console.error("Error handling event:", error);
        replyMessage = {
            type: 'text',
            text: `エラーが発生しました: ${error.message}`
        };
    }

    return client.replyMessage(event.replyToken, replyMessage);
}

function getDefaultMessage() {
    return {
        type: 'text',
        text: '以下のいずれかの機能を選んでください：\n・育成ミニゲーム\n・看護ニュース\n・医療知識クイズ\n・看護日記\n・タイムカプセル'
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