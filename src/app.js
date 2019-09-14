const express = require("express");
const path = require("path");
const app = express();
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");

const readabilityParser = require("./helpers/readabilityParser");

app.set("views", path.join(__dirname, "views"));

app.set("view engine", "hbs");
app.engine(
  "hbs",
  handlebars({
    extname: "hbs",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
    defaultLayout: "main"
  })
);

app.use(bodyParser.urlencoded({ extended: false }));

app.set("port", process.env.PORT || 3000);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/newarticle", async (req, res) => {
  const url = req.query.contenturl;
  console.log(url);
  const articleObj = await readabilityParser(url);
  console.log(articleObj);
  res.render("newarticle", { articleObj });
});

app.listen(app.get("port"), () => {
  console.log("App running on port", app.get("port"));
});

module.exports = app;
