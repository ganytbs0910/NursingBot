const MAX_DIARY_ENTRIES = 7;

function getDiaryPrompt() {
    return {
        type: 'text',
        text: '今日の看護体験や学びを教えてください。「日記:」に続けて入力してください。'
    };
}

function handleDiaryEntry(entry, userState) {
    if (!userState.diaryEntries) {
        userState.diaryEntries = [];
    }

    const today = new Date().toISOString().split('T')[0];

    // 今日の日付のエントリーがあるかチェック
    const todayEntry = userState.diaryEntries.find(e => e.date === today);

    if (todayEntry) {
        return {
            type: 'text',
            text: '今日の日記はすでに書かれています。明日また新しい経験を書いてくださいね。'
        };
    }

    // 新しいエントリーを追加
    userState.diaryEntries.unshift({ date: today, content: entry });

    // 最大エントリー数を超えた場合、古いものを削除
    if (userState.diaryEntries.length > MAX_DIARY_ENTRIES) {
        userState.diaryEntries.pop();
    }

    const messages = [
        {
            type: 'text',
            text: '日記が記録されました。貴重な経験を書き留めていただき、ありがとうございます。'
        }
    ];

    // ランダムなフィードバックを追加
    const feedbacks = [
        '自分の成長を振り返るのは大切ですね。',
        'この経験は今後の看護に活かせると思います。',
        '日々の小さな気づきが大きな学びにつながります。',
        '患者さんとの関わりから多くを学んでいるようですね。',
        'チームワークの重要性を実感したのではないでしょうか。'
    ];

    messages.push({
        type: 'text',
        text: feedbacks[Math.floor(Math.random() * feedbacks.length)]
    });

    return messages;
}

function getDiaryEntries(userState) {
    if (!userState.diaryEntries || userState.diaryEntries.length === 0) {
        return {
            type: 'text',
            text: 'まだ日記の記録がありません。日々の経験を記録していきましょう。'
        };
    }

    const entriesText = userState.diaryEntries.map(entry =>
        `${entry.date}:\n${entry.content}`
    ).join('\n\n');

    return {
        type: 'text',
        text: `あなたの看護日記:\n\n${entriesText}`
    };
}

module.exports = {
    getDiaryPrompt,
    handleDiaryEntry,
    getDiaryEntries
};