import { connectToDatabase, convertToPSQLArray } from "../../db";
export async function POST(request: Request) {
  const { client, imagekit } = await connectToDatabase();
  const body = await request.json();
  let {
    product_id,
    name,
    price,
    category,
    seller_user_id,
    description,
    images,
    listing_price,
    unavailable_dates,
  } = body;

  const imageUploadResponse: string[] = images;

  try {
    // const genRandomUuid = await client.query("SELECT * FROM gen_random_uuid()");
    // const generatedUuid = genRandomUuid.rows[0].gen_random_uuid;
    await Promise.all(
      images.map((image: { dataURL: string; file: File }, idx: number) => {
        return new Promise<void>((resolve, reject) => {
          if (image.dataURL) {
              imagekit.upload(
                {
                  file: image.dataURL,
                  fileName: product_id,
                },
                (error, result) => {
                  if (error) {
                    console.log(error);
                    throw new Error("Error while uploading");
                  } else {
                    imageUploadResponse[idx] = result.url;
                    resolve();
                  }
                }
              );
          } else {
            resolve();
          }
        });
      })
    );

    const imagesString = convertToPSQLArray(imageUploadResponse, true, "{", "}", '"');
    const datesString = convertToPSQLArray(
      unavailable_dates,
      false,
      "{",
      "}",
      '"'
    );
    const pgResInsert = await client.query(
      `UPDATE products SET name = '${name}', price = ${price}, category = '${category}', description = '${description}', seller_user_id = '${seller_user_id}', images = '${imagesString}', listing_price = ${listing_price}, unavailable_dates = '${datesString}' WHERE product_id = '${product_id}'`
    );
    return Response.json({ done: true });
  } catch (err) {
    console.log(err);
    return Response.json({ done: false });
  }
}
