import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../components/manageUsers";

import styles from "./RegisterForm.module.css";

import InputField from "../components/typable/InputField";
import PasswordField from "../components/typable/PasswordField";
import TermsCheckbox from "../components/clickable/TermsCheckbox";
import Button from "../components/clickable/Button";
import ErrorMessage from "../components/display/ErrorMessage";
import TitleDropdown from "../components/selectable_addable/TitleDropdown";

function RegisterForm({ selectedRole }) {
  const navigate = useNavigate();
  let emailPattern = /\w+@\w+\.([a-z])+/;
  const [isEnabled, setEnabled] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [errorMessages, setErrorMessages] = useState([]);
  const [role, setRole] = useState("");
  const roles = [
    { value: "", label: "" },
    { value: "Mr", label: "Mr" },
    { value: "Mrs", label: "Mrs" },
    { value: "Ms", label: "Ms" },
    { value: "Dr", label: "Dr" },
  ];

  const submitForm = (e) => {
    setEnabled(false);
    e.preventDefault();
    let message = [];
    if (password !== confirmPassword) {
      message.push("Passwords do not match");
    }
    if (!email.match(emailPattern)) {
      message.push("Enter a valid email!");
    }

    if (
      /\s/.test(password) ||
      /\s/.test(firstName) ||
      /\s/.test(lastName) ||
      /\s/.test(email)
    ) {
      message.push("Do not put spaces in the fields!");
    }
    if (message.length > 0) {
      setErrorMessages(message);
      setEnabled(true);
      return;
    } else {
      setErrorMessages([]);
    }

    console.log(
      "Form submitted. Email: ",
      email,
      " Password: ",
      password,
      selectedRole
    ); // Debugging log

    // Create user using Firebase Authentication
    // Reference function from imported JavaScript
    registerUser(
      firstName,
      lastName,
      email,
      password,
      role,
      token,
      selectedRole
    )
      .then((user) => {
        console.log(user);
        if (user) {
          console.log("User created successfully:", user); // Debugging log
          navigate("/home"); // Redirect after successful signup
          console.log(
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            role,
            selectedRole
          );
        }
      })
      .catch((error) => {
        console.error("Error creating user:", error); // Debugging log
        setErrorMessages([error]);
        setEnabled(true);
      });

    //console.log("submit form");
  };

  return (
    <form
      className={styles.infoSection}
      onSubmit={submitForm}
    >
      <div className={styles.infoHeader}>
        <h1 className={styles.infoTitle}>Sign Up</h1>
      </div>

      <div className={styles.infoScroll}>
        {selectedRole != "student" ? (
          <TitleDropdown
            label="Title"
            id="role"
            placeholder="Choose a role…"
            value={role}
            onChange={setRole}
            options={roles}
            isEnabled={isEnabled}
          />
        ) : (
          false
        )}
        <InputField
          label="First Name"
          id="firstName"
          placeholder="Enter first name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          isEnabled={isEnabled}
        />
        <InputField
          label="Last Name"
          id="lastName"
          placeholder="Enter last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          isEnabled={isEnabled}
        />
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
          placeholder="Password must be at least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordField
          label="Confirm Password"
          id="confirmPassword"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <InputField
          label="Token"
          id="token"
          placeholder="Enter token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          isEnabled={isEnabled}
        />
      </div>

      <div className={styles.infoFooter}>
        <TermsCheckbox />
        <Button type="submit" label="Register" isEnabled={isEnabled}/>
        <ErrorMessage messages={errorMessages} />
        <div className={styles.haveAccount}>
          Have an account?
          <button
            type="button"
            className={styles.switchLink}
            onClick={() => navigate("/login")}
          >
            Login Here
          </button>
        </div>
      </div>
    </form>
  );
}

export default RegisterForm;
