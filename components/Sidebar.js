import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Sidebar.module.css';
import Image from 'next/image';

export default function Sidebar() {
    const [searchQuery, setSearchQuery] = useState(""); // 🔍 検索ワードを管理
    const router = useRouter();

    // 🔍 Enterキーを押したら検索ページに遷移
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && searchQuery.trim() !== "") {
            router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div className={styles.sidebar}>
            <Link href="/" className={styles.homeSection}>
                <div className={styles.homeLink}>
                    <Image src="/images/home.png" alt="Home Icon" width={50} height={50} />
                    <h2 className={styles.sidebarTitle}>Home</h2>
                </div>
            </Link>

            {/* 🔍 Enterで検索できるフォーム */}
            <input
                type="text"
                placeholder="漫画タイトル"
                className={styles.searchBar}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown} // ⬅ Enterキーで検索
            />

            <h3 className={styles.publisherTitle}>出版社選択</h3>
            <input type="text" placeholder="出版社検索" className={styles.searchBar} />

            <ul className={styles.publisherList}>
                <li className={styles.publisherItem}>・集英社</li>
                <li className={styles.publisherItem}>・講談社</li>
                <li className={styles.publisherItem}>・KADOKAWA</li>
                <li className={styles.publisherItem}>・小学館</li>
                <li className={styles.publisherItem}>・秋田書店</li>
                <li className={styles.publisherItem}>・白泉社</li>
                <li className={styles.publisherItem}>・スクウェア・エニックス</li>
                <li className={styles.publisherItem}>・双葉社</li>
                <li className={styles.publisherItem}>・徳間書店</li>
                <li className={styles.publisherItem}>・芳文社</li>
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
