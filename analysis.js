const activities = [
    '患者ケア', '記録管理', '勉強', '医師のサポート', '精神的サポート', '健康状態のモニタリング'
];

const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
];

function getAnalysisMessage() {
    return {
        type: 'text',
        text: '今日は何を一番頑張りましたか？以下から選択してください。',
        quickReply: {
            items: activities.map(activity => ({
                type: 'action',
                action: {
                    type: 'postback',
                    label: activity,
                    data: `activity:${activity}`,
                    displayText: activity
                }
            }))
        }
    };
}

function handleActivitySelection(text, userState) {
    const activity = text.split(':')[1];
    userState.activityHistory[activity] = (userState.activityHistory[activity] || 0) + 1;

    let totalActivities = Object.values(userState.activityHistory).reduce((a, b) => a + b, 0);
    let analysisData = [];

    for (let [key, value] of Object.entries(userState.activityHistory)) {
        let percentage = ((value / totalActivities) * 100).toFixed(1);
        analysisData.push({ activity: key, percentage: parseFloat(percentage) });
    }

    analysisData.sort((a, b) => b.percentage - a.percentage);

    let characterAnalysis = getDetailedCharacterAnalysis(analysisData);

    return createHorizontalBarChartMessage(analysisData, characterAnalysis);
}

function getDetailedCharacterAnalysis(analysisData) {
    let topActivities = analysisData.slice(0, 2);
    let lowestActivity = analysisData[analysisData.length - 1];
    let balanceScore = getBalanceScore(analysisData);

    let analysis = '';

    // トップ活動の分析
    if (topActivities[0].percentage > 50) {
        analysis += `${topActivities[0].activity}に非常に力を入れていますね。`;
        switch (topActivities[0].activity) {
            case '患者ケア':
                analysis += '患者さんとの関わりを最優先にしている献身的な看護師さんです。';
                break;
            case '記録管理':
                analysis += '正確な情報管理を重視する几帳面さがあなたの強みです。';
                break;
            case '勉強':
                analysis += '常に新しい知識を吸収しようとする向上心が素晴らしいです。';
                break;
            case '医師のサポート':
                analysis += 'チーム医療において重要な役割を果たしています。';
                break;
            case '精神的サポート':
                analysis += '患者さんの心のケアに特に注力できる優しい看護師さんです。';
                break;
            case '健康状態のモニタリング':
                analysis += '患者さんの微細な変化を見逃さない観察力が優れています。';
                break;
        }
    } else {
        analysis += `${topActivities[0].activity}と${topActivities[1].activity}にバランスよく力を入れていますね。`;
        analysis += '多面的なスキルを持つ看護師さんだと言えます。';
    }

    // バランススコアの分析
    if (balanceScore > 0.8) {
        analysis += '全体的にバランスの取れた活動をしています。様々な状況に対応できる柔軟性がありますね。';
    } else if (balanceScore < 0.5) {
        analysis += `一方で、${lowestActivity.activity}にもう少し注意を向けると、より総合的なケアが提供できるかもしれません。`;
    }

    // 特定の組み合わせの分析
    if (hasActivityCombination(analysisData, ['患者ケア', '精神的サポート'])) {
        analysis += '患者さんの身体的・精神的ニーズに総合的に対応できる能力が高いですね。';
    }
    if (hasActivityCombination(analysisData, ['記録管理', '健康状態のモニタリング'])) {
        analysis += '正確な記録と細やかな観察を組み合わせて、質の高い看護を提供していますね。';
    }
    if (hasActivityCombination(analysisData, ['勉強', '医師のサポート'])) {
        analysis += '最新の医療知識を活かして、医師との連携を効果的に行える強みがあります。';
    }

    // 改善の提案
    if (lowestActivity.percentage < 5) {
        analysis += `${lowestActivity.activity}にも少し時間を割いてみることで、さらにバランスの取れた看護師になれるかもしれません。`;
    }

    return analysis;
}

function getBalanceScore(analysisData) {
    let idealPercentage = 100 / analysisData.length;
    let totalDeviation = analysisData.reduce((sum, item) => sum + Math.abs(item.percentage - idealPercentage), 0);
    let maxDeviation = 2 * (100 - idealPercentage);
    return 1 - (totalDeviation / maxDeviation);
}

function hasActivityCombination(analysisData, activities) {
    return activities.every(activity =>
        analysisData.find(item => item.activity === activity && item.percentage > 15)
    );
}

function createHorizontalBarChartMessage(analysisData, characterAnalysis) {
    const maxBarWidth = 200;
    const barHeight = 25;

    const barChartContents = analysisData.map((item, index) => ({
        type: 'box',
        layout: 'horizontal',
        contents: [
            {
                type: 'box',
                layout: 'horizontal',
                contents: [
                    {
                        type: 'text',
                        text: `${item.percentage}%`,
                        size: 'sm',
                        color: '#ffffff',
                        align: 'start',
                        gravity: 'center'
                    }
                ],
                width: `${Math.max((item.percentage / 100) * maxBarWidth, 30)}px`,
                height: `${barHeight}px`,
                backgroundColor: colors[index % colors.length],
                cornerRadius: '5px'
            },
            {
                type: 'text',
                text: item.activity,
                size: 'sm',
                color: '#555555',
                align: 'start',
                gravity: 'center',
                margin: 'sm',
                flex: 2
            }
        ],
        margin: 'sm'
    }));

    return {
        type: 'flex',
        altText: '活動分析結果',
        contents: {
            type: 'bubble',
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'text',
                        text: '活動分析結果',
                        weight: 'bold',
                        size: 'xl',
                        align: 'center',
                        margin: 'md'
                    },
                    {
                        type: 'box',
                        layout: 'vertical',
                        contents: barChartContents,
                        margin: 'lg'
                    },
                    {
                        type: 'text',
                        text: 'あなたの特徴:',
                        weight: 'bold',
                        margin: 'xl'
                    },
                    {
                        type: 'text',
                        text: characterAnalysis,
                        wrap: true,
                        margin: 'sm'
                    }
                ]
            }
        }
    };
}

module.exports = {
    getAnalysisMessage,
    handleActivitySelection
};