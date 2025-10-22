import React, { useState, useEffect } from "react";
import styles from "./SearchBar.module.css";
import searchIcon from "@images/icons/search.png";

function SearchBar({ usersFunction, deleteHandler }) {
  const [searchValue, setSearchValue] = useState("");
  const [searchBar, setSearchBar] = useState("");

  const [selectedUsers, setSelectedUsers] = useState([]);

  const userRefresh = () => {
    usersFunction().then((res) => {
      setSelectedUsers(
        res.filter((user) => {
          const fullName = `${user.firstName} ${user.lastName}`;
          return fullName.includes(searchValue);
        })
      );
    });
  };

  useEffect(() => {
    userRefresh();
  }, [searchValue]);

  function handleDelete(token) {
    deleteHandler(token).then(() => {
      userRefresh();
    });
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchBar}>
        <input
          label="Student Name"
          type="text"
          id="student_name"
          value={searchBar}
          onChange={(e) => {
            setSearchBar(e.target.value);
          }}
          className={styles.searchInput}
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              setSearchBar(e.target.value);
            }
          }}
        />

        <button
          className={styles.searchButton}
          onClick={() => setSearchValue(searchBar)}
        >
          <img
            src={searchIcon}
            alt="Search"
            className={styles.searchIcon}
          />
        </button>
      </div>

      <div className={styles.resultsList}>
        {selectedUsers.map((user) => (
          <div
            key={user.id || `${user.firstName}-${user.lastName}`}
            className={styles.resultField}
          >
            <span className={styles.resultItem}>
              {`${user.firstName} ${user.lastName}`}
            </span>

            <button
              className={styles.deleteButton}
              onClick={() => handleDelete(user.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchBar;
