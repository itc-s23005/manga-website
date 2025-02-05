import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import Sidebar from '../components/Sidebar';

export default function Ranking() {
    const [rankingBooks, setRankingBooks] = useState([]);

    useEffect(() => {
        const fetchRankingBooks = async () => {
            try {
                const response = await fetch('/api/ranking');
                if (!response.ok) throw new Error('Failed to fetch ranking books');
                const data = await response.json();
                setRankingBooks(data.Items || []);
            } catch (error) {
                console.error('Error fetching ranking books:', error);
            }
        };
        fetchRankingBooks();
    }, []);

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.content}>
                <h1>ランキング</h1>
                <div className={styles.bookList}>
                    {rankingBooks.map((book, index) => (
                        <div key={index} className={styles.bookItem}>
                            <span className={styles.rankNumber}>{index + 1}</span>
                            <img src={book.Item.mediumImageUrl || '/images/no_image.png'} alt={book.Item.title} />
                            <p>{book.Item.title}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
