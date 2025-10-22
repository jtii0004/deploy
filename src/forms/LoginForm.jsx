import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


import { signInUser } from "../components/manageUsers";

import styles from "./LoginForm.module.css";

import InputField from "../components/typable/InputField";
import PasswordField from "../components/typable/PasswordField";
import Button from "../components/clickable/Button";

function LoginForm({ showError, setShowError }) {
  const navigate = useNavigate();

  const [isEnabled, setEnabled] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessages, setErrorMessages] = useState([]);

  const submitForm = (e) => {
    setEnabled(false);
    e.preventDefault();
    let message = [];
    let emailPattern = /\w+@\w+\.([a-z])+/;

    if (!email.match(emailPattern)) {
      message.push("Enter a valid email!");
    }

    if (/\s/.test(password)) {
      message.push("Password cannot have spaces!");
    }

    if (message.length > 0) {
      setErrorMessages(message);
      setEnabled(true);
      return;
    } else {
      setErrorMessages([]);
    }

    console.log("Form submitted. Email: ", email, " Password: ", password); // Debugging log

    // Sign in user using Firebase Authentication
    signInUser(email, password)
      .then((user) => {
        console.log(user);
        if (user) {
          console.log("User signed in:", user); // Debugging log
          console.log("User ID:", user.id);
          navigate("/home");
          console.log(username, password, errorMessages);
        }
      })
      .catch((error) => {
        setShowError(true);
        console.error("Error signing in user:", error); // Debugging log
        setErrorMessages([error]);
        setEnabled(true);
      });

    //console.log("login successful")
    //navigate("/home");
  };

  return (
    <form
      onSubmit={submitForm}
      className={styles.infoFooter}
    >
      <div className={styles.infoSection}>
        <div className={styles.infoHeader}>
          <h1 className={styles.infoTitle}>Login</h1>
        </div>

        <div className={styles.infoScroll}>
          <InputField
            label="Email"
            id="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isEnabled={isEnabled}
          />
          <PasswordField
            label="Password"
            id="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {errorMessages.length > 0 && (
            <div>
              {errorMessages.map((msg, idx) => (
                <p key={idx} style={{ color: "red" }}>
                  {msg}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className={styles.infoFooter}>
          <Button type="submit" label="Login" isEnabled={isEnabled}/>
          <div className={styles.noAccount}>
            No account?
            <button
              type="button"
              className={styles.switchLink}
              onClick={() => navigate("/reg")}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default LoginForm;
