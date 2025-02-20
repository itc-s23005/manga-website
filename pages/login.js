import React, { useEffect, useState } from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, setPersistence, browserSessionPersistence } from "firebase/auth";
import { useRouter } from "next/router";
import { auth } from "../lib/firebaseConfig";
import styles from "../styles/login.module.css";

export default function Login() {
    const router = useRouter();
    const provider = new GoogleAuthProvider();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("✅ ユーザーがログイン済み:", user);
                router.replace("/");  // ログイン済みならホームへリダイレクト
            } else {
                setLoading(false);  // ログイン状態確認完了
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleGoogleLogin = async () => {
        try {
            console.log("🟢 ログインボタンが押されました");

            // 既存のセッションをサインアウト
            await signOut(auth);

            // セッションをブラウザセッションストレージに設定
            await setPersistence(auth, browserSessionPersistence);

            // 強制的にアカウント選択画面を表示
            provider.setCustomParameters({
                prompt: "select_account"
            });

            // Googleログインポップアップを表示
            const result = await signInWithPopup(auth, provider);

            if (result?.user) {
                console.log("✅ ログイン成功:", result.user);

                // 管理者用メールの確認（環境変数から取得）
                const adminGmails = process.env.NEXT_PUBLIC_ADMIN_GMAILS?.split(',') || [];
                if (adminGmails.includes(result.user.email)) {
                    router.push('/admin');  // 管理者なら/adminへ
                } else {
                    router.push('/');       // 一般ユーザーはホームへ
                }
            }

        } catch (error) {
            console.error("🔴 ログイン失敗:", error);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>とりあえずログインしてください</h1>
            <div className={styles.box}>
                {!loading && (
                    <button className={styles.googleButton} onClick={handleGoogleLogin}>
                        Googleでログイン
                    </button>
                )}
            </div>
        </div>
    );
}
