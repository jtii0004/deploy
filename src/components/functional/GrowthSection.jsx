import React from "react";
import styles from "./GrowthSection.module.css";
import tree_stage_1 from "../../../images/tree stages/tree (1).png";
import tree_stage_2 from "../../../images/tree stages/tree (2).png";
import tree_stage_3 from "../../../images/tree stages/tree (3).png";
import tree_stage_4 from "../../../images/tree stages/tree (4).png";
import tree_stage_5 from "../../../images/tree stages/tree (5).png";

export default function GrowthSection({ progress }) {
  let stageIcon = tree_stage_1;
  if (progress >= 20 && progress < 40) stageIcon = tree_stage_2;
  else if (progress >= 40 && progress < 75) stageIcon = tree_stage_3;
  else if (progress >= 75 && progress < 100) stageIcon = tree_stage_4;
  else if (progress == 100) stageIcon = tree_stage_5;

  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <img
          src={stageIcon}
          alt="Growth Stage"
          className={styles.growthImage}
        />
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className={styles.progressText}>{progress.toFixed(2)}% Complete</p>
    </div>
  );
}
