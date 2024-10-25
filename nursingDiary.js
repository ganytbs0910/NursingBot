const fs = require('fs').promises;
const path = require('path');

const DIARY_DIR = path.join(__dirname, 'nursing_diaries');

const taskIcons = {
    '注射': '💉',
    '清掃': '🧹',
    '勉強': '📚',
    '患者ケア': '🩺'
};

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
            return {
                entries: {},
                flowerProgress: {
                    entryCount: 0,
                    currentFlower: null,
                    currentStage: 0
                }
            };
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
                {
                    type: 'postback',
                    label: '日記を書く',
                    data: 'diary_write'
                },
                {
                    type: 'postback',
                    label: '日記を振り返る',
                    data: 'diary_review'
                }
            ]
        }
    };
}

function getTaskSelection() {
    return {
        type: 'flex',
        altText: '今日頑張ったことを選択',
        contents: {
            type: 'bubble',
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'text',
                        text: '今日最も頑張ったことを選んでください',
                        weight: 'bold',
                        size: 'md',
                        margin: 'md'
                    },
                    {
                        type: 'box',
                        layout: 'horizontal',
                        margin: 'md',
                        spacing: 'sm',
                        contents: Object.entries(taskIcons).map(([task, icon]) => ({
                            type: 'box',
                            layout: 'vertical',
                            cornerRadius: '20px',
                            backgroundColor: '#f5f5f5',
                            action: {
                                type: 'postback',
                                label: task,
                                data: `diary_task_${task}`
                            },
                            contents: [
                                {
                                    type: 'box',
                                    layout: 'vertical',
                                    alignItems: 'center',
                                    paddingAll: 'lg',
                                    contents: [
                                        {
                                            type: 'text',
                                            text: icon,
                                            size: 'xxl'
                                        },
                                        {
                                            type: 'text',
                                            text: task,
                                            size: 'sm',
                                            margin: 'sm'
                                        }
                                    ]
                                }
                            ]
                        }))
                    }
                ]
            }
        }
    };
}

function writeDiaryPrompt(task) {
    return {
        type: 'text',
        text: `${taskIcons[task]} ${task}に関して、具体的にどんなことがありましたか？看護の経験や学びを教えてください。`
    };
}

function getFlowerGrowthMessage(flowerProgress) {
    const { entryCount, currentFlower, currentStage } = flowerProgress;

    if (entryCount === 7) {
        return {
            type: 'flex',
            altText: '花が咲きました！',
            contents: {
                type: 'bubble',
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: '🎉 おめでとうございます！',
                            weight: 'bold',
                            size: 'xl'
                        },
                        {
                            type: 'text',
                            text: `${currentFlower.name}が咲きました！`,
                            size: 'lg',
                            margin: 'md'
                        },
                        {
                            type: 'text',
                            text: `花言葉: ${currentFlower.meaning}`,
                            size: 'md',
                            margin: 'md'
                        }
                    ]
                }
            }
        };
    }

    const currentGrowthStage = growthStages.find(s => s.stage === currentStage);
    if (currentGrowthStage) {
        return {
            type: 'flex',
            altText: '花の成長状況',
            contents: {
                type: 'bubble',
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: `${currentGrowthStage.description}の様子`,
                            weight: 'bold',
                            size: 'xl'
                        },
                        {
                            type: 'image',
                            url: currentGrowthStage.image,
                            size: 'full',
                            aspectMode: 'cover',
                            margin: 'md'
                        }
                    ]
                }
            }
        };
    }

    return null;
}

async function handleDiaryEntry(userId, entry, state) {
    const diary = await readUserDiary(userId);
    const today = new Date().toISOString().split('T')[0];

    if (!diary.entries) diary.entries = {};
    diary.entries[today] = {
        task: state.selectedTask,
        content: entry
    };

    if (!diary.flowerProgress) {
        diary.flowerProgress = {
            entryCount: 0,
            currentFlower: flowers[Math.floor(Math.random() * flowers.length)],
            currentStage: 0
        };
    }

    diary.flowerProgress.entryCount++;

    if (diary.flowerProgress.entryCount === 1) {
        diary.flowerProgress.currentStage = 1;
    } else if (diary.flowerProgress.entryCount === 3) {
        diary.flowerProgress.currentStage = 3;
    } else if (diary.flowerProgress.entryCount === 5) {
        diary.flowerProgress.currentStage = 5;
    } else if (diary.flowerProgress.entryCount === 7) {
        diary.flowerProgress.currentStage = 7;
    }

    await writeUserDiary(userId, diary);

    const growthMessage = getFlowerGrowthMessage(diary.flowerProgress);

    if (diary.flowerProgress.entryCount === 7) {
        diary.flowerProgress = {
            entryCount: 0,
            currentFlower: flowers[Math.floor(Math.random() * flowers.length)],
            currentStage: 0
        };
        await writeUserDiary(userId, diary);
    }

    const messages = [
        {
            type: 'text',
            text: '日記が記録されました。貴重な経験を書き留めていただき、ありがとうございます。'
        }
    ];

    if (growthMessage) {
        messages.push(growthMessage);
    }

    return messages;
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

        if (!diary.entries || !diary.entries[formattedDate]) {
            return {
                type: 'text',
                text: `${dateString}の日記は見つかりませんでした。`
            };
        }

        const entry = diary.entries[formattedDate];
        return {
            type: 'text',
            text: `${dateString}の日記:\n\n${taskIcons[entry.task]} タスク: ${entry.task}\n\n${entry.content}`
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
    getTaskSelection,
    writeDiaryPrompt,
    handleDiaryEntry,
    reviewDiaryPrompt,
    getDiaryEntry
};