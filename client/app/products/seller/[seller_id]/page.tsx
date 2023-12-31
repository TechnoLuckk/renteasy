"use client";
import LoadingSpinner from "@/app/components/LoadingSpinner/LoadingSpinner";
import useSWR from "swr";
import { ProductData } from "../../category/[slug]/page";
import SideBar from "@/app/components/SideBar";
import Link from "next/link";
import Image from "next/image";

const fetcher = (...args: any) =>
  fetch.apply(null, args).then((res) => res.json());

export default function Page({ params }: { params: { seller_id: string } }) {
  const { data, error, isLoading, isValidating } = useSWR(
    `${process.env.NEXT_PUBLIC_HOST_ADDRESS}/api/listing/${params.seller_id}`,
    fetcher
  );
  return (
    <div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grow flex flex-row">
          <div className="hidden sm:block">
            <SideBar />
          </div>
          <div>
            {data.error ? (
              <div>{data.error}</div>
            ) : (
              <div>
                <p className="pb-6 text-xs">
                  {data.seller[0].name}&apos;s products
                </p>
                <div className="flex gap-10 flex-wrap">
                  {data.products.map((item: ProductData, idx: number) => {
                    return (
                      <Link
                        href={{ pathname: "/products/" + item.product_id }}
                        key={idx}
                        className="flex flex-col shrink-0 w-64 md:w-36 hover:text-sky-500 hover:font-bold hover:cursor-pointer"
                      >
                        {item.images && (
                          <Image
                            className="max-w-3xl max-h-3xl"
                            src={item?.images[0]}
                            alt={item.name}
                            width={240}
                            height={120}
                          />
                        )}
                        {!item.images && (
                          <div className="h-36 bg-slate-300 rounded"></div>
                        )}
                        <div>{item.name}</div>
                        <div>{item.product_id}</div>
                        <div>{"$" + item.price}</div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
