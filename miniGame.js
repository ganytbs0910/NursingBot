const flowers = [
    { name: 'アガパンサス', meaning: '知的な装い', image: 'https://example.com/agapanthus.jpg' },
    { name: 'カエデ', meaning: '美しい変化', image: 'https://example.com/maple.jpg' },
    { name: 'ヒマワリ', meaning: '明るさ', image: 'https://example.com/sunflower.jpg' },
    { name: 'サクラ', meaning: '優美な女性', image: 'https://example.com/cherry_blossom.jpg' },
    { name: 'ラベンダー', meaning: '期待', image: 'https://example.com/lavender.jpg' },
    { name: 'バラ', meaning: '愛', image: 'https://example.com/rose.jpg' },
    { name: 'チューリップ', meaning: '思いやり', image: 'https://example.com/tulip.jpg' },
    { name: 'ユリ', meaning: '純粋', image: 'https://example.com/lily.jpg' },
    { name: 'アジサイ', meaning: '辛抱強さ', image: 'https://example.com/hydrangea.jpg' },
    { name: 'コスモス', meaning: '調和', image: 'https://example.com/cosmos.jpg' }
];

const growthStages = [
    { stage: 1, description: 'タネ', image: 'https://gyazo.com/752e3507a613444a69b4759d8ea7d4e5.png' },
    { stage: 3, description: '芽', image: 'https://gyazo.com/83f3ab5bd11875cf7840caa35a60ebfd.png' },
    { stage: 5, description: '蕾', image: 'https://gyazo.com/61663d52d9701bd9eb0956317afdeefc.png' }
];

const taskIcons = {
    '注射': '💉',
    '清掃': '🧹',
    '勉強': '📚',
    '患者ケア': '🩺'
};

const encouragements = {
    '注射': [
        'お疲れ様です。丁寧な注射は患者さんの安心につながります。',
        '確実な手技で患者さんの信頼を得ていますね。',
    ],
    '清掃': [
        '清潔な環境づくりに尽力してくれてありがとうございます。',
        'あなたの丁寧な清掃が、患者さんに安心を与えています。',
    ],
    '勉強': [
        '新しい知識は患者さんのケアに直結します。頑張りましたね！',
        '最新の医療知識を身につける努力は素晴らしいです。',
    ],
    '患者ケア': [
        '患者さんの気持ちに寄り添う姿勢が素晴らしいです。',
        'あなたの優しさが、患者さんの回復を後押ししています。',
    ],
};

function getMiniGameMessage() {
    return {
        type: 'template',
        altText: '今日頑張ったことを選んでください',
        template: {
            type: 'buttons',
            title: '今日頑張ったこと',
            text: 'どの作業を頑張りましたか？',
            actions: Object.entries(taskIcons).map(([task, emoji]) => ({
                type: 'postback',
                label: `${emoji} ${task}`,
                data: `miniGame:${task}`
            }))
        }
    };
}

function handleMiniGameSelection(data, userState) {
    const task = data.split(':')[1];
    const today = new Date().toDateString();

    if (userState.lastMiniGameDate === today) {
        return { type: 'text', text: '今日はもう回答済みです。明日また挑戦してください！' };
    }

    const encouragement = encouragements[task][Math.floor(Math.random() * encouragements[task].length)];
    userState.miniGameProgress++;
    userState.taskHistory.push(task);
    userState.lastMiniGameDate = today;

    let messages = [{ type: 'text', text: encouragement }];

    if (userState.miniGameProgress === 1) {
        userState.currentFlower = flowers[Math.floor(Math.random() * flowers.length)];
        messages.push({ type: 'text', text: 'タネを植えました！大切に育てていきましょう。' });
        messages.push({ type: 'image', originalContentUrl: growthStages[0].image, previewImageUrl: growthStages[0].image });
    } else if (userState.miniGameProgress === 3 || userState.miniGameProgress === 5) {
        const stage = growthStages.find(s => s.stage === userState.miniGameProgress);
        messages.push({ type: 'text', text: `おめでとうございます！${stage.description}が出てきました！` });
        messages.push({ type: 'image', originalContentUrl: stage.image, previewImageUrl: stage.image });
    } else if (userState.miniGameProgress === 7) {
        const taskCounts = userState.taskHistory.reduce((acc, t) => {
            acc[t] = (acc[t] || 0) + 1;
            return acc;
        }, {});
        const summary = Object.entries(taskCounts)
            .map(([t, count]) => `${taskIcons[t]} ${t}：${count}回`)
            .join('、');

        messages.push({ type: 'text', text: `おめでとうございます！${userState.currentFlower.name}が咲きました！` });
        messages.push({ type: 'text', text: `花言葉は「${userState.currentFlower.meaning}」です。` });
        messages.push({ type: 'text', text: `7回の解答内訳：${summary}` });
        messages.push({ type: 'image', originalContentUrl: userState.currentFlower.image, previewImageUrl: userState.currentFlower.image });

        userState.miniGameProgress = 0;
        userState.taskHistory = [];
        userState.currentFlower = null;
    }

    messages.push({ type: 'text', text: `進捗: ${'🌱'.repeat(userState.miniGameProgress)}${'⚪'.repeat(7 - userState.miniGameProgress)} (${userState.miniGameProgress}/7)` });

    return messages;
}

module.exports = {
    getMiniGameMessage,
    handleMiniGameSelection
};