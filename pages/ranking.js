import { useState, useEffect } from 'react';
import styles from '../styles/Ranking.module.css';
import Sidebar from '../components/Sidebar';

const publishers = [
    "集英社", "KADOKAWA", "小学館", "秋田書店", "白泉社",
    "スクウェア・エニックス", "双葉社", "徳間書店", "芳文社"
];

export default function Ranking() {
    const [selectedPublisher, setSelectedPublisher] = useState("集英社");
    const [rankingBooks, setRankingBooks] = useState([]);

    useEffect(() => {
        const fetchRankingBooks = async () => {
            try {
                const response = await fetch(`/api/ranking?publisher=${selectedPublisher}`);
                if (!response.ok) throw new Error('Failed to fetch ranking books');
                const data = await response.json();
                setRankingBooks(data.Items || []);
            } catch (error) {
                console.error('Error fetching ranking books:', error);
            }
        };
        fetchRankingBooks();
    }, [selectedPublisher]);

    return (
        <div className={styles.container}>
            <Sidebar />

            <div className={styles.content}>
                <h1>{selectedPublisher} 売上ランキング top10</h1>

                {/* 出版社選択ボタン */}
                <div className={styles.publisherButtons}>
                    {publishers.map((publisher) => (
                        <button
                            key={publisher}
                            className={`${styles.publisherButton} ${selectedPublisher === publisher ? styles.active : ''}`}
                            onClick={() => setSelectedPublisher(publisher)}
                        >
                            {publisher}
                        </button>
                    ))}
                </div>

                {/* ランキングリスト */}
                <div className={styles.bookList}>
                    {rankingBooks.map((book, index) => (
                        <div key={index} className={styles.bookItem}>
                            <span className={styles.rankNumber}>{index + 1}位</span>
                            <img src={book.Item.mediumImageUrl || '/images/no_image.png'} alt={book.Item.title} />
                            <div className={styles.bookDetails}>
                                <h3>{book.Item.title}</h3>
                                <p>著者名：{book.Item.author}</p>
                                <p>価格：{book.Item.itemPrice} 円</p>
                                <a href={book.Item.itemUrl} target="_blank" rel="noopener noreferrer">
                                    詳細・購入へ
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
