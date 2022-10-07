import Image from "next/image";
import Head from "next/head";
import Page from "../components/Page";

export default function Home() {
  return (
    <>
      <Head>
        <title>ush</title>
        <meta name="theme-color" content="#121212" />
      </Head>
      <Page homepage>
        <div className="h-[calc(100vh-120px)] flex flex-col justify-center">
          <svg
            height="50"
            viewBox="0 0 374 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 0H110L55 110V110L0 0Z" fill="#FC62FF" />
            <path d="M132 27.5L187 0V55L132 27.5Z" fill="#66BFFF" />
            <path d="M242 82.5L187 110L187 55L242 82.5Z" fill="#66BFFF" />
            <path d="M264 0L319 55L374 110H264V0Z" fill="#A975FF" />
          </svg>
          <div className="text-center mt-10 text-lg">
            Начните искать расписание группы или преподавателя
          </div>
        </div>
      </Page>
    </>
  );
}
