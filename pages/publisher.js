// pages/publisher.js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';
import { likeBook, unlikeBook, getLikedBooks } from '../lib/firestore';
import styles from '../styles/Publisher.module.css';
import Sidebar from '../components/Sidebar';

const ITEMS_PER_PAGE = 24; // 1ページあたりの表示数

export default function PublisherPage() {
    const router = useRouter();
    const { name, page = 1 } = router.query;
    const [books, setBooks] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [user, setUser] = useState(null);
    const [likedBooks, setLikedBooks] = useState({});

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
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
        if (!name) return;

        const fetchBooksByPublisher = async () => {
            try {
                const response = await fetch(`/api/publisher?name=${encodeURIComponent(name)}&page=${page}`);
                if (!response.ok) throw new Error('Failed to fetch books');
                const data = await response.json();

                setBooks(data.Items || []);
                setTotalPages(Math.ceil(data.count / ITEMS_PER_PAGE));
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };

        fetchBooksByPublisher();
    }, [name, page]);

    const toggleLike = async (book, event) => {
        event.preventDefault();

        if (!user) {
            alert('いいねするにはログインが必要です！');
            return;
        }

        if (likedBooks[book.isbn]) {
            await unlikeBook(likedBooks[book.isbn]);
            setLikedBooks((prev) => {
                const updated = { ...prev };
                delete updated[book.isbn];
                return updated;
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
            <Sidebar />
            <div className={styles.content}>
                <h1 className={styles.title}>{name} の漫画一覧</h1>

                <div className={styles.bookGrid}>
                    {books.map((book, index) => (
                        <Link key={index} href={`/book/${book.Item.isbn}`} passHref>
                            <div className={styles.bookItem}>
                                <img src={book.Item.mediumImageUrl || '/images/no_image.png'} alt={book.Item.title} />
                                <p>{book.Item.title}</p>
                                <button
                                    className={`${styles.likeButton} ${likedBooks[book.Item.isbn] ? styles.liked : ''}`}
                                    onClick={(event) => toggleLike(book.Item, event)}
                                >
                                    {likedBooks[book.Item.isbn] ? '❤️' : '🤍'}
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className={styles.pagination}>
                    {page > 1 && (
                        <button onClick={() => router.push(`/publisher?name=${name}&page=${Number(page) - 1}`)}>
                            ← 前のページ
                        </button>
                    )}
                    <span>ページ {page} / {totalPages}</span>
                    {page < totalPages && (
                        <button onClick={() => router.push(`/publisher?name=${name}&page=${Number(page) + 1}`)}>
                            次のページ →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
