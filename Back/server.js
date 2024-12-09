const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3000;

const pool = new Pool({
  user: 'joan', 
  host: 'localhost',
  database: 'like_me',
  password: '1234',
  port: 5432,
});

app.use(cors());
app.use(express.json());

//obtener los posts
app.get('/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener posts:', error);
    res.status(500).json({ error: 'Error' });
  }
});

//agregar nuevos posts
app.post('/posts', async (req, res) => {
  const { titulo, img, descripcion } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, 0) RETURNING *',
      [titulo, img, descripcion]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al agregar post:', error);
    res.status(500).json({ error: 'Error' });
  }
});

//actualizar likes
app.put('/posts/:id/like', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar likes:', error);
    res.status(500).json({ error: 'Error' });
  }
});

//Eliminar
app.delete('/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    res.json({ message: 'Post eliminado correctamente', post: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar post:', error);
    res.status(500).json({ error: 'Error' });
  }
});

app.listen(port, () => {
  console.log(`Servidor OK en http://localhost:${port}`);
});
