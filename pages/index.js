import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import slugify from "slugify";

export default function Home() {
  const [group, setGroup] = useState("");
  const router = useRouter();

  function changeGroup(e) {
    setGroup(e.target.value);
  }

  function rememberGroup() {
    Cookies.set("group", group, { expires: 365 });
    router.push(`/${slugify(group).toLowerCase()}`);
  }

  return (
    <>
      <Head>
        <title>ush</title>
        <meta name="theme-color" content="#121212" />
      </Head>
      <div className="max-w-sm flex flex-col justify-center mx-auto px-4 h-screen space-y-4">
        <div>
          Напиши свою группу так, как ты пишешь ее в расписании на сайте УрГЭУ
        </div>
        <input
          onChange={changeGroup}
          className="rounded-xl py-2 px-4"
          value={group}
        />
        <div>
          <button
            onClick={rememberGroup}
            className="bg-blue-500 rounded-xl py-2 px-4"
          >
            Запомнить группу
          </button>
        </div>
      </div>
    </>
  );
}
