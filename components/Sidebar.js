import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Sidebar.module.css';
import Image from 'next/image';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getLikedBooks } from "../lib/firestore";

export default function Sidebar() {
    const [searchQuery, setSearchQuery] = useState("");
    const [publisherQuery, setPublisherQuery] = useState("");
    const [savedCount, setSavedCount] = useState(0);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const auth = getAuth();

    useEffect(() => {
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

    const fetchSavedBooks = async (userId) => {
        const likedBooks = await getLikedBooks(userId);
        setSavedCount(likedBooks.length);
    };

    const handleTitleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim() !== "") {
            router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handlePublisherSearch = (e) => {
        if (e.key === 'Enter' && publisherQuery.trim() !== "") {
            router.push(`/publisher?name=${encodeURIComponent(publisherQuery)}`);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("✅ ログアウト成功");
            router.push("/login");
        } catch (error) {
            console.error("🔴 ログアウト失敗:", error);
        }
    };

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

            <input
                type="text"
                placeholder="漫画タイトル"
                className={styles.searchBar}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleTitleSearch}
            />

            <h3 className={styles.publisherTitle}>出版社検索</h3>

            <input
                type="text"
                placeholder="出版社を入力（Enterで検索）"
                className={styles.searchBar}
                value={publisherQuery}
                onChange={(e) => setPublisherQuery(e.target.value)}
                onKeyDown={handlePublisherSearch}
            />

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

            <Link href="/saved">
                <button className={`${styles.sidebarButton} ${styles.likeButton}`}>
                    <Image src="/images/like.png" alt="Like Icon" width={30} height={30} />
                    <span>保存した作品 ({savedCount})</span>
                </button>
            </Link>

            <button className={styles.logoutButton} onClick={handleLogout}>
                Logout
            </button>

            {/* ✅ Rakuten Web Services Attribution (ログアウトボタンの下に追加) */}
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <a href="https://webservice.rakuten.co.jp/" target="_blank" rel="noopener noreferrer">
                    <img
                        src="https://webservice.rakuten.co.jp/img/credit/200709/credit_22121.gif"
                        alt="Rakuten Web Service Center"
                        title="Rakuten Web Service Center"
                        width="221"
                        height="21"
                        style={{ border: 0 }}
                    />
                </a>
            </div>
        </div>
    );
}
