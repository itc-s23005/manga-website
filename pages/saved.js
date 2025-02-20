import React, { useEffect, useState } from "react";
import { getLikedBooks, unlikeBook } from "../lib/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebaseConfig";
import styles from "../styles/Saved.module.css";
import Sidebar from "../components/Sidebar";

export default function Saved() {
    const [savedBooks, setSavedBooks] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchSavedBooks(currentUser.uid);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchSavedBooks = async (userId) => {
        const liked = await getLikedBooks(userId);
        setSavedBooks(liked);
    };

    const handleUnlike = async (docId) => {
        await unlikeBook(docId);
        setSavedBooks((prev) => prev.filter((book) => book.id !== docId));
    };

    return (
        <div className={styles.container}>
            <Sidebar />
            <h2 className={styles.title}>💖 保存した作品</h2>
            <div className={styles.bookList}>
                {savedBooks.length === 0 ? (
                    <p className={styles.emptyMessage}>📂 保存された作品がありません</p>
                ) : (
                    savedBooks.map((book) => (
                        <div key={book.id} className={styles.bookItem}>
                            <img
                                src={book.mediumImageUrl || "/images/no_image.png"}
                                alt={book.title}
                                className={styles.bookImage}
                            />
                            <p className={styles.bookTitle} title={book.title}>{book.title}</p>
                            <button
                                className={styles.unlikeButton}
                                onClick={() => handleUnlike(book.id)}
                            >
                                🗑️ 削除
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}