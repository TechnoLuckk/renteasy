"use client";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { Icons } from "@/components/ui/icons";
import { ProductData } from "../products/category/[slug]/page";

type UploadImageResponse = {
  fileId: string;
  filePath: string;
  fileType: string;
  height: number;
  width: number;
  url: string;
};

const urlEndpoint = "https://ik.imagekit.io/m3c9xvobb";

export default function ListItem({
  product_details,
}: {
  product_details: ProductData;
}) {
  const router = useRouter();

  const itemListFormSubmit: any = (e: SubmitEvent) => {
    e.preventDefault();
    if (product_details) {
      // Send fetch to update route instead of new listing route
      // If the image has a dataURL property, then
      const data = {
        product_id: product_details.product_id,
        name: itemName.current.value,
        price: itemPrice.current.value,
        category: itemCategory.current.value,
        seller_user_id: user.id,
        description: itemDescription.current.value,
        images: uploadedImages,
        listing_price: itemListingPrice.current.value,
        unavailable_dates: unavailableDates.map((date) =>
          date.toISOString().slice(0, 10)
        ),
      };
      fetch(`${process.env.NEXT_PUBLIC_HOST_ADDRESS}/api/listing/update`, {
        method: "POST",
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .then((resJson) => {
          console.log(resJson)
          if (resJson.done) {
            console.log("Done");
            window.location.reload();
          }
        })
        .catch((err) => console.error(err));
    } else {
      const data = {
        name: itemName.current.value,
        price: itemPrice.current.value,
        category: itemCategory.current.value,
        seller_user_id: user.id,
        description: itemDescription.current.value,
        images: uploadedImages,
        listing_price: itemListingPrice.current.value,
        unavailable_dates: unavailableDates.map((date) =>
          date.toISOString().slice(0, 10)
        ),
      };
      fetch(`${process.env.NEXT_PUBLIC_HOST_ADDRESS}/api/listing/new`, {
        method: "POST",
        body: JSON.stringify(data),
      })
        .then((res) => { console.log(res, res.json()); return res.json();})
        .then((resJson) => {
          console.log(resJson)
          console.log("Done");
          // router.push("/products/seller/"+user.id+"/")
          router.push("/thankyou");
        })
        .catch((err) => console.error(err));
    }
  };
  const [uploadedImages, setUploadedImages] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState<Date[] | undefined>(
    []
  );
  const { isLoaded, isSignedIn, user } = useUser();
  const itemName = useRef<HTMLInputElement>() as any;
  const itemPrice = useRef<HTMLInputElement>() as any;
  const itemListingPrice = useRef<HTMLInputElement>() as any;
  const itemCategory = useRef<HTMLInputElement>() as any;
  const itemDescription = useRef<HTMLInputElement>() as any;
  const imageUploaderRef = useRef<HTMLInputElement>() as any;

  const onChange = (
    imageList: ImageListType,
    addUpdateIndex: number[] | undefined
  ) => {
    console.log(imageList);
    setUploadedImages(imageList as never[]);
  };

  useEffect(() => {
    if (product_details) {
      itemName.current.value = product_details.name;
      itemPrice.current.value = product_details.price;
      itemListingPrice.current.value = product_details.listing_price;
      itemCategory.current.value = product_details.category;
      itemDescription.current.value = product_details.description;
      setUnavailableDates(
        product_details.unavailable_dates.map(
          (unavailableDate) => new Date(unavailableDate)
        )
      );
      console.log("Setting uploaded images to: ", product_details.images);
      setUploadedImages(product_details.images);
    }
  }, []);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  if (isLoaded) {
    return (
      <div>
        <div>Listing new item</div>
        <div>
          <ImageUploading
            multiple
            value={uploadedImages}
            onChange={onChange}
            maxNumber={10}
          >
            {({
              imageList,
              onImageUpload,
              onImageRemoveAll,
              onImageUpdate,
              onImageRemove,
              isDragging,
              dragProps,
            }) => (
              // write your building UI
              <div>
                <div className="flex flex-col items-center w-full p-3 gap-2">
                  <div className="text-slate-500">
                    Click or Drag and Drop Images below to upload
                  </div>
                  <div className="flex flex-row gap-10 border-2 border-sky-500 overflow-x-auto p-5 h-[180px] w-full rounded">
                    {uploadedImages.length > 0 ? (
                      imageList.map((image, index) => (
                        <div key={index} className="w-40 h-24">
                          <div className="h-full w-full">
                            <img
                              src={
                                product_details && !image.dataURL
                                  ? (image as never)
                                  : image.dataURL
                              }
                            />
                          </div>
                          <div className="flex flex-row justify-center gap-2 p-2">
                            <button
                              className="flex flex-row text-xs text-center items-center gap-1 bg-blue-500 p-2 rounded"
                              onClick={() => onImageUpdate(index)}
                            >
                              {Icons.edit({
                                className: "h-6 w-6 bg-slate-50 rounded-full",
                              })}
                              <span className="text-slate-50">Edit</span>
                            </button>
                            <button
                              className="flex flex-row text-xs text-center items-center gap-1 bg-red-500 p-2 rounded"
                              onClick={() => onImageRemove(index)}
                            >
                              {Icons.cross({
                                className:
                                  "h-6 w-6 bg-slate-50 border-2 rounded-full",
                              })}
                              <span className="text-slate-50">Remove</span>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full w-full text-center text-slate-500">
                        Upload images here
                      </div>
                    )}
                  </div>
                  <button
                    className="border-2 border-sky-500 w-full h-[300px] justify-center flex flex-row text-slate-500 items-center gap-2"
                    style={isDragging ? { color: "red" } : undefined}
                    ref={imageUploaderRef}
                    {...dragProps}
                    onClick={onImageUpload}
                  >
                    <span className="">
                      {Icons.upload({
                        className:
                          "h-6 w-6 bg-slate-50 rounded-full text-slate-500",
                      })}
                    </span>
                    <span>Drag and Drop Here</span>
                  </button>
                </div>
                <button onClick={onImageRemoveAll}>Remove all images</button>
              </div>
            )}
          </ImageUploading>
        </div>
        <div className="">
          <form onSubmit={itemListFormSubmit}>
            <div className="p-3">
              <label className="block" htmlFor="itemName1">
                Item Name
              </label>
              <input
                className="my-2 h-10 w-80 p-2 border-2 border-slate-300 focus:outline-none focus:border-sky-500"
                id="itemName1"
                aria-describedby="itemName"
                placeholder="eg. Canon DSLR Camera"
                ref={itemName}
                required
              />
              <small className="block" id="itemName">
                Enter a name of the item
              </small>
            </div>
            <div className="p-3">
              <label className="block" htmlFor="price1">
                Price
              </label>
              <input
                className="my-2 h-10 w-80 p-2 border-2 border-slate-300 focus:outline-none focus:border-sky-500"
                id="price1"
                aria-describedby="price"
                placeholder="eg. $500"
                type="number"
                ref={itemPrice}
                required
              />
              <small className="block" id="price">
                Enter the original retail price of item
              </small>
            </div>
            <div className="p-3">
              <label className="block" htmlFor="listingPrice1">
                Listing Price
              </label>
              <input
                className="my-2 h-10 w-80 p-2 border-2 border-slate-300 focus:outline-none focus:border-sky-500"
                id="listingPrice1"
                aria-describedby="listingPrice"
                placeholder="Enter price"
                type="number"
                ref={itemListingPrice}
                required
              />{" "}
              / day
              <small className="block" id="listingPrice">
                Enter rental price per day for the item
              </small>
            </div>
            <div className="p-3">
              <label className="block" htmlFor="category1">
                Category
              </label>
              <select
                className="my-2 h-10 w-80 p-2 border-2 border-slate-300 focus:outline-none focus:border-sky-500"
                id="category1"
                name="category1"
                aria-describedby="categoryHelp"
                ref={itemCategory}
                required
              >
                <option>Select Category</option>
                <option value="electronics">Electronics</option>
                <option value="kitchen-supplies">
                  Kitchen or other Home Supplies
                </option>
                <option value="musical-instruments">Musical Instruments</option>
                <option value="expensive-clothes">Expensive Clothes</option>
                <option value="sport-equipments">Sport Equipments</option>
                <option value="tools">Tools</option>
                <option value="furniture">Furniture</option>
                <option value="accessories">Accessories</option>
                <option value="others">Others</option>
              </select>
              <small className="block" id="categoryHelp">
                Enter the category of the item
              </small>
            </div>
            <div className="p-3">
              <label className="block" htmlFor="itemDescription1">
                Item Description
              </label>
              <textarea
                className="my-2 h-20 w-80 p-2 border-2 border-slate-300 focus:outline-none focus:border-sky-500"
                id="itemDescription1"
                name="itemDescription1"
                aria-describedby="itemDescriptionHelp"
                ref={itemDescription}
                required
              ></textarea>
              <small className="block" id="itemDescriptionHelp">
                Enter the description of the item
              </small>
            </div>
            <div className="p-3">
              <label className="block mb-2">Dates unavailable</label>
              <div>
                <Calendar
                  mode="multiple"
                  selected={unavailableDates}
                  onSelect={setUnavailableDates}
                  disabled={(date) =>
                    date <= new Date() ||
                    date >
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() + 1)
                      )
                  }
                  className="rounded-md border w-64"
                />
              </div>
              <small className="block">
                Please enter the dates when the item will not be available. You
                can always change them later.
              </small>
            </div>
            <button className="bg-sky-500 text-gray-50 font-bold p-2 rounded my-10">
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  }
}
