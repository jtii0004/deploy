import React from "react";
import AuthHeader from "../layout/AuthHeader";

import styles from "./ByeBye.module.css";

function ByeBye() {
  return (
    <div className={styles.container}>
      <AuthHeader />
      <main className={styles.pageContent}>
        <section className={styles.panel}>
          <span className={styles.badge}>Sign-in paused</span>
          <h1 className={styles.title}>Let's keep your account safe</h1>
          <p className={styles.subtitle}>
            After three missed login attempts we put things on hold for a moment
            to protect your progress. Take a short break and return when
            you&apos;re ready to try again.
          </p>
        </section>
      </main>
    </div>
  );
}

export default ByeBye;
