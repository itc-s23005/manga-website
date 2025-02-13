export default async function handler(req, res) {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ error: "出版社名が必要です" });
        }

        const url = `${process.env.NEXT_PUBLIC_RAKUTEN_API_URL}?applicationId=${process.env.NEXT_PUBLIC_RAKUTEN_API_KEY}&booksGenreId=001001&format=json&hits=20&publisherName=${encodeURIComponent(name)}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch data from API: ${response.statusText}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching publisher data:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
}
