const axios = require('axios');

const API_KEY = '077ff7999c8c42dba0912448aa67a4d8';
const BASE_URL = 'https://newsapi.org/v2/everything';

async function getMedicalNews(query = '医療', days = 7, language = 'jp', maxResults = 5) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const params = {
        q: query,
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
        sortBy: 'publishedAt',
        language: language,
        apiKey: API_KEY
    };

    try {
        const response = await axios.get(BASE_URL, { params });
        if (response.status === 200) {
            return response.data.articles.slice(0, maxResults);
        } else {
            console.error(`エラー: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error('医療ニュース取得中にエラーが発生しました:', error);
        return null;
    }
}

function formatNewsForLine(articles) {
    let formattedNews = "🏥 最新の医療ニュース 🏥\n\n";
    articles.forEach((article, index) => {
        formattedNews += `${index + 1}. ${article.title}\n${article.url}\n\n`;
    });
    return formattedNews.trim();
}

async function getMedicalNewsMessage(userState) {
    const today = new Date().toDateString();
    if (userState.lastMedicalNewsDate !== today) {
        const news = await getMedicalNews();
        if (news) {
            const formattedNews = formatNewsForLine(news);
            userState.lastMedicalNewsDate = today;
            return {
                type: 'text',
                text: formattedNews
            };
        } else {
            return {
                type: 'text',
                text: "申し訳ありません。現在医療ニュースを取得できません。"
            };
        }
    } else {
        return {
            type: 'text',
            text: '今日の医療ニュースは既に確認しました。明日また最新のニュースをお届けします！'
        };
    }
}

module.exports = {
    getMedicalNewsMessage
};