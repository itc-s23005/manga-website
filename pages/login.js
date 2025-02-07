import React from "react";
import { auth } from "../lib/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function Login() {
    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("ログイン成功:", result.user);
        } catch (error) {
            console.error("ログイン失敗:", error);
        }
    };

    return (
        <div className="login-container">
            <h1 className="login-title">とりあえずログインしてください</h1>
            <div className="login-box">
                {/* Googleログインボタン */}
                <button className="google-login" onClick={handleGoogleLogin}>
                    Googleでログイン
                </button>

                {/* 別のアカウントでログインボタン */}
                <button>別のアカウントでログイン</button>
            </div>
        </div>
    );
}
