import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Publisher.module.css';
import Sidebar from '../components/Sidebar';

const ITEMS_PER_PAGE = 20; // 🔹 1ページあたりの表示数

export default function PublisherPage() {
    const router = useRouter();
    const { name, page = 1 } = router.query; // `name` と `page` を取得
    const [books, setBooks] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!name) return;

        const fetchBooksByPublisher = async () => {
            try {
                const response = await fetch(`/api/publisher?name=${encodeURIComponent(name)}&page=${page}`);
                if (!response.ok) throw new Error('Failed to fetch books');
                const data = await response.json();

                setBooks(data.Items || []);
                setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE)); // 🔹 総ページ数を計算
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };

        fetchBooksByPublisher();
    }, [name, page]);

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.content}>
                <h1 className={styles.title}>{name} の漫画一覧</h1>

                {/* 🔹 漫画一覧 */}
                <div className={styles.bookGrid}>
                    {books.map((book, index) => (
                        <Link key={index} href={`/book/${book.Item.isbn}`} passHref>
                            <div className={styles.bookItem}>
                                <img src={book.Item.mediumImageUrl || '/images/no_image.png'} alt={book.Item.title} />
                                <p>{book.Item.title}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* 🔹 ページネーション */}
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
