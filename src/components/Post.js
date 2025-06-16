// src/components/Post.js
import React, { useState, useEffect } from 'react';
import Imagenes from './assets/Imagenes';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from './Post.module.css';

const Post = () => {
  const [text, settext] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const userid = localStorage.getItem('userId');
  const creationdate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const [comentarioslist, setcomentarios] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const add = async () => {
    let imagePath = null;

    if (selectedImage) {
      const formData = new FormData();
      formData.append('file', selectedImage);

      try {
        const imageResponse = await axios.post("http://localhost:5000/image/single", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        imagePath = imageResponse.data.path;
      } catch (error) {
        console.error("Error al subir la imagen:", error);
        return;
      }
    }

    axios.post("http://localhost:5000/post", {
      text: text,
      creationdate: creationdate,
      userid: userid,
      imagePath: imagePath
    }).then(() => {
      alert("Mensaje enviado");
      
      settext("");
      setSelectedImage(null);
      getComentarios();

    }).catch((error) => {
      console.error("Error al enviar el comentario:", error);
      alert("Hubo un error al enviar el comentario.");
    });
  }


  const getComentarios = () => {
    axios.get("http://localhost:5000/comentarios").then((response) => {
      setcomentarios(response.data);
    }).catch((error) => {
      console.error("Error al obtener el comentario:", error);
      alert("Hubo un error al mandar el comentario.");
    });
  }


  const handleDelete = (postid) => {
    axios.post("http://localhost:5000/deletecomment", {
      postid: postid
    }).then(() => {
      alert("Mensaje eliminado");
      getComentarios();
 
    }).catch((error) => {
      console.error("Error al eliminar el comentario:", error);
      alert("Hubo un error al eliminar el comentario.");
    });
  }

  const handleEdit = (val) => {
    setEditingId(val.postid);
    setEditText(val.text);
  }

  const handleUpdate = (postid) => {
    axios.post("http://localhost:5000/updatecomment", {
      postid: postid,
      text: editText
    }).then(() => {
      alert("Mensaje editado");
      setEditingId(null);
      setEditText("");
      getComentarios();
    }).catch((error) => {
      console.error("Error al editar el comentario:", error);
      alert("Hubo un error al editar el comentario.");
    });
  }

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

  useEffect(() => {
        getComentarios();
    }, []);


  return (

    <div className={styles.contenedor}>
      <header className={styles.encabezado}>
        <div id="logo" className={styles.logo}>
          <img src={Imagenes.img1} alt="Logo del gimnasio" className={styles.logoImg}></img>
        </div>

        <div id="recursos" className={styles.recursos}>
          <Link to="/home" className={styles.recursoLink}>Inicio</Link>
          <Link to="/routines" className={styles.recursoLink}>Horario</Link>
        </div>

        <div id="profile" className={styles.profile}>
          <Link to="/profile" className={styles.profileLink}>Perfil</Link>
          <img
            src={avatar}
            alt="perfil"
            height="50"
            className={styles.profileImg}
          />
        </div>
      </header>

      <main id="vista" className={styles.vista}>

        <h1 className={styles.postTitle}> ¡Postea algo en la comunidad! </h1><br></br>

        <div id="Contenido" className={styles.contenido}>

          <section className={styles.tableSection}>
            <div className={styles.tableBar}>
              <h2> Contenidos </h2>
              <a href="" className={styles.contentLink}>Contenido1</a><br></br><br></br>
              <a href="" className={styles.contentLink}>Contenido2</a><br></br><br></br>
              <a href="" className={styles.contentLink}>Contenido3</a><br></br><br></br>
              <a href="" className={styles.contentLink}>Contenido4</a><br></br><br></br>
            </div>
          </section>


          <section className={styles.postSection}>
            <div id="post" className={styles.postForm}>
              <div className={styles.textInput}>
                <input
                  onChange={(event) => {
                    settext(event.target.value);
                  }}
                  className={styles.commentInput}
                  type="text"
                  name="text"
                  id="texto"
                  placeholder=""
                ></input>
                <label htmlFor="texto" className={styles.inputLabel}>Pon un comentario</label>
                <br></br>
              </div>

              <div className={styles.fileInput}>
                <button className={styles.contenedorFile}>
                  &#128196; Subir foto
                  <label for="archivo"></label>
                  <input
                    onChange={(event) => {
                      setSelectedImage(event.target.files[0]);
                    }}
                    className={styles.commentInput}
                    type="file"
                    name="file"
                    id="archivo"
                  ></input>
                </button>
                <br></br>
              </div>


              <button onClick={add} className={styles.sendButton}>Enviar</button>

            </div>

            <div id="textpost" className={styles.textPost}>
              <button onClick={getComentarios} className={styles.loadCommentsButton}>Cargar Comentario</button>
              {
                comentarioslist.map((val, key) => {
                  return <div key={key} className={styles.comentario}>
                    <br></br>
                    <div className={styles.headComment}>
                      {val?.fotoPerfil && (
                        <img id="perfil-comment"
                          src={`http://localhost:5000/uploads/${val.fotoPerfil}`}
                          alt={`Perfil de ${val?.nickname}`}
                          className={styles.perfilCommentImg} 
                        />
                      )}
                      {val?.nickname} <br />
                      {val?.creationdate} <br />
                    </div>

                    <div id="body-comment" className={styles.bodyComment}>
                      {editingId === val.postid ? (
                        <div>
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className={styles.editInput}
                          />
                          <button onClick={() => handleUpdate(val.postid)} className={styles.saveButton}>Guardar</button>
                          <button onClick={() => setEditingId(null)} className={styles.cancelButton}>Cancelar</button>
                        </div>
                      ) : (
                        <div>
                          {val?.text} <br />
                          {val?.imagen && (
                            <img id="img-comment"
                              src={`http://localhost:5000${val.imagen}`}
                              alt={`Imagen adjunta al comentario de ${val?.nickname}`}
                              className={styles.imgComment}
                            />
                          )}
                        </div>
                      )}
                    </div>

                    <button onClick={() => handleDelete(val.postid)} className={styles.deleteButton}>Borrar</button>
                    <button onClick={() => handleEdit(val)} className={styles.editButton}>Editar</button>
                    <br></br>
                  </div>
                })
              }
            </div>
          </section>
        </div>
      </main>
      <footer className={styles.footer}>
        <p>&copy; CcalloCORP</p>
      </footer>
    </div>
  )
}

export default Post

