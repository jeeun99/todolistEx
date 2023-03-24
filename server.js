const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.use("/public", express.static("public"));

const MongoClient = require("mongodb").MongoClient;
let db;

MongoClient.connect(
  "mongodb+srv://jeeun:xF4cv6yidg53qiTg@cluster0.npzdcur.mongodb.net/?retryWrites=true&w=majority",
  { useUnifiedTopology: true },
  function (err, client) {
    if (err) return console.log(err);
    db = client.db("todo");
  }
);

app.listen(8080, function () {
  console.log("Listening on 8080 port");
});
app.get("/", function (req, res) {
  //   res.sendFile(__dirname + "/list.html");
  db.collection("post")
    .find()
    .toArray(function (err, result) {
      res.render("list.ejs", { post: result });
    });
});
app.get("/write", function (req, res) {
  // res.sendFile(__dirname + "/write.html");
  res.render("write.ejs");
});

app.post("/add", function (req, res) {
  //   console.log(req.body);
  //   res.send("전송완료");
  db.collection("counter").findOne({ name: "갯수" }, function (err, result) {
    let count = result.totalpost;

    db.collection("post").insertOne(
      { _id: count + 1, 제목: req.body.title, 날짜: req.body.date },
      function (err, res) {
        // console.log("완료");
        db.collection("counter").updateOne(
          { name: "갯수" },
          { $inc: { totalpost: 1 } }
          //   ,           function (err, result) {
          //     if (err) return console.log(err);
          //     // res.send("숫자가 전송됨");
          //   }
        );
      }
    );
    res.redirect("/");
  });
});

app.delete("/delete", function (req, res) {
  req.body._id = parseInt(req.body._id);
  db.collection("post").deleteOne(req.body, function () {
    console.log("삭제완료");
    res.status(200).send("성공");
  });
});

app.get("/detail/:id", function (req, res) {
  // res.render("detail.ejs");
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      res.render("detail.ejs", { data: result });
    }
  );
});

// CRUD
app.get("/edit/:id", function (req, res) {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      console.log(result);
      res.render("edit.ejs", { post: result });
    }
  );
});

app.put("/edit", (req, res) => {
  db.collection("post").updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { 제목: req.body.title, 날짜: req.body.date } },
    function (err, result) {
      if (err) return console.log(err);
      res.redirect("/");
    }
  );
});
