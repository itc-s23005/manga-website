import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Sidebar.module.css';
import Image from 'next/image';

export default function Sidebar() {
    const [searchQuery, setSearchQuery] = useState("");
    const [publisherQuery, setPublisherQuery] = useState(""); // 🔍 出版社検索用
    const router = useRouter();

    // 🔍 漫画タイトル検索（Enterキーで実行）
    const handleTitleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim() !== "") {
            router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    // 🔍 出版社検索（Enterキーで実行 → 直接出版社のページへ遷移）
    const handlePublisherSearch = (e) => {
        if (e.key === 'Enter' && publisherQuery.trim() !== "") {
            router.push(`/publisher?name=${encodeURIComponent(publisherQuery)}`);
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

            <button className={`${styles.sidebarButton} ${styles.likeButton}`}>
                <Image src="/images/like.png" alt="Like Icon" width={30} height={30} />
                <span>保存した作品</span>
            </button>

            <button className={styles.logoutButton}>Logout</button>
        </div>
    );
}
