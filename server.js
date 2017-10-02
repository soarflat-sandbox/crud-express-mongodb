const path = require('path');
const express = require('express');
const bodyPerser = require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient;

let db;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

MongoClient.connect(`mongodb://${dbUser}:${dbPassword}@${dbName}`, (err, database) => {
  if (err) {
    return console.log(err);
  }
  db = database;

  // テンプレートエンジン（pug）を指定する
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  // Expressのミドルウェアであるbody-parserを利用する
  // urlencodedメソッドは、<form>要素からデータを抽出し、requestオブジェクトのbodyプロパティに追加する
  app.use(bodyPerser.urlencoded({ extended: true }));

  app.listen(3000, () => {
    console.log('listening on 3000');
  });

  app.get('/', (req, res) => {
    db.collection('quotes').find().toArray((err, results) => {
      console.log(results);
      res.render('index', { quotes: results });
    });
  });

  app.post('/quotes', (req, res) => {
    const collection = db.collection('quotes');
    // body-parserのurlencodedメソッドを指定しているため
    // <form>要素から抽出したデータがbodyプロパティに追加されている
    // このデータをcollectionにsaveする
    collection.save(req.body, (err, result) => {
      if (err) {
        return console.log(err)
      }

      console.log('saved to database');
      res.redirect('/');
    });
  });
});