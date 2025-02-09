export default async function handler(req, res) {
    const { isbn } = req.query;
    if (!isbn) {
        return res.status(400).json({ error: "ISBN が必要です" });
    }

    try {
        const url = `${process.env.NEXT_PUBLIC_RAKUTEN_API_URL}?applicationId=${process.env.NEXT_PUBLIC_RAKUTEN_API_KEY}&booksGenreId=001001&isbn=${isbn}&format=json`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from API: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.Items || data.Items.length === 0) {
            return res.status(404).json({ error: "本が見つかりませんでした" });
        }

        res.status(200).json(data.Items[0].Item);
    } catch (error) {
        console.error("Error fetching book data:", error);
        res.status(500).json({ error: "データ取得に失敗しました" });
    }
}
