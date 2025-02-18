import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import styles from '../../styles/BookDetail.module.css';
import { likeBook, unlikeBook, getLikedBooks } from '../../lib/firestore'; // Firestore 関連の関数をインポート
import { auth } from '../../lib/firebaseConfig';

export default function BookDetail() {
    const router = useRouter();
    const { isbn } = router.query;
    const [book, setBook] = useState(null);
    const [error, setError] = useState(null);
    const [liked, setLiked] = useState(false);
    const [user, setUser] = useState(null);
    const [likedBooks, setLikedBooks] = useState({}); // ✅ ここを追加

    useEffect(() => {
        // ユーザーのログイン状態を確認
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            setUser(currentUser);
            if (currentUser && isbn) {
                const likedList = await getLikedBooks(currentUser.uid);
                const likedData = likedList.reduce((acc, book) => {
                    acc[book.isbn] = book.id;
                    return acc;
                }, {});
                setLikedBooks(likedData);
                setLiked(likedData[isbn] !== undefined);
            }
        });
        return () => unsubscribe();
    }, [isbn]);

    useEffect(() => {
        if (!user || !isbn) return;

        const fetchBookDetails = async () => {
            try {
                // 本の詳細情報を取得
                const response = await fetch(`/api/book/${isbn}`);
                if (!response.ok) throw new Error('データ取得失敗');
                const data = await response.json();
                setBook(data);

                // 「いいね済み」情報を取得
                const likedList = await getLikedBooks(user.uid);
                const likedData = likedList.reduce((acc, book) => {
                    acc[book.isbn] = book.id;
                    return acc;
                }, {});
                setLikedBooks(likedData);
                setLiked(likedData[isbn] !== undefined);
            } catch (error) {
                console.error('エラー:', error);
                setError('データの取得に失敗しました');
            }
        };

        fetchBookDetails();
    }, [user, isbn]);

    if (error) return <p>エラーが発生しました: {error}</p>;
    if (!book) return <p>読み込み中...</p>;

    // ✅ いいねボタンの動作
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
            setLikedBooks((prev) => ({
                ...prev,
                [isbn]: newDocId,
            }));
            setLiked(true);
        }
    };

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

            {/* ✅ いいねボタン */}
            <button
                className={`${styles.likeButton} ${liked ? styles.liked : ""}`}
                onClick={(event) => toggleLike(event)}
            >
                {liked ? "❤️" : "🤍"}
            </button>
        </div>
    );
}