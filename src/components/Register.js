// src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import styles from './Register.module.css';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    nickname: '',
    contraseña: '',
    correo: '',
    edad: '',
    imc: '',
    frecuencia: '',
    experiencia: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/register', formData);
      console.log('Respuesta del backend:', response.data);
      setMessage('Usuario registrado con éxito');

    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setMessage('Error al registrar usuario');
    }
  };

  return (
    <div className={styles.registerContainer}>
      <header className={styles.registerHeader}>
        <div id="logo" className={styles.logo}> 
          <img src={`${process.env.PUBLIC_URL}/img/logo.png`} alt="logo" className={styles.logoImg} />
        </div>
      </header>

      <section id="formulario" className={styles.formSection}> 
        <h2 className={styles.formTitle}>Registro de Usuario</h2> 
        <form onSubmit={handleSubmit} className={styles.registerForm}> 
          <label htmlFor="nombre" className={styles.label}>Nombre:</label><br />
          <input
            type="text"
            name="nombre"
            id="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ingrese su Nombre"
            required
            className={styles.input}
          /><br />

          <label htmlFor="apellidos" className={styles.label}>Apellidos:</label><br />
          <input
            type="text"
            name="apellidos"
            id="apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            placeholder="Ingrese sus Apellidos"
            required
            className={styles.input}
          /><br />

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

          <label htmlFor="correo" className={styles.label}>E-mail:</label><br /> 
          <input
            type="email"
            name="correo"
            id="correo"
            value={formData.correo}
            onChange={handleChange}
            placeholder="Ingrese su E-mail"
            required
            className={styles.input}
          /><br />

          <label htmlFor="edad" className={styles.label}>Edad:</label><br /> 
          <input
            type="number"
            name="edad"
            id="edad"
            value={formData.edad}
            onChange={handleChange}
            min="18"
            placeholder="Ingrese su Edad"
            required
            className={styles.input} 
          /><br />

          <label htmlFor="imc" className={styles.label}>IMC:</label><br /> 
          <input
            type="number"
            name="imc"
            id="imc"
            value={formData.imc}
            onChange={handleChange}
            placeholder="Ingrese su IMC"
            required
            className={styles.input}
          /><br />

          <label htmlFor="frecuencia" className={styles.label}>Frecuencia:</label><br />
          <input
            type="number"
            name="frecuencia"
            id="frecuencia"
            value={formData.frecuencia}
            onChange={handleChange}
            min="3"
            placeholder="Ingrese su Frecuencia"
            required
            className={styles.input}
          /><br />

          <label htmlFor="experiencia" className={styles.label}>Experiencia (1-3):</label><br />
          <input
            type="number"
            name="experiencia"
            id="experiencia"
            value={formData.experiencia}
            onChange={handleChange}
            min="1"
            max="3"
            placeholder="Ingrese su Experiencia"
            required
            className={styles.input}
          /><br />

          <hr className={styles.hr} /> 
          <button type="submit" className={styles.registerButton}>REGISTRARSE</button>
        </form>
      </section>

      {message && <p className={styles.message}>{message}</p>}

      <section id="iniciosesion" className={styles.loginSection}>
        <Link to="/login" className={styles.loginLink}>
          <button className={styles.loginButton}>INICIA SESION</button> 
        </Link>
      </section>

      <footer className={styles.registerFooter}>
        <p>&copy; CcalloCORP</p>
      </footer>
    </div>
  );
};

export default Register;
