// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    nickname: '',
    contraseña: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', formData);
      console.log('Inicio de sesión exitoso:', response.data);
      localStorage.setItem('nickname', formData.nickname);
      const userId = response.data.id;
      localStorage.setItem('userId', userId);
      console.log('userId', userId);

      setMessage('Inicio de sesión exitoso');
      navigate('/home');
    } catch (error) {
      console.error('Error en el inicio de sesión:', error.response?.data || error);
      setMessage(error.response?.data || 'Error al iniciar sesión');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <header className={styles.loginHeader}>
        <div id="logo" className={styles.logo}> 
          <img src={`${process.env.PUBLIC_URL}/img/logo.png`} alt="logo" className={styles.logoImg} /> 
        </div>
      </header>

      <section id="formulario" className={styles.formSection}>
        <form onSubmit={handleSubmit} className={styles.loginForm}> 
          <label htmlFor="nickname" className={styles.label}>Nickname:</label><br />
          <input
            type="text"
            name="nickname"
            id="nickname"
            value={formData.nickname}
            onChange={handleChange}
            pattern="[a-zA-Z0-9]+"
            placeholder="Ingrese su Nickname"
            required
            className={styles.input} 
          /><br />

          <label htmlFor="contraseña" className={styles.label}>Contraseña:</label><br />
          <input
            type="password"
            name="contraseña"
            id="contraseña"
            value={formData.contraseña}
            onChange={handleChange}
            placeholder="Ingrese su Contraseña"
            required
            className={styles.input} 
          /><br />

          <hr className={styles.hr} />
          <button type="submit" className={styles.loginButton}>Iniciar Sesión</button> 
        </form>
      </section>

      {message && <p className={styles.message}>{message}</p>}

      <section id="registrarse" className={styles.registerSection}>
        <Link to="/register" className={styles.registerLink}>
          <button className={styles.registerButton}>REGISTRARSE</button>
        </Link>
      </section>

      <footer className={styles.loginFooter}>
        <p>&copy; CcalloCORP</p>
      </footer>
    </div>
  );
};

export default Login;


