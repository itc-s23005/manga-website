import { useEffect } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebaseConfig"; // ✅ Firebase 認証のインポート
import "../styles/globals.css";
import Layout from "../components/Layout"; // ✅ Layout の適用

export default function App({ Component, pageProps }) {
    const router = useRouter();
    const noLayoutPages = ["/login"]; // 🔍 Layout を適用しないページ

    useEffect(() => {
        // ✅ ユーザーの認証状態を監視
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user && router.pathname !== "/login") {
                router.push("/login"); // 🔍 未ログインなら `/login` へリダイレクト
            }
        });

        return () => unsubscribe();
    }, [router]);

    return noLayoutPages.includes(router.pathname) ? (
        <Component {...pageProps} />
    ) : (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    );
}
