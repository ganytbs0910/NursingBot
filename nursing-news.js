const axios = require('axios');
const Parser = require('rss-parser');

const parser = new Parser();

const RSS_FEEDS = [
    'https://www.mhlw.go.jp/stf/news.rdf', // 厚生労働省のRSSフィード
];

async function fetchLatestNews() {
    let allNews = [];

    for (const feed of RSS_FEEDS) {
        try {
            const response = await axios.get(feed);
            const parsedFeed = await parser.parseString(response.data);

            const newsItems = parsedFeed.items.slice(0, 3).map(item => ({
                title: item.title,
                link: item.link,
                pubDate: new Date(item.pubDate),
            }));

            allNews = allNews.concat(newsItems);
        } catch (error) {
            console.error(`Error fetching news from ${feed}:`, error);
        }
    }

    // 日付でソートし、最新の5件を返す
    return allNews.sort((a, b) => b.pubDate - a.pubDate).slice(0, 5);
}

function formatNewsMessage(newsItems) {
    let message = "🏥 最新の看護ニュース 🏥\n\n";
    newsItems.forEach((item, index) => {
        message += `${index + 1}. ${item.title}\n${item.link}\n\n`;
    });
    return message.trim();
}

async function getNursingNewsMessage(userState) {
    const today = new Date().toDateString();
    if (userState.lastNursingNewsDate !== today) {
        try {
            const latestNews = await fetchLatestNews();
            const newsMessage = formatNewsMessage(latestNews);
            userState.lastNursingNewsDate = today;
            return { type: 'text', text: newsMessage };
        } catch (error) {
            console.error('Error getting nursing news:', error);
            return { type: 'text', text: 'すみません、現在看護ニュースを取得できません。後でもう一度お試しください。' };
        }
    } else {
        return { type: 'text', text: '今日の看護ニュースは既に確認しました。明日また最新のニュースをお届けします！' };
    }
}

module.exports = {
    getNursingNewsMessage
};