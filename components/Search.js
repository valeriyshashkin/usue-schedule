import { ArrowLeftIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Cookies from "js-cookie";
import slugify from "slugify";
import Link from "next/link";
import { useState } from "react";

export default function Search({ onBackClick, fuse }) {
  const [query, setQuery] = useState("");
  const [tips, setTips] = useState([]);

  function rememberGroup({ target: { innerText } }) {
    Cookies.set("group", innerText);
    onBackClick();
  }

  function clear() {
    setQuery("");
    setTips([]);
  }

  function changeQuery({ target: { value } }) {
    setQuery(value);
    setTips(fuse.search(value).slice(0, 14));
  }

  return (
    <div className="max-w-screen-md mx-auto px-4 pt-4 absolute top-0 w-full bg-[#121212] h-screen">
      <div className="flex items-center">
        <button onClick={onBackClick}>
          <ArrowLeftIcon className="w-6 shrink-0" />
        </button>
        <div className="relative ml-4 w-full">
          <input
            autoFocus
            value={query}
            onChange={changeQuery}
            className="px-2 py-1 w-full pr-10"
          />
          <button tabIndex={-1} onClick={clear} className="z-20">
            <XMarkIcon
              tabIndex={0}
              className="absolute h-6 min-w-6 right-0 top-1/2 -translate-y-1/2 mr-2"
            />
          </button>
        </div>
      </div>
      <div className="divide-y divide-neutral-500 pt-2">
        {tips.map(({ item: { label } }, i) => (
          <Link key={i} href={`/${slugify(label).toLowerCase()}`}>
            <a onClick={rememberGroup} className="py-4 block">
              {label}
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
