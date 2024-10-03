const fs = require('fs').promises;
const path = require('path');

let quizzes = [];

async function loadQuizzes() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'quizzes.json'), 'utf8');
        quizzes = JSON.parse(data);
    } catch (error) {
        console.error('Error loading quizzes:', error);
        quizzes = [];
    }
}

// アプリケーション起動時にクイズを読み込む
loadQuizzes();

function getQuizMessage(userState) {
    if (!userState.quizProgress) {
        userState.quizProgress = 0;
    }

    if (userState.quizProgress >= quizzes.length) {
        return {
            type: 'text',
            text: 'おめでとうございます！全ての問題を解答しました。もう一度挑戦する場合は「クイズをリセット」と入力してください。'
        };
    }

    const currentQuiz = quizzes[userState.quizProgress];
    return {
        type: 'template',
        altText: currentQuiz.question,
        template: {
            type: 'buttons',
            text: `問題${userState.quizProgress + 1}: ${currentQuiz.question}`,
            actions: currentQuiz.answers.map((answer, index) => ({
                type: 'postback',
                label: answer,
                data: `クイズ回答:${index}`
            }))
        }
    };
}

function handleQuizAnswer(text, userState) {
    const answerIndex = parseInt(text.split(':')[1]);
    const currentQuiz = quizzes[userState.quizProgress];
    const isCorrect = answerIndex === currentQuiz.correct;

    let replyMessage = isCorrect ? "正解です！" : `不正解です。正解は「${currentQuiz.answers[currentQuiz.correct]}」でした。`;
    replyMessage += `\n\n解説: ${currentQuiz.explanation}`;

    userState.quizProgress++;

    if (userState.quizProgress < quizzes.length) {
        replyMessage += "\n\n次の問題に進むには「次の問題」と入力してください。";
    } else {
        replyMessage += "\n\nおめでとうございます！全ての問題を解答しました。もう一度挑戦する場合は「クイズをリセット」と入力してください。";
    }

    return { type: 'text', text: replyMessage };
}

function resetQuiz(userState) {
    userState.quizProgress = 0;
    return { type: 'text', text: 'クイズがリセットされました。「医療知識クイズ」と入力して、最初から始めてください。' };
}

module.exports = {
    getQuizMessage,
    handleQuizAnswer,
    resetQuiz
};