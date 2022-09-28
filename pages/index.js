import Header from "../components/Header";
import Search from "../components/Search";
import Image from "next/image";
import { useState } from "react";
import Head from "next/head";
import Content from "../components/Content";

export default function Home() {
  const [search, setSearch] = useState(false);

  function showSearch() {
    setSearch(true);
  }

  function hideSearch() {
    setSearch(false);
  }

  return (
    <>
      <Head>
        <title>ush</title>
        <meta name="theme-color" content="#121212" />
      </Head>
      <Content>
        <Header homepage onSearchClick={showSearch} />
        {search ? (
          <Search onBackClick={hideSearch} />
        ) : (
          <div className="h-[calc(100vh-120px)] flex flex-col justify-center">
            <div className="h-[150px] relative">
              <Image
                src="/cat.gif"
                layout="fill"
                objectFit="contain"
                priority
                alt=""
              />
            </div>
            <div className="text-center">
              Начните искать расписание группы или преподавателя
            </div>
          </div>
        )}
      </Content>
    </>
  );
}
