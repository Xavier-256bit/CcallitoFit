// src/components/Routines.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from './Routines.module.css';

function Rutinas() {
  const [rutinaPorDia, setRutinaPorDia] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDia, setSelectedDia] = useState(null);

  const [avatar, setAvatar] = useState(`${process.env.PUBLIC_URL}/img/perfil.jpg`);
  const nickname = localStorage.getItem('nickname');

  useEffect(() => {
    const fetchRutina = async () => {
      const userIdFromStorage = localStorage.getItem('userId');
      if (!userIdFromStorage) {
        setLoading(false);
        setError("No se ha proporcionado el ID del usuario. Por favor, inicia sesión.");
        return;
      }
      const userId = parseInt(userIdFromStorage, 10);
      try {
        const response = await fetch(`http://localhost:5000/rutina/${userId}`);
        if (!response.ok) {
          let errorText = await response.text();
          try {
            const errorJson = JSON.parse(errorText);
            errorText = errorJson.message || errorText;
          } catch (e) {
          
          }
          throw new Error(`Error al obtener la rutina: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        setRutinaPorDia(data);
        setLoading(false);
      } catch (error) {
        setError(error.message || 'Ocurrió un error al cargar la rutina.');
        setLoading(false);
      }
    };

    fetchRutina();
  }, []);

  useEffect(() => {
    if (nickname) {
      const fetchAvatar = async (nickname) => {
        try {
          const response = await axios.get(`http://localhost:5000/usuario/${nickname}`);
          if (response.data.fotoPerfil) {
            setAvatar(`http://localhost:5000/uploads/${response.data.fotoPerfil}`);
          }
        } catch (error) {
          console.error('Error al obtener la foto de perfil:', error);
        }
      };
      fetchAvatar(nickname);
    }
    
  }, [nickname]);

  if (loading) {
    return <div className={styles.loading}>Cargando tu rutina...</div>;
  }

  if (error) {
    return (
      <div className={styles.error} role="alert">
        <strong className={styles.errorStrong}>Error: </strong>
        <span className={styles.errorSpan}>{error}</span>
      </div>
    );
  }

  if (!rutinaPorDia || Object.keys(rutinaPorDia).length === 0) {
    return <div className={styles.noRutina}>No hay ejercicios asignados a tu rutina aún.</div>;
  }

  const diasSemana = Object.keys(rutinaPorDia);

  return (
    <div className={styles.rutinaContainer}>
      <header className={styles.rutinaHeader}>
        <div id="logo" className={styles.logo}>
          <img
            src={`${process.env.PUBLIC_URL}/img/logo.png`}
            alt="logo"
            height="100"
            className={styles.logoImg} 
          />
        </div>
        <nav className={styles.menu}> 
          <ul>
            <li><Link to="/home">Inicio</Link></li>
            <li><Link to="/post">Publicaciones</Link></li>
          </ul>
        </nav>
        <div id="perfil" className={styles.profile}>
          <Link to="/profile" className={styles.profileLink}>Perfil</Link>
          <img
            src={avatar}
            alt="perfil"
            height="50"
            className={styles.profileImg}
          />
        </div>
      </header>
      <h2 className={styles.rutinaTitle}>Tu Rutina de Entrenamiento</h2>
      <div className={styles.diasSemanaContainer}>
        {diasSemana.map((dia) => {
          const esDiaSeleccionado = selectedDia === dia;
          return (
            <button
              key={dia}
              onClick={() => setSelectedDia(dia)}
              className={`${styles.diaButton} ${esDiaSeleccionado ? styles.diaButtonSeleccionado : ''}`}
            >
              {dia}
            </button>
          );
        })}
      </div>

      {selectedDia && (
        <div className={styles.ejerciciosGrid}>
          {rutinaPorDia[selectedDia].map((ejercicio, index) => (
            <div key={index} className={styles.ejercicioCard}>
              <h4 className={styles.ejercicioNombre}>{ejercicio.nombre}</h4>
              <p className={styles.ejercicioDescripcion}>
                {ejercicio.descripcion || 'No hay descripción disponible'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Rutinas;