const fs = require('fs').promises;
const path = require('path');

const DIARY_DIR = path.join(__dirname, 'nursing_diaries');

async function initDiaryDir() {
    try {
        await fs.access(DIARY_DIR);
    } catch (error) {
        await fs.mkdir(DIARY_DIR);
    }
}

async function getUserDiaryPath(userId) {
    await initDiaryDir();
    return path.join(DIARY_DIR, `${userId}.json`);
}

async function readUserDiary(userId) {
    const filePath = await getUserDiaryPath(userId);
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {};
        }
        throw error;
    }
}

async function writeUserDiary(userId, diary) {
    const filePath = await getUserDiaryPath(userId);
    await fs.writeFile(filePath, JSON.stringify(diary, null, 2));
}

function getDiaryOptions() {
    return {
        type: 'template',
        altText: '看護日記メニュー',
        template: {
            type: 'buttons',
            title: '看護日記',
            text: '以下から選択してください',
            actions: [
                { type: 'postback', label: '日記を書く', data: 'diary_write' },
                { type: 'postback', label: '日記を振り返る', data: 'diary_review' }
            ]
        }
    };
}

function writeDiaryPrompt() {
    return {
        type: 'text',
        text: '今日はどんなことがありましたか？看護の経験や学びを教えてください。'
    };
}

async function handleDiaryEntry(userId, entry) {
    const diary = await readUserDiary(userId);
    const today = new Date().toISOString().split('T')[0];

    diary[today] = entry;

    await writeUserDiary(userId, diary);

    return {
        type: 'text',
        text: '日記が記録されました。貴重な経験を書き留めていただき、ありがとうございます。'
    };
}

function reviewDiaryPrompt() {
    return {
        type: 'text',
        text: '振り返りたい日記の日付を入力してください（例: 2023/10/03）'
    };
}

async function getDiaryEntry(userId, dateString) {
    try {
        const formattedDate = dateString.replace(/\//g, '-');
        const diary = await readUserDiary(userId);

        if (!diary[formattedDate]) {
            return {
                type: 'text',
                text: `${dateString}の日記は見つかりませんでした。`
            };
        }

        return {
            type: 'text',
            text: `${dateString}の日記:\n\n${diary[formattedDate]}`
        };
    } catch (error) {
        return {
            type: 'text',
            text: `エラー: ${error.message}`
        };
    }
}

module.exports = {
    getDiaryOptions,
    writeDiaryPrompt,
    handleDiaryEntry,
    reviewDiaryPrompt,
    getDiaryEntry
};