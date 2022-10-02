import Cookies from "js-cookie";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default function Header({ homepage, onSearchClick }) {
  function reset() {
    Cookies.remove("group");
  }

  return (
    <div className="w-full mt-4 px-4 flex justify-between items-center">
      {!homepage && (
        <Link href="/">
          <a onClick={reset}>
            <ArrowLeftIcon className="w-6" />
          </a>
        </Link>
      )}
      <h1 className="font-bold text-2xl">ush</h1>
      <button onClick={onSearchClick}>
        <MagnifyingGlassIcon className="w-6" />
      </button>
    </div>
  );
}
