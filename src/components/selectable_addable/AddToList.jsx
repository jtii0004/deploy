import React from "react";

import InputField from "../typable/InputField";
import TextArea from "../typable/TextArea";

import styles from "./AddToList.module.css";

function AddToList({
  label,
  placeholder,
  currentItem,
  setCurrentItem,
  itemList,
  setItemList,
  multiline = false,
  isEnabled=true
}) {
  const handleAddItem = () => {
    if (currentItem.trim()) {
      setItemList((prev) => [...prev, currentItem.trim()]);
      setCurrentItem("");
    }
  };

  const handleDelete = (itemToDelete) => {
    setItemList((prev) => prev.filter((item) => item !== itemToDelete));
  };

  const InputComponent = multiline ? TextArea : InputField;
  const inputProps = multiline
    ? {
        label,
        value: currentItem,
        placeholder,
        onChange: (e) => setCurrentItem(e.target.value),
        id: `${label.replace(/\s+/g, "-").toLowerCase()}-input`,
      }
    : {
        label,
        type: "text",
        value: currentItem,
        onChange: (e) => setCurrentItem(e.target.value),
        placeholder,
        id: `${label.replace(/\s+/g, "-").toLowerCase()}-input`,
        style: { flex: 1 },
      };

  return (
    <div className={styles.wholeField}>
      <div
        className={`${styles.addingPart} ${
          multiline ? styles.addingPartMultiline : ""
        }`}
      >
        <InputComponent {...inputProps} />
        <button
          className={`${styles.addButton} ${
            multiline ? styles.addButtonMultiline : ""
          }`}
          type="button"
          onClick={handleAddItem}
          disabled={!isEnabled}
        >
          Add
        </button>
      </div>

      <ul className={styles.readingList}>
        {itemList.map((item, index) => (
          <li key={index} className={styles.readingItem}>
            <span className={styles.readingText}>{item}</span>
            <button
              className={styles.deleteButton}
              onClick={() => handleDelete(item)}
              type="button"
              disabled={!isEnabled}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AddToList;
