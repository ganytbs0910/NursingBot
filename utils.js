function getMenuMessage() {
    return {
        type: 'template',
        altText: 'メニュー',
        template: {
            type: 'buttons',
            title: 'メニュー',
            text: '以下から選択してください',
            actions: [
                { type: 'postback', label: '育成ミニゲーム', data: '育成ミニゲーム' },
                { type: 'postback', label: 'ナース運勢占い', data: 'ナース運勢占い' },
                { type: 'postback', label: 'あなたの分析', data: 'あなたの分析' },
                { type: 'postback', label: '医療知識クイズ', data: '医療知識クイズ' }
            ]
        }
    };
}

function advanceDay(userState) {
    userState.lastFortuneDate = null;
    userState.lastQuizDate = null;
    userState.lastMiniGameDate = null;
    return { type: 'text', text: '1日進みました。新しい1日の機能がリセットされました。' };
}

function getDefaultMessage() {
    return {
        type: 'template',
        altText: 'メニューを表示',
        template: {
            type: 'buttons',
            text: 'メニューを表示しますか？',
            actions: [
                { type: 'postback', label: 'メニューを表示', data: 'メニュー' }
            ]
        }
    };
}

function addQuickReplyToMessage(message, currentMode) {
    const oppositeMode = currentMode === 'keyboard' ? 'メニューモード' : 'キーボードモード';
    message.quickReply = {
        items: [
            {
                type: 'action',
                action: {
                    type: 'message',
                    label: oppositeMode,
                    text: oppositeMode
                }
            },
            {
                type: 'action',
                action: {
                    type: 'postback',
                    label: '1日進める',
                    data: '1日進める',
                    displayText: '1日進める'
                }
            }
        ]
    };
    return message;
}

module.exports = {
    getMenuMessage,
    advanceDay,
    getDefaultMessage,
    addQuickReplyToMessage
};