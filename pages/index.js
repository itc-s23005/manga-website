import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import Sidebar from '../components/Sidebar';

export default function Home() {
    const [books, setBooks] = useState([]);
    const [featuredBook, setFeaturedBook] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch('/api/books');
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();

                if (data.Items && data.Items.length > 0) {
                    setFeaturedBook(data.Items[0].Item);
                    setBooks(data.Items.slice(1));
                }
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };
        fetchBooks();
    }, []);

    return (
        <div className={styles.container}>
            {/* ⭐ 背景画像 */}
            <div className={styles.background}></div>

            {/* ⭐ サイドバー */}
            <Sidebar />

            {/* ⭐ 上部に1冊だけ固定表示 */}
            {featuredBook && (
                <Link href={`/book/${featuredBook.isbn}`} passHref>
                    <div className={styles.selectedBook}>
                        <img src={featuredBook.largeImageUrl || '/images/no_image.png'} alt={featuredBook.title} />
                        <div>
                            <h2>{featuredBook.title}</h2>
                            <p>著者名: {featuredBook.author}</p>
                            <p>値段: {featuredBook.itemPrice} 円</p>
                            <p>出版社: {featuredBook.publisherName}</p>
                            <button className={styles.detailsButton}>詳細を見る</button>
                        </div>
                    </div>
                </Link>
            )}

            {/* ⭐ 6×4のグループで漫画を表示 */}
            <div className={styles.bookGrid}>
                {Array.from({ length: Math.ceil(books.length / 24) }, (_, groupIndex) => (
                    <div key={groupIndex} className={styles.bookGroup}>
                        {Array.from({ length: 4 }, (_, colIndex) => (
                            <div key={colIndex} className={styles.bookColumn}>
                                {books
                                    .slice(groupIndex * 24 + colIndex * 6, groupIndex * 24 + colIndex * 6 + 6)
                                    .map((book, index) => (
                                        <Link key={index} href={`/book/${book.Item.isbn}`} passHref>
                                            <div className={styles.bookItem}>
                                                <img src={book.Item.mediumImageUrl || '/images/no_image.png'} alt={book.Item.title} />
                                                <p>{book.Item.title}</p>
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
