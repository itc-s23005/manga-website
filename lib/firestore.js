import { db } from "./firebaseConfig";
import { collection, addDoc, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";

// ✅ いいねした作品を Firestore に追加
export const likeBook = async (userId, book) => {
    try {
        const booksRef = collection(db, "likedBooks");
        const q = query(booksRef, where("userId", "==", userId), where("isbn", "==", book.isbn));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            console.log("この作品はすでにいいね済みです");
            return null; // 既に存在する場合は追加しない
        }

        const newDoc = await addDoc(booksRef, {
            userId,
            isbn: book.isbn,
            title: book.title,
            mediumImageUrl: book.mediumImageUrl,
        });

        return newDoc.id;
    } catch (error) {
        console.error("いいねの保存に失敗:", error);
        return null;
    }
};

// ✅ Firestore からいいねした作品を取得
export const getLikedBooks = async (userId) => {
    try {
        const booksRef = collection(db, "likedBooks");
        const q = query(booksRef, where("userId", "==", userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("いいねした作品の取得に失敗:", error);
        return [];
    }
};

// ✅ Firestore からいいねした作品を削除
export const unlikeBook = async (docId) => {
    try {
        await deleteDoc(doc(db, "likedBooks", docId));
    } catch (error) {
        console.error("いいねの削除に失敗:", error);
    }
};
