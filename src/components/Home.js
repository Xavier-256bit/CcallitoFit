import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from "./Home.module.css";
import axios from 'axios';

const Home = () => {
  const [avatar, setAvatar] = useState(`${process.env.PUBLIC_URL}/img/perfil.jpg`);
  const nickname = localStorage.getItem('nickname');

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

  return (
    <div className={styles.homeContainer}> 
      <header className={styles.homeHeader}>
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

      <section id="ejercicios" className={styles.exercisesSection}>
        <h1 className={styles.exercisesTitle}>Explora tus Rutinas</h1>
        <div className={styles.exercisesGrid}>
          <div className={styles.exerciseItem}>
            <img src={`${process.env.PUBLIC_URL}/img/ejercicio1.jpg`} alt="Ejercicio 1" className={styles.exerciseImg} />
            <h2 className={styles.exerciseName}>Ejercicio 1</h2>
          </div>
          <div className={styles.exerciseItem}>
            <img src={`${process.env.PUBLIC_URL}/img/ejercicio2.jpg`} alt="Ejercicio 2" className={styles.exerciseImg} />
            <h2 className={styles.exerciseName}>Ejercicio 2</h2>
          </div>
          <div className={styles.exerciseItem}>
            <img src={`${process.env.PUBLIC_URL}/img/ejercicio3.jpg`} alt="Ejercicio 3" className={styles.exerciseImg} />
            <h2 className={styles.exerciseName}>Ejercicio 3</h2>
          </div>
          <div className={styles.exerciseItem}>
            <img src={`${process.env.PUBLIC_URL}/img/ejercicio4.jpg`} alt="Ejercicio 4" className={styles.exerciseImg} />
            <h2 className={styles.exerciseName}>Ejercicio 4</h2>
          </div>
          <div className={styles.exerciseItem}>
            <img src={`${process.env.PUBLIC_URL}/img/ejercicio5.jpg`} alt="Ejercicio 5" className={styles.exerciseImg} />
            <h2 className={styles.exerciseName}>Ejercicio 5</h2>
          </div>
          <div className={styles.exerciseItem}>
            <img src={`${process.env.PUBLIC_URL}/img/ejercicio6.jpg`} alt="Ejercicio 6" className={styles.exerciseImg} />
            <h2 className={styles.exerciseName}>Ejercicio 6</h2>
          </div>
        </div>
      </section>

      <section id="botones" className={styles.buttonsSection}>
        <div id="cambioejercicio" className={styles.changeExercise}>
          <Link to="/ChExercise" className={styles.buttonLink}>
            <button className={styles.actionButton}>CAMBIAR EJERCICIO</button>
          </Link>
        </div>
        <div id="horario" className={styles.schedule}>
          <Link to="/routines" className={styles.buttonLink}>
            <button className={styles.actionButton}>HORARIO</button>
          </Link>
        </div>
        <div id="rdf" className={styles.schedule}>
          <Link to="/rdf" className={styles.buttonLink}>
            <button className={styles.actionButton}>RDF</button>
          </Link>
        </div>
      </section>

      <footer className={styles.homeFooter}>
        <p>&copy; CcalloCORP</p>
      </footer>
    </div>
  );
};

export default Home;
