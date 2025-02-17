import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Sidebar.module.css';
import Image from 'next/image';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth"; // 🔍 Firebase Authをインポート
import { getLikedBooks } from "../lib/firestore"; // 🔥 Firestore からデータを取得

export default function Sidebar() {
    const [searchQuery, setSearchQuery] = useState("");
    const [publisherQuery, setPublisherQuery] = useState(""); // 🔍 出版社検索用
    const [savedCount, setSavedCount] = useState(0); // ✅ 保存した作品数
    const [user, setUser] = useState(null);
    const router = useRouter();
    const auth = getAuth(); // ✅ Firebase Auth インスタンスを取得

    useEffect(() => {
        // 🔥 ログイン状態を監視
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchSavedBooks(currentUser.uid);
            } else {
                setUser(null);
                setSavedCount(0);
            }
        });
        return () => unsubscribe();
    }, []);

    // ✅ Firestore から「保存した作品」を取得
    const fetchSavedBooks = async (userId) => {
        const likedBooks = await getLikedBooks(userId);
        setSavedCount(likedBooks.length);
    };

    // 🔍 漫画タイトル検索（Enterキーで実行）
    const handleTitleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim() !== "") {
            router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    // 🔍 出版社検索（Enterキーで実行）
    const handlePublisherSearch = (e) => {
        if (e.key === 'Enter' && publisherQuery.trim() !== "") {
            router.push(`/publisher?name=${encodeURIComponent(publisherQuery)}`);
        }
    };

    // 🚀 **ログアウト処理**
    const handleLogout = async () => {
        try {
            await signOut(auth); // 🔍 Firebaseからログアウト
            console.log("✅ ログアウト成功");
            router.push("/login"); // 🚀 ログイン画面へリダイレクト
        } catch (error) {
            console.error("🔴 ログアウト失敗:", error);
        }
    };

    // **出版社一覧**
    const publishers = [
        "集英社", "講談社", "KADOKAWA", "小学館", "秋田書店",
        "白泉社", "スクウェア・エニックス", "双葉社", "徳間書店", "芳文社"
    ];

    return (
        <div className={styles.sidebar}>
            <Link href="/" className={styles.homeSection}>
                <div className={styles.homeLink}>
                    <Image src="/images/home.png" alt="Home Icon" width={50} height={50} />
                    <h2 className={styles.sidebarTitle}>Home</h2>
                </div>
            </Link>

            {/* 🔍 漫画タイトル検索 */}
            <input
                type="text"
                placeholder="漫画タイトル"
                className={styles.searchBar}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleTitleSearch}
            />

            <h3 className={styles.publisherTitle}>出版社検索</h3>

            {/* 🔍 出版社検索バー */}
            <input
                type="text"
                placeholder="出版社を入力（Enterで検索）"
                className={styles.searchBar}
                value={publisherQuery}
                onChange={(e) => setPublisherQuery(e.target.value)}
                onKeyDown={handlePublisherSearch}
            />

            {/* 📌 出版社一覧 */}
            <ul className={styles.publisherList}>
                {publishers.map((publisher, index) => (
                    <li key={index} className={styles.publisherItem}>
                        <Link href={`/publisher?name=${encodeURIComponent(publisher)}`}>
                            ・{publisher}
                        </Link>
                    </li>
                ))}
            </ul>

            <Link href="/ranking">
                <button className={styles.sidebarButton}>
                    <Image src="/images/ranking.png" alt="Ranking Icon" width={30} height={30} />
                    <span>ランキング</span>
                </button>
            </Link>

            {/* ✅ 保存した作品ページへのボタン */}
            <Link href="/saved">
                <button className={`${styles.sidebarButton} ${styles.likeButton}`}>
                    <Image src="/images/like.png" alt="Like Icon" width={30} height={30} />
                    <span>保存した作品 ({savedCount})</span> {/* 🔥 いいね数を表示 */}
                </button>
            </Link>

            {/* 🚀 ログアウトボタン */}
            <button className={styles.logoutButton} onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}
