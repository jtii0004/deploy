import React, { useState, useEffect, useCallback } from "react";

import { useNavigate } from "react-router-dom";

import {
  getTokens,
  createToken,
  removeToken,
} from "../manageUsers";

import styles from "./TokenGenerator.module.css";

function TokenGenerator({
  label = "Generate",
  role = "student",
  prefix = "STUDENT",
}) {
  const [tokens, setTokens] = useState([]);
  let navigate = useNavigate("/home");

  const fetchTokens = useCallback(() => {
    getTokens(role)
      .then((tokens) => {
        const availableTokens = tokens.filter(
          (token) => token.status !== "Used"
        );
        setTokens(availableTokens);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [role]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const generateToken = () => {
    const randomToken =
      `${prefix}` + Math.random().toString(36).substring(2, 7).toUpperCase();
    createToken(randomToken, role)
      .then(() => {
        console.log("success!");
        fetchTokens();
      })
      .catch((error) => {
        if (error == "TRY_AGAIN") {
          generateToken();
        } else {
          navigate("/home");
        }
      });
    //setTokens([...tokens, { value: randomToken, status: "Available" }]);
  };

  const handleDelete = async (token) => {
    try {
      await removeToken(token.value);
      fetchTokens();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.wholeField}>
      <button type="submit" onClick={generateToken} className={styles.button}>
        {label}
      </button>

      <div className={styles.wrapper}>
        {tokens.map((token, index) => (
          <div key={index} className={styles.tokenField}>
            <span className={styles.token}>{token.value}</span>

            <button
              className={styles.deleteButton}
              onClick={() => handleDelete(token)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TokenGenerator;
