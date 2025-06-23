const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors({
    origin:'http://192.168.100.7:3000',
}));

const db = mysql.createConnection({
  host: '192.168.100.7',
  user: 'root',
  password: 'root',
  database: 'DBP_app',
});

db.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
  }
  console.log('Conexión exitosa a la base de datos');
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix);
  }
});

const upload = multer({ storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Servidor Express funcionando correctamente');
});

async function generarRutinaInicial(userId, imc, experiencia,frecuencia) {
    const rutinaInicial = {};
    const diasSemana = ['lunes', 'miercoles', 'viernes'];
    const gruposMusculares = {
        'lunes': 1,
        'miercoles': 2,
        'viernes': 6
    };

    let nivelDificultad;
    if (experiencia === 1) nivelDificultad = 1;
    else if (experiencia === 2) nivelDificultad = 2;
    else nivelDificultad = 3;

    let condicionIMC;
    if (imc < 18.5) condicionIMC = 'flaco';
    else if (imc >= 25) condicionIMC = 'obeso';
    else condicionIMC = 'normal';

    for (const dia in gruposMusculares) {
        const idMsc = gruposMusculares[dia];
        let limit = frecuencia;
        let queryEjercicios = `
            SELECT id_ejercicio
            FROM ejercicios
            WHERE id_msc = ? AND nivel_dificultad <= ?
            ORDER BY RAND()
            LIMIT ?
        `;

        console.log("Valores antes de la consulta:");
        console.log("idMsc:", idMsc, typeof idMsc);
        console.log("nivelDificultad:", nivelDificultad, typeof nivelDificultad);
        console.log("limit:", limit, typeof limit);

        const interpolatedQuery = mysql.format(queryEjercicios, [idMsc, nivelDificultad, limit]);
        console.log("Consulta SQL interpolada:", interpolatedQuery);

        try {
            const [ejercicios] = await db.promise().query(queryEjercicios, [idMsc, nivelDificultad, limit]);
            console.log("Ejercicios encontrados:", ejercicios);
            if (ejercicios.length > 0) {
                for (let i = 0; i < ejercicios.length; i++) {
                    const ejercicioId = ejercicios[i].id_ejercicio;
                    console.log("Intentando insertar ejercicio con ID:", ejercicioId);
                    let insertRutinaQuery = `
                        INSERT INTO rutinas_usuario (id_usuario, dia_semana, id_ejercicio, orden, series, repeticiones)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;
                    await db.promise().execute(insertRutinaQuery, [userId, dia, ejercicioId, i + 1, 3, 10]);
                }
            }
        } catch (error) {
            console.error(`Error al generar rutina para ${userId} el ${dia}:`, error);
        }
    }
    console.log(`Rutina inicial generada para el usuario ${userId}`);
}

app.post('/register', async (req, res) => {
  const { nombre, apellidos, nickname, contraseña, correo, edad, imc, frecuencia, experiencia } = req.body;

  if (!nombre || !apellidos || !nickname || !contraseña || !correo || !edad || !imc || !frecuencia || !experiencia) {
    return res.status(400).send('Faltan datos requeridos');
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);
    const query = `
      INSERT INTO usuarios
        (nombre, apellidos, nickname, contraseña, correo, edad, imc, frecuencia, experiencia)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query,
      [nombre, apellidos, nickname, hashedPassword, correo, edad, imc, frecuencia, experiencia],
      async (err, result) => {
        if (err) {
          console.error('ERROR SQL al insertar usuario:', err.sqlMessage || err);
          return res.status(500).send('Error al registrar usuario');
        }

        const userId = result.insertId;

        await generarRutinaInicial(userId, parseFloat(imc), parseInt(experiencia),parseInt(frecuencia));

        res.status(200).send('Usuario registrado con éxito');
      }
    );
  } catch (err) {
    res.status(500).send('Error al encriptar la contraseña');
  }
});

app.post('/login', (req, res) => {
  const { nickname, contraseña } = req.body;

  if (!nickname || !contraseña) {
    return res.status(400).send('Faltan credenciales');
  }

  const query = 'SELECT * FROM usuarios WHERE nickname = ?';
  db.query(query, [nickname], async (err, results) => {
    if (err) return res.status(500).send('Error al verificar usuario');
    if (results.length === 0) return res.status(400).send('Usuario no encontrado');

    const user = results[0];
    try {
      const isMatch = await bcrypt.compare(contraseña, user.contraseña);
      if (!isMatch) return res.status(400).send('Credenciales incorrectas');

        res.status(200).json({
        id: user.id
      });

    } catch {
      res.status(500).send('Error al procesar inicio de sesión');
    }
  });
});

app.post('/upload-avatar', (req, res) => {
  upload.single('archivo')(req, res, (err) => {
    if (err) {
      console.error('Error Multer:', err);
      return res.status(500).json({ message: 'Error interno al procesar archivo', error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    const { nickname } = req.body;
    console.log('Datos recibidos en upload-avatar:', req.body);

    if (!nickname) {
      return res.status(400).json({ message: 'El campo nickname es obligatorio' });
    }

    const fotoPerfilUrl = `${req.file.filename}`;

    const query = 'UPDATE usuarios SET fotoPerfil = ? WHERE nickname = ?';
    db.query(query, [fotoPerfilUrl, nickname], (err, result) => {
      if (err) {
        console.error('Error al actualizar la foto de perfil en la base de datos:', err);
        return res.status(500).json({ message: 'Error al actualizar la foto de perfil' });
      }

      console.log('Resultado de la consulta SQL:', result);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json({ message: 'Foto de perfil actualizada', fotoPerfil: fotoPerfilUrl });
    });
  });
});


app.get('/usuario/:nickname', (req, res) => {
  const { nickname } = req.params;
  const query = 'SELECT * FROM usuarios WHERE nickname = ?';

  db.query(query, [nickname], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al obtener los datos del usuario' });
    if (result.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(result[0]);
  });
});

app.post('/image/single', upload.single('file'), (req, res) => {
  console.log(req.file);
  if (req.file) {
      const imagePath = `/uploads/${req.file.filename}`;
      res.json({ message: 'Imagen subida con éxito', path: imagePath });
  } else {
    res.status(400).json({ message: 'No se subió ningún archivo' });
  }
});

app.post('/post', (req, res) => {

  const text = req.body.text;
  const userid = req.body.userid;
  const creationdate = req.body.creationdate;
  const imagen = req.body.imagePath;

  db.query("INSERT INTO post(text, creationdate, userid, imagen) VALUES (?, ?, ?, ?)", [text, creationdate, userid, imagen],
  (err, result) => {
      if (err) {
          console.log(err);
      }
      else {
          res.send("Enviado comentado")
      }
  }
  )

})


app.get('/comentarios', (req, res) => {

  db.query("SELECT * FROM post inner join usuarios on post.userid = usuarios.id ORDER BY post.postid DESC;",
  (err, result) => {
      if (err) {
          console.log(err);
      }
      else {
          res.send(result)
      }
  }
  )

})


app.post('/deletecomment', (req, res) => {

  const postid = req.body.postid;

  db.query("DELETE FROM post WHERE postid = (?)", [postid],
  (err, result) => {
      if (err) {
          console.log(err);
      }
      else {
          res.send("Comentario eliminado")
      }
  }
  )

})


app.post('/updatecomment', (req, res) => {

  const postid = req.body.postid;
  const text = req.body.text;

  db.query("UPDATE post SET text = (?) WHERE postid = (?)", [text, postid],
  (err, result) => {
      if (err) {
          console.log(err);
      }
      else {
          res.send("Comentario editado")
      }
  }
  )

})

app.get('/rutina/:idUsuario', async (req, res) => {
  const { idUsuario } = req.params;

  try {
    const query = `
      SELECT r.dia_semana, e.nombre_ejercicio as nombre, e.descripcion
      FROM rutinas_usuario r
      JOIN ejercicios e ON r.id_ejercicio = e.id_ejercicio
      WHERE r.id_usuario = ?
      ORDER BY
        FIELD(r.dia_semana, 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'),
        r.orden;
    `;

    const [rows] = await db.promise().query(query, [idUsuario]);
    console.log("Filas obtenidas de la base de datos:", rows);

    const rutinaPorDia = {};
    rows.forEach(row => {
      const dia = row.dia_semana.toLowerCase();
      if (!rutinaPorDia[dia]) rutinaPorDia[dia] = [];
      rutinaPorDia[dia].push({
        nombre: row.nombre,
        descripcion: row.descripcion
      });
    });

    res.json(rutinaPorDia);
  } catch (error) {
    console.error('Error al obtener rutina del usuario:', error);
    res.status(500).json({ message: 'Error al obtener la rutina', error: error.message }); 
  }
});

app.get('/ejercicios/:tipo',(req,res)=>{
    const { tipo } = req.params;

    db.query('SELECT * FROM ejercicios WHERE id_msc = ?', [tipo],
        (err,result)=>{
            if(err){
                console.log(err);
            }else{
                res.send(result);
            }
        }
    );
});
app.post('/ejercicios/porIDs', (req, res) => {
  const ids = req.body.ids;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).send("Se necesita un array de tipo válido.");
  }


  const placeholders = ids.map(() => '?').join(',');

  const sql = `SELECT * FROM ejercicios WHERE id_ejercicio IN (${placeholders})`;


  db.query(sql, ids, (err, result) => {
    if (err) {
      return res.status(500).send("Error al obtener ejercicios: " + err);
    }
    res.json(result);
  });
});

app.get('/rutinas_usuario/:id_usuario/:dia', (req, res) => {
  const id = req.params.id_usuario;
  const dia = req.params.dia;


  db.query(
    'SELECT * FROM rutinas_usuario WHERE id_usuario = ? AND dia_semana = ?',
    [id,dia],
    (err, result) => {
      if (err) {
        console.error("Error al obtener ejercicios:", err);
        return res.status(500).json({ message: "Error del servidor" });
      } else {
        return res.status(200).json(result);
      }
    }
  );
});
app.put('/rutinas_usuario/:id_usuario/:dia/:idEjercicio', (req, res) => {
  const user = req.params.id_usuario;
  const dia = req.params.dia;
  const idEjercicio = req.params.idEjercicio;

  const nuevoIdEjercicio = req.body.idEjercicio;


  const query = `
    UPDATE rutinas_usuario
    SET id_ejercicio = ?
    WHERE id_usuario = ? AND id_ejercicio = ? AND dia_semana = ?;
  `;

  db.query(query, [nuevoIdEjercicio, user ,idEjercicio, dia], (err, result) => {
    if (err) {
      console.error("Error al actualizar la rutina: ", err);
      return res.status(500).send("Error al actualizar la rutina");
    }

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: 'Rutina actualizada correctamente' });
    } else {
      return res.status(404).send('Rutina no encontrada');
    }
  });
});


app.listen(port, () => {
  console.log(`Servidor corriendo en http://192.168.100.7:${port}`);
});
