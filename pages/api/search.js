export default async function handler(req, res) {
    try {
        const { query, page = 1 } = req.query; // クエリパラメータから検索ワードとページ番号を取得
        if (!query) {
            return res.status(400).json({ error: "検索ワードが必要です" });
        }

        const hitsPerPage = 24; // 1ページあたりの表示件数
        const url = `${process.env.NEXT_PUBLIC_RAKUTEN_API_URL}?applicationId=${process.env.NEXT_PUBLIC_RAKUTEN_API_KEY}&format=json&sort=sales&hits=${hitsPerPage}&page=${page}&booksGenreId=001001&title=${encodeURIComponent(query)}&keyword=${encodeURIComponent(query)}&availability=1`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`APIリクエスト失敗: ${response.statusText}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error("検索データ取得エラー:", error);
        res.status(500).json({ error: "検索データ取得に失敗しました" });
    }
}
