const quizzes = [
    { question: '成人の平均体温は何度？', answers: ['35.5度', '36.0度', '36.5度', '37.0度'], correct: 2 },
    { question: '正常な血圧の上限値は？', answers: ['120/80', '130/85', '140/90', '150/95'], correct: 2 },
    { question: '人体で最も大きな臓器は？', answers: ['心臓', '肺', '肝臓', '皮膚'], correct: 3 },
    { question: '赤血球の寿命は約何日？', answers: ['60日', '90日', '120日', '150日'], correct: 2 },
];

function getQuizMessage(userState) {
    if (userState.lastQuizDate && userState.lastQuizDate === new Date().toDateString()) {
        return { type: 'text', text: '今日のクイズは既に回答済みです。明日また挑戦してください！' };
    } else {
        const currentQuiz = quizzes[userState.quizProgress % quizzes.length];
        return {
            type: 'template',
            altText: currentQuiz.question,
            template: {
                type: 'buttons',
                text: currentQuiz.question,
                actions: currentQuiz.answers.map((answer, index) => ({
                    type: 'postback',
                    label: answer,
                    data: `クイズ回答:${index}`
                }))
            }
        };
    }
}

function handleQuizAnswer(text, userState) {
    const answerIndex = parseInt(text.split(':')[1]);
    const currentQuiz = quizzes[userState.quizProgress % quizzes.length];
    const isCorrect = answerIndex === currentQuiz.correct;
    const growthAmount = isCorrect ? 10 : 5;

    userState.quizProgress++;
    userState.lastQuizDate = new Date().toDateString();

    const plantHeight = userState.quizProgress * 10;
    const comparisons = [
        { height: 10, object: 'ペットボトルのキャップ' },
        { height: 30, object: 'スマートフォン' },
        { height: 50, object: 'ノートパソコン' },
        { height: 100, object: '幼児' },
        { height: 150, object: '大人の身長' },
    ];
    const comparison = comparisons.find(c => plantHeight <= c.height) || comparisons[comparisons.length - 1];

    return [
        { type: 'text', text: isCorrect ? "正解です！素晴らしい！" : `残念、不正解です。正解は「${currentQuiz.answers[currentQuiz.correct]}」でした。` },
        { type: 'text', text: `植物が${growthAmount}cm成長しました！\n現在の高さ: ${plantHeight}cm (${comparison.object}くらいの高さです)` }
    ];
}

module.exports = {
    getQuizMessage,
    handleQuizAnswer
};