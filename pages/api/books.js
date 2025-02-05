export default async function handler(req, res) {
    try {
        const url = `${process.env.NEXT_PUBLIC_RAKUTEN_API_URL}?applicationId=${process.env.NEXT_PUBLIC_RAKUTEN_API_KEY}&booksGenreId=001001&format=json&hits=25`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch data from API: ${response.statusText}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
}
