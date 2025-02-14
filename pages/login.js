import React, { useEffect, useState } from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { auth } from "../lib/firebaseConfig";
import styles from "../styles/login.module.css"; // ✅ CSS Modules を適用

export default function Login() {
    const router = useRouter();
    const provider = new GoogleAuthProvider();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ✅ ログイン状態を監視し、ログイン済みならトップページへ遷移
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("✅ ユーザーがログイン済み:", user);
                router.replace("/");  // ✅ `replace` に変更（戻るボタンで戻らない）
            } else {
                setLoading(false);  // ✅ ログイン状態の確認完了
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleGoogleLogin = async () => {
        try {
            console.log("🟢 ログインボタンが押されました");
            const result = await signInWithPopup(auth, provider);
            console.log("✅ ログイン成功:", result.user);
            router.replace("/");  // ✅ 成功後、`/index` へ遷移
        } catch (error) {
            console.error("🔴 ログイン失敗:", error);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>とりあえずログインしてください</h1>
            <div className={styles.box}>
                {!loading && ( // ✅ ローディング中はボタンを非表示
                    <button className={styles.googleButton} onClick={handleGoogleLogin}>
                        Googleでログイン
                    </button>
                )}
            </div>
        </div>
    );
}
