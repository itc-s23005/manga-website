import Sidebar from "./Sidebar";
import styles from "../styles/Layout.module.css";

export default function Layout({ children }) {
    return (
        <div className={styles.layout}>
            <Sidebar />
            <main className={styles.content}>{children}</main>
        </div>
    );
}
