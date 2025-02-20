import React, { useState } from 'react';
import styles from './FormValidator.module.css';
const FormValidator = () => {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
  });

  const [valid, setValid] = useState({
    name: false,
    password: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // computed property names
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let error = ""
    Object.entries(valid).forEach(([key, value]) => {
      if (value === true) error += "\n not valid field: " + key
    });
    if (error != "") alert(error);
    else
      alert(JSON.stringify(formData));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value.length < 2) {
      setValid({ ...valid, [name]: true });
    }
    if (value.length >= 2) {
      setValid({ ...valid, [name]: false });
    }
  }
  /*
    const handleBlur = (e) => {
      const { name, value } = e.target;
      console.log(name, value ,value.length)
      if (value.length < 2 && name === "name") {
        setValid({ ...valid, name: true });
      } 
          if (value.length >= 2 && name === "name") {
        setValid({ ...valid, name: false });
      } 
          if (value.length >= 2 && name === "password"){
        console.log(name, value, value.length)
        setValid({ ...valid, password: false });
      }
      if (value.length < 2 && name === "password"){
        console.log(name, value, value.length)
        setValid({ ...valid, password: true });
      }
    };
  */
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label
          id="lname"
          className={valid.name ? styles.errorLabel : ''}
          htmlFor="name"
        >
          Name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className={valid.name ? styles.errorInput : ''}
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <span className={valid.name ? styles.errorLabel : ''}>{valid.name && " min. 2 chars"}</span>
      </div>
      <div>
        <label className={valid.password ? styles.errorLabel : ''} htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          className={valid.password ? styles.errorInput : ''}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <span className={valid.password ? styles.errorLabel : ''}>{valid.password && " min. 2 chars"}</span>
      </div>
      <button type="submit">
        <span>Show alert</span>
      </button>
    </form>
  );
};

export default FormValidator;
