import requests
from datetime import datetime, timedelta

API_KEY = '077ff7999c8c42dba0912448aa67a4d8'
BASE_URL = 'https://newsapi.org/v2/everything'

def get_medical_news(query='医療', days=7, language='jp', max_results=3):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    params = {
        'q': query,
        'from': start_date.strftime('%Y-%m-%d'),
        'to': end_date.strftime('%Y-%m-%d'),
        'sortBy': 'publishedAt',
        'language': language,
        'apiKey': API_KEY
    }

    response = requests.get(BASE_URL, params=params)

    if response.status_code == 200:
        news_data = response.json()
        return news_data['articles'][:max_results]  # 最大結果数を制限
    else:
        print(f"エラー: {response.status_code}")
        return None

def display_news(articles):
    for article in articles:
        print(f"タイトル: {article['title']}")
        print(f"説明: {article['description']}")
        print(f"URL: {article['url']}")
        print(f"公開日: {article['publishedAt']}")
        print("-" * 50)

if __name__ == "__main__":
    medical_news = get_medical_news(max_results=3)  # 3つのニュースを取得
    if medical_news:
        display_news(medical_news)
    else:
        print("ニュースを取得できませんでした。")