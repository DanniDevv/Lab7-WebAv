const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path'); 

mongoose.connect('mongodb://0.0.0.0/musica', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: true }));

// Configura el middleware de archivos estáticos para servir desde la carpeta "uploads" dentro de "views"
app.use('/uploads', express.static(path.join(__dirname, 'views', 'uploads')));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'views')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'views', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const Song = mongoose.model('Song', {
  title: String,
  artist: String,
  year: Number,
  imageUrl: String,
  mp3Url: String
});

app.get('/ingresar', (req, res) => {
  res.render('admin');
});

app.post('/ingresar', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'mp3', maxCount: 1 }]), (req, res) => {
  const { title, artist, year } = req.body;
  const imageUrl = req.files['image'][0].filename;
  const mp3Url = req.files['mp3'][0].filename;

  const song = new Song({ title, artist, year, imageUrl, mp3Url });

  song.save()
    .then(() => {
      res.redirect('/listar');
    })
    .catch(err => {
      console.error(err);
    });
});

app.get('/listar', (req, res) => {
  Song.find({})
    .then(songs => {
      res.render('music', { songs });
    })
    .catch(err => {
      console.error(err);
    });
});

app.listen(3000, () => {
  console.log('Servidor en ejecución en el puerto 3000');
});
