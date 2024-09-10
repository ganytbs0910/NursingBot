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
    { stage: 1, description: 'タネ', image: '/images/seed.png' },
    { stage: 3, description: '芽', image: '/images/sprout.png' },
    { stage: 5, description: '蕾', image: '/images/bud.png' }
];

const taskIcons = {
    '注射': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E6%B3%A8%E5%B0%84%E5%99%A8%E3%81%AE%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3%E7%B4%A0%E6%9D%90-gtnEQkgm1pbXpAFq1TvVg307JdVWF9.png',
    '清掃': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E3%83%8F%E3%82%99%E3%82%B1%E3%83%84%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B32-tDGfqL7l902vSg7mgeiwpFXWyyztFr.png',
    '勉強': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E3%81%97%E3%81%8A%E3%82%8A%E4%BB%98%E3%81%8D%E3%81%AE%E6%9C%AC%E3%81%AE%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3%E7%B4%A0%E6%9D%90-9U1gAJepNO0wqmMuXcFnczZhdWCFCC.png',
    '患者ケア': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E8%81%B4%E8%A8%BA%E5%99%A8%E3%81%AE%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3%E7%B4%A0%E6%9D%90-YyePJ7dhJqRnXy03BPNYcOx6m4KDhZ.png',
};

const encouragements = {
    '注射': [
        'お疲れ様です。丁寧な注射は患者さんの安心につながります。',
        '正確な投薬は治療の要です。素晴らしい仕事ぶりです。',
        '患者さんの痛みを最小限に抑える技術に感謝します。',
        '確実な手技で患者さんの信頼を得ていますね。',
    ],
    '清掃': [
        'きれいな環境は患者さんの回復を助けます。素晴らしい仕事です！',
        '衛生管理は感染予防の基本。あなたの努力が病院を守っています。',
        '清潔な環境づくりに尽力してくれてありがとうございます。',
        'あなたの丁寧な清掃が、患者さんに安心を与えています。',
    ],
    '勉強': [
        '新しい知識は患者さんのケアに直結します。頑張りましたね！',
        '継続的な学習姿勢に感心します。チーム全体の力になっています。',
        '最新の医療知識を身につける努力は素晴らしいです。',
        'あなたの学ぶ姿勢が、より良い医療サービスにつながっています。',
    ],
    '患者ケア': [
        '患者さんへの思いやりが伝わっています。素晴らしい看護です。',
        'きめ細やかな対応に感謝します。患者さんの安心につながっています。',
        '患者さんの気持ちに寄り添う姿勢が素晴らしいです。',
        'あなたの優しさが、患者さんの回復を後押ししています。',
    ],
};

function getMiniGameMessage() {
    return {
        type: 'template',
        altText: '今日頑張ったことを選んでください',
        template: {
            type: 'carousel',
            columns: Object.entries(taskIcons).map(([task, iconUrl]) => ({
                thumbnailImageUrl: iconUrl,
                title: task,
                text: '今日頑張ったこと',
                actions: [
                    {
                        type: 'postback',
                        label: '選択',
                        data: `miniGame:${task}`
                    }
                ]
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

    // ngrokのURLを環境変数から取得するか、適切なURLに置き換えてください
    const baseUrl = process.env.NGROK_URL || 'https://your-ngrok-url.ngrok.io';

    if (userState.miniGameProgress === 1) {
        userState.currentFlower = flowers[Math.floor(Math.random() * flowers.length)];
        messages.push({ type: 'text', text: 'タネを植えました！大切に育てていきましょう。' });
        messages.push({ type: 'image', originalContentUrl: `${baseUrl}${growthStages[0].image}`, previewImageUrl: `${baseUrl}${growthStages[0].image}` });
    } else if (userState.miniGameProgress === 3 || userState.miniGameProgress === 5) {
        const stage = growthStages.find(s => s.stage === userState.miniGameProgress);
        messages.push({ type: 'text', text: `おめでとうございます！${stage.description}が出てきました！` });
        messages.push({ type: 'image', originalContentUrl: `${baseUrl}${stage.image}`, previewImageUrl: `${baseUrl}${stage.image}` });
    } else if (userState.miniGameProgress === 7) {
        const taskCounts = userState.taskHistory.reduce((acc, t) => {
            acc[t] = (acc[t] || 0) + 1;
            return acc;
        }, {});
        const summary = Object.entries(taskCounts)
            .map(([t, count]) => `${t}：${count}回`)
            .join('、');

        messages.push({ type: 'text', text: `おめでとうございます！${userState.currentFlower.name}が咲きました！` });
        messages.push({ type: 'text', text: `花言葉は「${userState.currentFlower.meaning}」です。` });
        messages.push({ type: 'text', text: `7回の解答内訳：${summary}` });
        messages.push({ type: 'image', originalContentUrl: userState.currentFlower.image, previewImageUrl: userState.currentFlower.image });

        userState.miniGameProgress = 0;
        userState.taskHistory = [];
        userState.currentFlower = null;
    }

    messages.push({ type: 'text', text: `進捗: ${userState.miniGameProgress}/7` });

    return messages;
}

module.exports = {
    getMiniGameMessage,
    handleMiniGameSelection
};