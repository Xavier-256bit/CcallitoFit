// src/components/Profile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from "./Profile.module.css"; 

const Profile = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [nickname, setNickname] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('nickname');
    if (stored) {
      setNickname(stored);
      fetchAvatar(stored);
    } else {
      setMessage('Debes iniciar sesión primero');
    }
  }, []);

  const fetchAvatar = async (nickname) => {
    try {
      const response = await axios.get(`http://localhost:5000/usuario/${nickname}`);
      console.log('Avatar:', response.data.fotoPerfil);

      const avatarUrl = response.data.fotoPerfil
        ? `http://localhost:5000/uploads/${response.data.fotoPerfil}`
        : `${process.env.PUBLIC_URL}/img/perfil.jpg`;

      setAvatar(avatarUrl);
    } catch (error) {
      console.error('Error al obtener la foto de perfil:', error);
      setAvatar(`${process.env.PUBLIC_URL}/img/perfil.jpg`);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMessage('Selecciona un archivo primero');

    const nickname = localStorage.getItem('nickname');
    if (!nickname) {
      return setMessage('Debes iniciar sesión primero');
    }

    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('nickname', nickname);

    try {
      const res = await axios.post(
        'http://localhost:5000/upload-avatar',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setMessage(res.data.message);
      fetchAvatar(nickname);
    } catch (err) {
      console.error('Error al subir la foto:', err.response?.data || err.message);
      setMessage(err.response?.data?.message || 'Error al subir la foto');
    }
  };

  return (
    <div className={styles.profileContainer}>
      <header className={styles.profileHeader}>
        <div id="logo" className={styles.logo}>
          <img
            src={`${process.env.PUBLIC_URL}/img/logo.png`}
            alt="logo"
            height="50"
            className={styles.logoImg}
          />
        </div>
        <nav className={styles.menu}>
          <ul>
            <li><Link to="/home">Inicio</Link></li>
            <li><Link to="/post">Publicaciones</Link></li>
          </ul>
        </nav>
      </header>

      <section id="contenido" className={styles.contentSection}>
        <h1 className={styles.profileNickname}>{nickname}</h1>
        <img
          src={avatar || `${process.env.PUBLIC_URL}/img/perfil.jpg`}
          alt="perfil"
          height="150"
          className={styles.profileAvatar}
        />


        <form onSubmit={handleUpload} encType="multipart/form-data" className={styles.uploadForm}> 
          <label className={styles.uploadLabel}>
            Cambiar Foto de Perfil:
            <input
              name="archivo"
              id="archivo"
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              required
            />
          </label>
          <button type="submit" className={styles.uploadButton}>Subir</button>
        </form>

        {message && <p className={styles.message}>{message}</p>}
      </section>

      <footer className={styles.profileFooter}>
        <p>&copy; CcalloCORP</p>
      </footer>
    </div>
  );
};

export default Profile;

