import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { likeBook, unlikeBook, getLikedBooks } from "../lib/firestore"; // Firestore関連の関数
import { auth } from "../lib/firebaseConfig"; // Firebase認証
import { onAuthStateChanged } from "firebase/auth";
import styles from "../styles/Search.module.css";

export default function Search() {
    const router = useRouter();
    const { query, page = 1 } = router.query;
    const [books, setBooks] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [likedBooks, setLikedBooks] = useState({});
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const liked = await getLikedBooks(currentUser.uid);
                setLikedBooks(
                    liked.reduce((acc, book) => {
                        acc[book.isbn] = book.id;
                        return acc;
                    }, {})
                );
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!query) return;

        const fetchBooks = async () => {
            try {
                const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&page=${page}`);
                if (!response.ok) throw new Error("データ取得失敗");
                const data = await response.json();

                if (data.Items) {
                    setBooks(data.Items);
                    setTotalPages(Math.ceil(data.count / 20));
                }
            } catch (error) {
                console.error("検索エラー:", error);
            }
        };

        fetchBooks();
    }, [query, page]);

    const toggleLike = async (book, event) => {
        event.preventDefault();

        if (!user) {
            alert("ログインしてください");
            return;
        }

        if (likedBooks[book.isbn]) {
            await unlikeBook(likedBooks[book.isbn]);
            setLikedBooks((prev) => {
                const newLikes = { ...prev };
                delete newLikes[book.isbn];
                return newLikes;
            });
        } else {
            const newDocId = await likeBook(user.uid, book);
            if (newDocId) {
                setLikedBooks((prev) => ({
                    ...prev,
                    [book.isbn]: newDocId,
                }));
            }
        }
    };

    return (
        <div className={styles.searchContainer}>
            <h1 className={styles.searchTitle}>「{query}」の検索結果</h1>

            <div className={styles.bookGrid}>
                {books.map((book, index) => (
                    <Link key={index} href={`/book/${book.Item.isbn}`} passHref>
                        <div className={styles.bookItem}>
                            <img src={book.Item.mediumImageUrl || "/images/no_image.png"} alt={book.Item.title} />
                            <h3>{book.Item.title}</h3>
                            <p>著者: {book.Item.author}</p>
                            <p>出版社: {book.Item.publisherName}</p>
                            <p>価格: {book.Item.itemPrice} 円</p>
                            <button
                                className={`${styles.likeButton} ${likedBooks[book.Item.isbn] ? styles.liked : ""}`}
                                onClick={(event) => toggleLike(book.Item, event)}
                            >
                                {likedBooks[book.Item.isbn] ? "❤️" : "🤍"}
                            </button>
                            <span className={styles.detailLink}>詳細を見る</span>
                        </div>
                    </Link>
                ))}
            </div>

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
