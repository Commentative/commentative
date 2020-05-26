const express = require("express");
const path = require("path");
const app = express();
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const axios = require("axios");

const readabilityParser = require("./helpers/readabilityParser");

app.set("views", path.join(__dirname, "views"));

app.set("view engine", "hbs");
app.engine(
  "hbs",
  handlebars({
    extname: "hbs",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
    defaultLayout: "main",
  })
);

app.use(bodyParser.urlencoded({ extended: false }));

app.set("port", process.env.PORT || 3000);

app.use(express.static("public"));
app.use(express.static("node_modules"));

app.get("/", (req, res, next) => {
  res.render("home", { page: "home" });
});

app.post("/newarticle", async (req, res, next) => {
  const articleUrl = req.body.contenturl;
  const articleBody = await readabilityParser(articleUrl);
  const backendUrl =
    "https://8rj0xswzt3.execute-api.eu-west-1.amazonaws.com/dev/commentative";
  //no user and no commentData because at this point we're just submitting the article Body
  const params = { user: null, commentData: [], articleBody };
  axios
    .post(backendUrl, params)
    .then((res) => res.data)
    .then((articleObj) => {
      res.redirect(`/${articleObj.uuid}`);
    })
    .catch((err) => {
      next(err);
    });
});

app.get("/:uuid", async (req, res) => {
  const url = `https://8rj0xswzt3.execute-api.eu-west-1.amazonaws.com/dev/commentative/${req.params.uuid}`;
  const result = await axios(url);
  const inviteLink = req.protocol + "://" + req.get("host") + req.originalUrl;
  const articleObj = {
    inviteLink,
    content: result.data.articleBody.content,
    siteName: result.data.articleBody.siteName,
    title: result.data.articleBody.title,
    comments: result.data.comments,
  };
  res.render("newarticle", { articleObj, page: "newarticle" });
});

app.get("*", (req, res) => {
  res.status(404).send("page not found");
});

app.use((error, req, res, next) => {
  //   console.log(error);
  const status = error.status || 500;
  const message = error.message || "Something went wrong";
  const name = error.name || "Error";
  const errorObj = { name: name, message: message };
  res.status(status).send(errorObj);
});

app.listen(app.get("port"), () => {
  console.log("App running on port", app.get("port"));
});

module.exports = app;
