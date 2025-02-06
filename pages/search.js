import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Search.module.css";

export default function Search() {
    const router = useRouter();
    const { query, page = 1 } = router.query; // クエリパラメータ取得
    const [books, setBooks] = useState([]);
    const [totalPages, setTotalPages] = useState(1); // 総ページ数

    useEffect(() => {
        if (!query) return;

        const fetchBooks = async () => {
            try {
                const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&page=${page}`);
                if (!response.ok) throw new Error("データ取得失敗");
                const data = await response.json();

                if (data.Items) {
                    setBooks(data.Items);
                    setTotalPages(Math.ceil(data.count / 20)); // 🔥 総ページ数を計算
                }
            } catch (error) {
                console.error("検索エラー:", error);
            }
        };

        fetchBooks();
    }, [query, page]);

    return (
        <div className={styles.searchContainer}>
            <h1 className={styles.searchTitle}>「{query}」の検索結果</h1>

            {/* 検索結果の表示 */}
            <div className={styles.bookGrid}>
                {books.map((book, index) => (
                    <div key={index} className={styles.bookItem}>
                        <img src={book.Item.mediumImageUrl || "/images/no_image.png"} alt={book.Item.title} />
                        <h3>{book.Item.title}</h3>
                        <p>著者: {book.Item.author}</p>
                        <p>出版社: {book.Item.publisherName}</p>
                        <p>価格: {book.Item.itemPrice} 円</p>
                        <a href={book.Item.itemUrl} target="_blank" rel="noopener noreferrer">詳細を見る</a>
                    </div>
                ))}
            </div>

            {/* ページネーション */}
            <div className={styles.pagination}>
                {page > 1 && (
                    <button onClick={() => router.push(`/search?query=${query}&page=${Number(page) - 1}`)}>
                        ← 前のページ
                    </button>
                )}
                <span>ページ {page} / {totalPages}</span>
                {page < totalPages && (
                    <button onClick={() => router.push(`/search?query=${query}&page=${Number(page) + 1}`)}>
                        次のページ →
                    </button>
                )}
            </div>
        </div>
    );
}