const fs = require('fs').promises;
const path = require('path');
const schedule = require('node-schedule');
const CAPSULE_FILE = path.join(__dirname, 'timecapsules.json');

async function initCapsuleFile() {
    try {
        await fs.access(CAPSULE_FILE);
    } catch (error) {
        await fs.writeFile(CAPSULE_FILE, '{}');
    }
}

async function readCapsules() {
    await initCapsuleFile();
    const data = await fs.readFile(CAPSULE_FILE, 'utf8');
    return JSON.parse(data);
}

async function writeCapsules(capsules) {
    await fs.writeFile(CAPSULE_FILE, JSON.stringify(capsules, null, 2));
}

function calculateFutureDate(duration) {
    const now = new Date();
    switch (duration) {
        case '1週間後': return new Date(now.setDate(now.getDate() + 7));
        case '1ヶ月後': return new Date(now.setMonth(now.getMonth() + 1));
        case '半年後': return new Date(now.setMonth(now.getMonth() + 6));
        case '1年後': return new Date(now.setFullYear(now.getFullYear() + 1));
        case '3年後': return new Date(now.setFullYear(now.getFullYear() + 3));
        case '5年後': return new Date(now.setFullYear(now.getFullYear() + 5));
        default: throw new Error('無効な期間です');
    }
}

async function createTimeCapsule(userId, message, duration) {
    const capsules = await readCapsules();
    const openDate = calculateFutureDate(duration);

    if (!capsules[userId]) {
        capsules[userId] = [];
    }

    capsules[userId].push({
        message,
        createdAt: new Date().toISOString(),
        openAt: openDate.toISOString()
    });

    await writeCapsules(capsules);
    return openDate;
}

async function getOpenCapsules(userId) {
    const capsules = await readCapsules();
    const userCapsules = capsules[userId] || [];
    const now = new Date();

    const openCapsules = userCapsules.filter(capsule => new Date(capsule.openAt) <= now);

    if (openCapsules.length > 0) {
        capsules[userId] = userCapsules.filter(capsule => new Date(capsule.openAt) > now);
        await writeCapsules(capsules);
    }

    return openCapsules;
}

async function checkPendingCapsules(userId) {
    const capsules = await readCapsules();
    const userCapsules = capsules[userId] || [];
    const now = new Date();

    const pendingCapsules = userCapsules.filter(capsule => new Date(capsule.openAt) > now);

    return pendingCapsules.map(capsule => {
        const openDate = new Date(capsule.openAt);
        const timeDiff = openDate - now;
        const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        return `${openDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}に開封予定（あと${days}日）`;
    });
}

async function checkAndNotifyOpenCapsules(client) {
    const capsules = await readCapsules();
    const now = new Date();
    let updated = false;

    for (const [userId, userCapsules] of Object.entries(capsules)) {
        const openCapsules = userCapsules.filter(capsule => new Date(capsule.openAt) <= now);

        if (openCapsules.length > 0) {
            capsules[userId] = userCapsules.filter(capsule => new Date(capsule.openAt) > now);
            updated = true;

            // ユーザーに通知を送信
            const message = {
                type: 'text',
                text: `${openCapsules.length}個のタイムカプセルが開封可能になりました！「タイムカプセル」→「振り返る」で確認してください。`
            };
            try {
                await client.pushMessage(userId, message);
            } catch (error) {
                console.error(`Failed to send notification to user ${userId}:`, error);
            }
        }
    }

    if (updated) {
        await writeCapsules(capsules);
    }
}

function scheduleTimeCapsuleChecks(client) {
    // 毎日午前0時に実行
    schedule.scheduleJob('0 0 * * *', async () => {
        console.log('Running scheduled time capsule check');
        await checkAndNotifyOpenCapsules(client);
    });
}

function getTimeCapsuleOptions() {
    return {
        type: 'template',
        altText: 'タイムカプセルメニュー',
        template: {
            type: 'buttons',
            title: 'タイムカプセル',
            text: '以下から選択してください',
            actions: [
                { type: 'postback', label: '確認', data: 'timecapsule_check' },
                { type: 'postback', label: '埋める', data: 'timecapsule_bury' },
                { type: 'postback', label: '振り返る', data: 'timecapsule_review' }
            ]
        }
    };
}

function getBuryOptions() {
    return {
        type: 'template',
        altText: 'タイムカプセルを埋める期間選択',
        template: {
            type: 'buttons',
            title: 'タイムカプセルを埋める',
            text: '期間を選択してください',
            actions: [
                { type: 'postback', label: '1週間後', data: 'timecapsule_bury_1週間後' },
                { type: 'postback', label: '1ヶ月後', data: 'timecapsule_bury_1ヶ月後' },
                { type: 'postback', label: '半年後', data: 'timecapsule_bury_半年後' },
                { type: 'postback', label: '1年後', data: 'timecapsule_bury_1年後' }
            ]
        }
    };
}

function getBuryOptionsMore() {
    return {
        type: 'template',
        altText: 'タイムカプセルを埋める期間選択（続き）',
        template: {
            type: 'buttons',
            title: 'タイムカプセルを埋める',
            text: '期間を選択してください',
            actions: [
                { type: 'postback', label: '3年後', data: 'timecapsule_bury_3年後' },
                { type: 'postback', label: '5年後', data: 'timecapsule_bury_5年後' },
                { type: 'postback', label: '戻る', data: 'timecapsule_menu' }
            ]
        }
    };
}

module.exports = {
    getTimeCapsuleOptions,
    getBuryOptions,
    getBuryOptionsMore,
    checkPendingCapsules,
    createTimeCapsule,
    getOpenCapsules,
    checkAndNotifyOpenCapsules,
    scheduleTimeCapsuleChecks
};