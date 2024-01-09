import ImageKit from "imagekit";
const { Client } = require("pg");

type Global = {
    db: { client: typeof Client, imagekit: ImageKit }
}
if (!((global as unknown) as Global).db) {
  ((global as unknown) as Global).db = { client: null, imagekit: null };
}

export const convertToPSQLArray = (
  arr: string[],
  addQuotes: boolean,
  braceTypeOpen: string,
  braceTypeClose: string,
  quotes: string
) => {
  if (arr.length === 0) return (braceTypeOpen + braceTypeClose)
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

export async function connectToDatabase() {
  if (!((global as unknown) as Global).db.client) {
    console.log("No client available, creating new client.");
    ((global as unknown) as Global).db.client = new Client({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: process.env.PG_PASS,
      port: process.env.PG_PORT,
    });
    await ((global as unknown) as Global).db.client.connect(async function (err: any) {
      if (err) throw err;
      console.log("Connected!");
      // await ((global as unknown) as Global).db.client.query(
      //   `CREATE TABLE public.feedback
      //   (
      //       id serial,
      //       email text,
      //       phonenumber text,
      //       feedback text,
      //       PRIMARY KEY (id)
      //   );`
      // );
    });
  }
  if (!((global as unknown) as Global).db.imagekit) {
    const imagekit = new ImageKit({
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY
    });
    ((global as unknown) as Global).db.imagekit = imagekit;
  }
  return ((global as unknown) as Global).db;
}
