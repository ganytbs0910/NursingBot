import fetch from "node-fetch";

const API_KEY = "077ff7999c8c42dba0912448aa67a4d8"; // Add your API key here
const BASE_URL = "https://newsapi.org/v2/everything";

async function fetchNews(query) {
  const url = `${BASE_URL}?q=${encodeURIComponent(query)}&apiKey=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Fetched news:", data);
    return data.articles;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}

// Example usage
await fetchNews("technology");
