"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const categories = [
  {
    link: "sale",
    description: "On Sale",
  },
  {
    link: "electronics",
    description: "Electronics",
  },
  {
    link: "kitchen-supplies",
    description: "Kitchen Supplies",
  },
  {
    link: "musical-instruments",
    description: "Musical Instruments",
  },
  {
    link: "expensive-clothes",
    description: "Expensive Clothes",
  },
  {
    link: "sport-equipments",
    description: "Sport Equipments",
  },
  {
    link: "tools",
    description: "Tools",
  },
  {
    link: "furniture",
    description: "Furniture",
  },
  {
    link: "accessories",
    description: "Accessories",
  },
  {
    link: "other",
    description: "Other",
  },
];
export default function Home() {
  // const router = useRouter();
  // router.push("/listing/verify")
  return (
    <main className="flex flex-wrap gap-10">
      {categories.map((category, idx) => {
        return (
          <Link
            key={category.link + idx}
            href={"/products/category/" + category.link}
          >
            <div className="flex flex-col w-80 hover:text-sky-500 hover:font-bold hover:cursor-pointer md:w-64">
              <div className="h-36 bg-slate-300 rounded"></div>
              <div>{category.description}</div>
            </div>
          </Link>
        );
      })}
      <Link href="/products/category/all">
        <div className="flex flex-col w-80 hover:text-sky-500 hover:font-bold hover:cursor-pointer md:w-64">
          <div className="h-36 bg-slate-300 rounded"></div>
          <div>All</div>
        </div>
      </Link>
    </main>
  );
}
