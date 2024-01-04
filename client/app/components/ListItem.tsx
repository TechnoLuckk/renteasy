"use client";
import { IKImage, IKUpload } from "imagekitio-react";
import ImageContext from "./ImageContext";
import { FormEventHandler, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Calendar } from "@/components/ui/calendar";
import { RedirectType, redirect } from "next/navigation";
import { useRouter } from "next/navigation";

type UploadImageResponse = {
  fileId: string;
  filePath: string;
  fileType: string;
  height: number;
  width: number;
  url: string;
};

const urlEndpoint = "https://ik.imagekit.io/m3c9xvobb";

export default function ListItem() {
  const onError = (err: any) => {
    console.log("Error", err);
  };

  const onSuccess = (res: UploadImageResponse) => {
    console.log("Success", res);
    setUploadedImages([...uploadedImages, res]);
  };

  const router = useRouter();

  const itemListFormSubmit: any = (e: SubmitEvent) => {
    e.preventDefault();
    const data = {
      name: itemName.current.value,
      price: itemPrice.current.value,
      category: itemCategory.current.value,
      seller_user_id: user.id,
      description: itemDescription.current.value,
      images: uploadedImages.map(
        (imageUploadResponse) => imageUploadResponse.url
      ),
      listing_price: itemListingPrice.current.value,
      unavailable_dates: unavailableDates.map(date => date.toISOString())
    };
    fetch(`${process.env.NEXT_PUBLIC_HOST_ADDRESS}/api/listing/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((resJson) => {
        console.log("Done");
        router.push("/products/seller/"+user.id+"/")
      })
      .catch((err) => console.error(err));
  };
  const [uploadedImages, setUploadedImages] = useState<UploadImageResponse[]>(
    []
  );
  const [unavailableDates, setUnavailableDates] = useState<Date[] | undefined>([]);
  const { isLoaded, isSignedIn, user } = useUser();
  const itemName = useRef<HTMLInputElement>() as any;
  const itemPrice = useRef<HTMLInputElement>() as any;
  const itemListingPrice = useRef<HTMLInputElement>() as any;
  const itemCategory = useRef<HTMLInputElement>() as any;
  const itemDescription = useRef<HTMLInputElement>() as any;

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  if (isLoaded) {
    return (
      <div>
        <div>Listing new item</div>
        <ImageContext>
          <div className="flex flex-col items-center w-full p-3 gap-2">
            <div className="flex flex-row gap-10 border-2 border-sky-500 overflow-x-auto p-5 h-[300px] w-full rounded">
              {uploadedImages.length > 0 ? (
                uploadedImages.map((img, idx) => {
                  return (
                    <IKImage
                      key={img.fileId}
                      urlEndpoint={urlEndpoint}
                      path={img.filePath}
                      width={400}
                      height={400}
                    />
                  );
                })
              ) : (
                <div className="h-full w-full text-center text-slate-500">
                  Upload images here
                </div>
              )}
            </div>
            <IKUpload
              fileName={user.id}
              validateFile={(file) => file.size < 2000000}
              folder={"/renteasy"}
              onError={onError}
              onSuccess={onSuccess}
            />
          </div>
        </ImageContext>
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
                placeholder="Enter item name"
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
                placeholder="Enter price"
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
                Enter price per day for the item
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
                <option value="kitchen-supplies">Kitchen Supplies</option>
                <option value="entertainment">Entertainment</option>
                <option value="school-supplies">School Supplies</option>
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
                    date <= new Date() || date > new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                  }
                  className="rounded-md border w-64"
                />
              </div>
              <small className="block">
                Please enter the dates when the item will not be available.
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
