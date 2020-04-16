require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const logger = require('./logger');
const uuid = require('uuid/v4');

const app = express();
const bodyParser = express.json();

const morganOption = (NODE_ENV === 'production');

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

const bookmarks = [
  {
    id:1,
    title: 'Test Bookmark 1',
    content: 'Content of Test Bookmark 1'
  },
  {
    id:2,
    title: 'Test Bookmark 2',
    content: 'Content of Test Bookmark 2'
  },
  {
    id: 3,
    title: 'Test Bookmark 3',
    content: 'Content of Test Bookmark 3'
  }
];

app.get('/bookmark',(req,res) => {
  res.status(200);
  res.send(bookmarks);
});

app.get('/bookmarks/:id',(req,res) => {
  const {id} = req.params;
  const bookmark = bookmarks.find(mark => mark.id == id);
  
  if(!bookmark){
    logger.error(`Bookmark with id ${id} not found`);
    return res
      .status(404)
      .send('Bookmark Not Found');
  }
  res.send(bookmark);
});

app.post('/bookmarks',bodyParser, (req,res) => {

  const {title,content} = req.body;

  if(!title){
    logger.error('No Title was provided');
    return res 
      .status(404)
      .send('Please provide a Title for this Bookmark');
  }
  
  if(!content){
    logger.error('No Content was provided for the card');
    return res
      .status(404)
      .send('Please provide content for this card');
  }

  const id = uuid();
  const bookmark = {
    id,
    title,
    content
  };

  bookmarks.push(bookmark);

  logger.info(`Card with id ${id} created`);

  res
    .status(201)
    .location(`http://localhost:800/bookmarks/${id}`)
    .json(bookmark);
});

app.delete('/bookmarks/:id',(req,res) => {

  const {id} = req.params;

  const bookmarkIndex = bookmarks.findIndex(c => c.id == id);

  if(bookmarkIndex === -1){
    logger.error(`Card with id ${id} not found.`);
    return res
      .status(404)
      .send('Not Found');
  }

  bookmarks.splice(bookmarkIndex,1);

  logger.info(`Card with id ${id} deleted`);

  res
    .status(204)
    .end();
});

app.use( function errorHandler(error,req,res,next){
  let response;
  if (NODE_ENV === 'production'){
    response = {error: {message: 'server error'}};
  } else{
    console.error(error);
    response = {message: error.message, error};
  }
  res.status(500).json(response);  
});


//catch 404 and forward error handler
app.use(function (req,res,next){
  var err = new Error('Not Found!');
  err.status = 404;
  // reject(err);
  
  res.send(404); 
});

module.exports = app;