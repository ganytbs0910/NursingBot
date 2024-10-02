const axios = require('axios');

const API_KEY = '077ff7999c8c42dba0912448aa67a4d8';
const BASE_URL = 'https://newsapi.org/v2/everything';

async function fetchMedicalNews() {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                apiKey: API_KEY,
                q: '医療 OR 看護 OR 病院',
                language: 'ja',
                sortBy: 'publishedAt',
                pageSize: 1  // 1つのニュースのみを取得
            }
        });

        if (response.data.articles.length > 0) {
            const article = response.data.articles[0];
            return {
                title: article.title,
                description: article.description,
                url: article.url,
                publishedAt: new Date(article.publishedAt)
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching news from NewsAPI:', error);
        throw error;
    }
}

function formatNewsMessage(newsItem) {
    if (!newsItem) {
        return 'すみません、現在ニュースが見つかりません。';
    }
    return `🏥 最新の医療ニュース 🏥\n\n${newsItem.title}\n\n${newsItem.url}`;
}

async function getMedicalNewsMessage() {
    try {
        const latestNews = await fetchMedicalNews();
        return formatNewsMessage(latestNews);
    } catch (error) {
        console.error('Error getting medical news:', error);
        return 'すみません、現在ニュースを取得できません。後でもう一度お試しください。';
    }
}

module.exports = {
    getMedicalNewsMessage
};