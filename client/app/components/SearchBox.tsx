"use client";
import React, { useState } from "react";
import { AutoComplete, Input } from "antd";
import type { SelectProps } from "antd";
import { useDebounce } from "./debounce";
import { ProductData } from "../products/category/[slug]/page";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

const fetchSearchData = (value: string) => {
  return fetch(`${process.env.NEXT_PUBLIC_HOST_ADDRESS}/api/products/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ search_term: value }),
  }).then((res) => res.json());
};

export default function SearchBox() {
  const [options, setOptions] = useState<SelectProps<object>["options"]>([]);
  const [searchInputValue, setSearchInputValue] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (typeof searchInputValue != "undefined" && searchInputValue !== "") {
      console.log("searching", searchInputValue);
      searchInputValue && fetchSearchData(searchInputValue).then((res) => {
        if (res.done === false) {
          setOptions([])
        } else {

          res && setOptions(
            res.map((product: ProductData, idx: number) => {
              return {
                value: product.name,
                label: (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    {product.name}
                  </div>
                ),
                product: product
              };
            })
          );
        }
      });
    }
  };

  const onSelect = (value: string, option: SelectProps<object>["options"]) => {
    router.push("/products/"+(option as any).product.product_id)
  };

  const debouncedOnChange = useDebounce(handleSearch);

  return (
    <div className="">
      <AutoComplete
          popupMatchSelectWidth={300}
          options={options as any}
          onSelect={onSelect}
          className="w-full md:w-full"
          notFoundContent="No Products Found"
          size="large"
        >
          <Input.Search
            placeholder="Search RentEasy"
            onChange={(e) => {
              debouncedOnChange();
              setSearchInputValue(e.target.value);
            }}
            value={searchInputValue}
            size="large"
          />
        </AutoComplete>
    </div>
  );
}
