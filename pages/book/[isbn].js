import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import styles from '../../styles/BookDetail.module.css';
import { likeBook, unlikeBook, getLikedBooks } from '../../lib/firestore';
import { auth } from '../../lib/firebaseConfig';

export default function BookDetail() {
    const router = useRouter();
    const { isbn } = router.query;
    const [book, setBook] = useState(null);
    const [error, setError] = useState(null);
    const [liked, setLiked] = useState(false);
    const [user, setUser] = useState(null);
    const [likedBooks, setLikedBooks] = useState({});

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            setUser(currentUser);
            if (currentUser && isbn) {
                const likedList = await getLikedBooks(currentUser.uid);
                const likedData = likedList.reduce((acc, book) => {
                    acc[book.isbn] = book.id;
                    return acc;
                }, {});
                setLikedBooks(likedData);
                setLiked(!!likedData[isbn]);
            }
        });
        return () => unsubscribe();
    }, [isbn]);

    useEffect(() => {
        if (!isbn) return;

        const fetchBookDetails = async () => {
            try {
                const response = await fetch(`/api/book/${isbn}`);
                if (!response.ok) throw new Error('データ取得失敗');
                const data = await response.json();
                setBook(data);
            } catch (err) {
                console.error('エラー:', err);
                setError('データの取得に失敗しました');
            }
        };

        fetchBookDetails();
    }, [isbn]);

    const toggleLike = async (event) => {
        event.preventDefault();
        if (!user) {
            alert("ログインしてください");
            return;
        }

        if (likedBooks[isbn]) {
            await unlikeBook(likedBooks[isbn]);
            setLikedBooks((prev) => {
                const newLikes = { ...prev };
                delete newLikes[isbn];
                return newLikes;
            });
            setLiked(false);
        } else {
            const newDocId = await likeBook(user.uid, book);
            setLikedBooks((prev) => ({ ...prev, [isbn]: newDocId }));
            setLiked(true);
        }
    };

    if (error) return <p>エラーが発生しました: {error}</p>;
    if (!book) return <p>読み込み中...</p>;

    return (
        <div className={styles.container}>
            <div className={styles.detailCard}>
                <div className={styles.imageSection}>
                    <img src={book.largeImageUrl || '/images/no_image.png'} alt={book.title} className={styles.bookImage} />
                </div>
                <div className={styles.infoSection}>
                    <h1 className={styles.title}>{book.title}</h1>
                    <p><strong>著者名:</strong> {book.author}</p>
                    <p><strong>出版社:</strong> {book.publisherName}</p>
                    <p><strong>出版日:</strong> {book.salesDate}</p>
                    <p><strong>価格:</strong> {book.itemPrice} 円</p>
                    <button
                        className={`${styles.likeButton} ${liked ? styles.liked : ""}`}
                        onClick={toggleLike}
                    >
                        {liked ? "❤️" : "🤍"}
                    </button>
                </div>
            </div>

            <div className={styles.descriptionSection}>
                <h2>あらすじ</h2>
                <p>{book.itemCaption || '情報なし'}</p>
                <a href={book.itemUrl} target="_blank" rel="noopener noreferrer" className={styles.purchaseButton}>
                    詳細・購入へ
                </a>
            </div>
        </div>
    );
}
