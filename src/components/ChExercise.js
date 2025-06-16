import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from "./ChExercise.module.css";

const ChExercise = () => {
  const [ejerciciosList, setEjercicios] = useState([]);
  const [rutinasList, setRutinas] = useState([]);
  const [id, setID] = useState(localStorage.getItem('userId'));
  const [dia, setDia] = useState('miercoles');
  const [tipo, setTipo] = useState('');
  const [ejercicioSeleccionadoRutina, setEjercicioSeleccionadoRutina] = useState(null);

  useEffect(() => {

  }, []);

  useEffect(() => {
    if (id && dia) {
      getRutinas();
    }
  }, [id, dia]);

  const getRutinas = () => {
    axios.get(`http://localhost:5000/rutinas_usuario/${id}/${dia}`)
      .then((response) => {
        const rutinasRaw = response.data;
        const ids = rutinasRaw.map(r => r.id_ejercicio);

        if (ids.length > 0) {
          axios.post(`http://localhost:5000/ejercicios/porIds`, { ids })
            .then(res => {
              setRutinas(res.data);
            });
        } else {
          setRutinas([]);
        }
      })
      .catch(error => {
        console.error("Error al obtener rutinas:", error);
      });
  };

  const getEjercicios = (tipo) => {
    if (tipo) {
      axios.get(`http://localhost:5000/ejercicios/${tipo}`)
        .then((response) => {
          setEjercicios(response.data);
        });
    } else {
      setEjercicios([]);
    }
  };

  const manejarSeleccionNuevoEjercicio = (registro) => {
    if (ejercicioSeleccionadoRutina) {
      cambiarEjercicioEnRutina(ejercicioSeleccionadoRutina, registro);
    }
  };

  const manejarSeleccionRutinaEjercicio = (registro) => {
    setEjercicioSeleccionadoRutina(registro);
    setTipo(registro.id_msc);
    getEjercicios(registro.id_msc);
  };

  const cambiarEjercicioEnRutina = (viejoEjercicio, nuevoEjercicio) => {
    axios.put(`http://localhost:5000/rutinas_usuario/${id}/${dia}/${viejoEjercicio.id_ejercicio}`, {
      idEjercicio: nuevoEjercicio.id_ejercicio
    }).then(() => {
      getRutinas();
      setEjercicioSeleccionadoRutina(null);
    }).catch(err => {
      console.error("Error al cambiar ejercicio:", err);
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <img
            src={`${process.env.PUBLIC_URL}/img/logo.png`}
            alt="logo"
            height="100"
          />
        </div>
        <nav className={styles.menu}>
          <ul>
            <li><Link to="/home">Inicio</Link></li>
            <li><Link to="/post">Publicaciones</Link></li>
            <li><Link to="/routines">Horario</Link></li>
          </ul>
        </nav>
      </header>

      <section id="changeExercise" className={styles.changeExercise}>
        <div className={styles.rutina}>
          {rutinasList.map((registro) => (
            <button key={registro.id} className={styles.botonEjercicio} onClick={() => manejarSeleccionRutinaEjercicio(registro)}>
              <img src={registro.imagen} alt={registro.nombre_ejercicio} className={styles.ejercicioImagen} />
              <p className={styles.ejercicioNombre}>{registro.nombre_ejercicio}</p>
            </button>
          ))}
        </div>

        <div className={styles.scroll}>
          <div className={styles.imagenItem}>
            {ejerciciosList.map((registro) => (
              <button key={registro.id} className={styles.botonEjercicio} onClick={() => manejarSeleccionNuevoEjercicio(registro)}>
                <img src={registro.imagen} alt={registro.nombre_ejercicio} className={styles.ejercicioImagen} />
                <p className={styles.ejercicioNombre}>{registro.nombre_ejercicio}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>&copy; CcalloCORP</p>
      </footer>
    </div>
  );
};

export default ChExercise;