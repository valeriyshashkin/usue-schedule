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

      <svg
        height="20"
        viewBox="0 0 374 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 0H110L55 110V110L0 0Z" fill="#FC62FF" />
        <path d="M132 27.5L187 0V55L132 27.5Z" fill="#66BFFF" />
        <path d="M242 82.5L187 110L187 55L242 82.5Z" fill="#66BFFF" />
        <path d="M264 0L319 55L374 110H264V0Z" fill="#A975FF" />
      </svg>

      <button onClick={onSearchClick}>
        <MagnifyingGlassIcon className="w-6" />
      </button>
    </div>
  );
}
