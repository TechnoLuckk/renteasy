require("dotenv").config();

const { Client } = require("pg");
const client = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASS,
  port: process.env.PG_PORT,
});

const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  urlEndpoint: "https://ik.imagekit.io/m3c9xvobb",
  publicKey: "public_QL/BnOFxsLrH4K4HBhyDyw8hWWM=",
  privateKey: "private_FW95yfuHkthwCmo8vIcFvujgLpE=",
});

const express = require("express");
const app = express();
const port = 5001;

app.use(express.json());

app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.append("Access-Control-Allow-Headers", "Content-Type");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const convertToPSQLArray = (
  arr,
  addQuotes,
  braceTypeOpen,
  braceTypeClose,
  quotes
) => {
  if (!addQuotes) {
    quotes = ``;
  }
  let arrString = braceTypeOpen;
  const lastArrElement = arr.pop();
  arr.forEach((element) => {
    arrString += quotes + element + quotes;
    arrString += ", ";
  });
  arrString += quotes + lastArrElement + quotes;
  arrString += braceTypeClose;
  return arrString;
};

app.get("/api/imageauth", function (req, res) {
  var result = imagekit.getAuthenticationParameters();
  res.send(result);
});

app.get("/api/products", async (req, res) => {
  const pgRes = await client.query("SELECT * FROM products");
  res.send(pgRes.rows);
  res.status(200);
});

app.get("/api/products/:category", async function (req, res) {
  const pgRes = await client.query(
    `SELECT * FROM products WHERE category = '${req.params.category}'`
  );
  res.send(pgRes.rows);
  res.status(200);
});

app.get("/api/product/:productId", async function (req, res) {
  const pgRes = await client.query(
    `SELECT * FROM products WHERE product_id = '${req.params.productId}'`
  );
  res.send(pgRes.rows);
  res.status(200);
});

app.get("/api/listing/verify/:userid", async function (req, res) {
  const sellerId = req.params.userid;
  const pgRes = await client.query(
    `SELECT * FROM sellers WHERE user_id = '${sellerId}'`
  );
  res.send({ descision: !!pgRes.rowCount });
});

app.post("/api/listing/newseller", async function (req, res) {
  let { name, email, user_id, username, phonenumber, address } = req.body;
  if (name === "") name = username;
  try {
    const pgRes = await client.query(
      `INSERT INTO sellers(name, email, user_id, username, phonenumber, address) VALUES ('${name}', '${email}', '${user_id}', '${username}', '${phonenumber}', '${address}')`
    );
    res.send({ done: true });
  } catch (err) {
    res.err({ done: false });
  }
});

app.get("/api/listing/:seller_id", async function (req, res) {
  const pgRes = await client.query(
    `SELECT * FROM sellers WHERE user_id = '${req.params.seller_id}'`
  );
  const sellerProducts = pgRes.rows[0].products;
  const sellerProductsString = convertToPSQLArray(
    sellerProducts,
    true,
    "(",
    ")",
    `'`
  );
  const productsRes = await client.query(
    `SELECT * FROM products WHERE product_id IN ${sellerProductsString}`
  );
  res.send({ seller: pgRes.rows, products: productsRes.rows });
  res.status(200);
});

app.get("/api/sellerinfo/:seller_id", async function (req, res) {
  const pgRes = await client.query(
    `SELECT * FROM sellers WHERE user_id = '${req.params.seller_id}'`
  );
  res.send(pgRes.rows);
  res.status(200);
})

app.post("/api/listing/new", async (req, res) => {
  let {
    name,
    price,
    category,
    seller_user_id,
    description,
    images,
    listing_price,
    unavailable_dates,
  } = req.body;
  const imagesString = convertToPSQLArray(images, true, "{", "}", '"');
  const datesString = convertToPSQLArray(
    unavailable_dates,
    false,
    "{",
    "}",
    '"'
  );

  try {
    const genRandomUuid = await client.query("SELECT * FROM gen_random_uuid()");
    const generatedUuid = genRandomUuid.rows[0].gen_random_uuid;
    // console.log(
    //   `INSERT INTO products(name, price, category, description, seller_user_id, product_id, images, listing_price, unavailable_dates) VALUES ('${name}', ${price}, '${category}', '${description}', '${seller_user_id}', '${generatedUuid}', '${imagesString}', ${listing_price}, '${datesString}')`
    // );
    const pgResInsert = await client.query(
      `INSERT INTO products(name, price, category, description, seller_user_id, product_id, images, listing_price, unavailable_dates) VALUES ('${name}', ${price}, '${category}', '${description}', '${seller_user_id}', '${generatedUuid}', '${imagesString}', ${listing_price}, '${datesString}')`
    );
    const pgRegUpdate = await client.query(
      `UPDATE sellers SET products = array_append(products, '${generatedUuid}') WHERE user_id = '${seller_user_id}';`
    );
    res.send({ done: true });
  } catch (err) {
    console.log(err);
    res.send({ done: false });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  client.connect(async function (err) {
    if (err) throw err;
    console.log("Connected!");
    
  });
});
