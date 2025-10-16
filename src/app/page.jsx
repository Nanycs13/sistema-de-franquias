import React from "react";
import styles from "./page.module.css";
import Header from "../components/Header";

function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <h1>Welcome to the Home Page</h1>
      </div>
    </div>
  );
}

export default Home;
