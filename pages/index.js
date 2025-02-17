import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebaseConfig";
import { likeBook, unlikeBook, getLikedBooks } from "../lib/firestore";
import styles from "../styles/Home.module.css";
import Sidebar from "../components/Sidebar";

export default function Home() {
    const router = useRouter();
    const [books, setBooks] = useState([]);
    const [featuredBook, setFeaturedBook] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [likedBooks, setLikedBooks] = useState({});

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.replace("/login");
            } else {
                setUser(currentUser);
                setLoading(false);
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
    }, [router]);

    useEffect(() => {
        if (!loading && user) {
            const fetchBooks = async () => {
                try {
                    const response = await fetch("/api/books");
                    if (!response.ok) throw new Error("Failed to fetch");
                    const data = await response.json();

                    if (data.Items && data.Items.length > 0) {
                        setFeaturedBook(data.Items[0].Item);
                        setBooks(data.Items.slice(1));
                    }
                } catch (error) {
                    console.error("Error fetching books:", error);
                }
            };
            fetchBooks();
        }
    }, [loading, user]);

    if (loading) return <p>ログインを確認中...</p>;
    if (!user) return <p>ログインしてください</p>;

    // ✅ いいねボタンの動作
    const toggleLike = async (book, event) => {
        event.preventDefault(); // ✅ いいねボタンを押した時に詳細ページに飛ばないようにする

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
        <div className={styles.container}>
            <div className={styles.background}></div>
            <Sidebar />

            {/* ⭐ 特集の1冊 */}
            {featuredBook && (
                <Link href={`/book/${featuredBook.isbn}`} passHref>
                    <div className={styles.selectedBook}>
                        <img
                            src={featuredBook.largeImageUrl || "/images/no_image.png"}
                            alt={featuredBook.title}
                        />
                        <div>
                            <h2>{featuredBook.title}</h2>
                            <p>著者名: {featuredBook.author}</p>
                            <p>値段: {featuredBook.itemPrice} 円</p>
                            <p>出版社: {featuredBook.publisherName}</p>

                            {/* ✅ いいねボタンを追加 */}
                            <button
                                className={`${styles.likeButton} ${likedBooks[featuredBook.isbn] ? styles.liked : ""}`}
                                onClick={(event) => toggleLike(featuredBook, event)}
                            >
                                {likedBooks[featuredBook.isbn] ? "❤️" : "🤍"}
                            </button>

                            <button className={styles.detailsButton}>詳細を見る</button>
                        </div>
                    </div>
                </Link>
            )}

            {/* ⭐ 漫画リスト（6×4 のレイアウト） */}
            <div className={styles.bookGrid}>
                {Array.from({ length: Math.ceil(books.length / 24) }, (_, groupIndex) => (
                    <div key={groupIndex} className={styles.bookGroup}>
                        {Array.from({ length: 4 }, (_, colIndex) => (
                            <div key={colIndex} className={styles.bookColumn}>
                                {books.slice(groupIndex * 24 + colIndex * 6, groupIndex * 24 + colIndex * 6 + 6)
                                    .map((book, index) => (
                                        <Link key={index} href={`/book/${book.Item.isbn}`} passHref>
                                            <div className={styles.bookItem}>
                                                <img src={book.Item.mediumImageUrl || "/images/no_image.png"} alt={book.Item.title} />
                                                <p>{book.Item.title}</p>

                                                {/* ✅ いいねボタン */}
                                                <button
                                                    className={`${styles.likeButton} ${likedBooks[book.Item.isbn] ? styles.liked : ""}`}
                                                    onClick={(event) => toggleLike(book.Item, event)}
                                                >
                                                    {likedBooks[book.Item.isbn] ? "❤️" : "🤍"}
                                                </button>
                                            </div>
                                        </Link>
                                    ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
