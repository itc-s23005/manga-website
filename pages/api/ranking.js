export default async function handler(req, res) {
    try {
        const publisher = req.query.publisher || "集英社"; // デフォルトは集英社

        // 🔹 APIリクエストURLを生成
        const url = `${process.env.NEXT_PUBLIC_RAKUTEN_API_URL}?applicationId=${process.env.NEXT_PUBLIC_RAKUTEN_API_KEY}&booksGenreId=001001&format=json&sort=sales&hits=10&publisherName=${encodeURIComponent(publisher)}`;

        console.log("Fetching ranking data from:", url); // デバッグ用ログ

        // 🔹 タイムアウトを設定（5秒）
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout); // 成功したらタイムアウト解除

        if (!response.ok) {
            throw new Error(`Failed to fetch data from API: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Fetched ${data.Items.length} books for publisher: ${publisher}`); // デバッグログ

        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching ranking data:", error);
        res.status(500).json({ error: "Failed to fetch ranking data", details: error.message });
    }
}