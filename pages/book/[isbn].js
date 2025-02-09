import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import styles from '../../styles/BookDetail.module.css';

export default function BookDetail() {
    const router = useRouter();
    const { isbn } = router.query;
    const [book, setBook] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isbn) return;

        const fetchBookDetails = async () => {
            try {
                const response = await fetch(`/api/book/${isbn}`);
                if (!response.ok) throw new Error('データ取得失敗');
                const data = await response.json();
                setBook(data);
            } catch (error) {
                console.error('エラー:', error);
                setError('データの取得に失敗しました');
            }
        };

        fetchBookDetails();
    }, [isbn]);

    if (error) return <p>エラーが発生しました: {error}</p>;
    if (!book) return <p>読み込み中...</p>;

    return (
        <div className={styles.container}>
            <h1>{book.title}</h1>
            <img src={book.largeImageUrl || '/images/no_image.png'} alt={book.title} />
            <p><strong>著者:</strong> {book.author}</p>
            <p><strong>出版社:</strong> {book.publisherName}</p>
            <p><strong>出版日:</strong> {book.salesDate}</p>
            <p><strong>価格:</strong> {book.itemPrice} 円</p>
            <p><strong>あらすじ:</strong> {book.itemCaption || '情報なし'}</p>
            <a href={book.itemUrl} target="_blank" rel="noopener noreferrer">詳細・購入へ</a>
        </div>
    );
}
