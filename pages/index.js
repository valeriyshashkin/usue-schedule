import Image from "next/image";
import Head from "next/head";
import Page from "../components/Page";

export default function Home({ tips }) {
  return (
    <>
      <Head>
        <title>ush</title>
        <meta name="theme-color" content="#121212" />
      </Head>
      <Page homepage tips={tips}>
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
      </Page>
    </>
  );
}

export async function getStaticProps() {
  const teachers = await (
    await fetch("https://www.usue.ru/schedule/?action=teacher-list")
  ).json();

  const groups = await (
    await fetch("https://www.usue.ru/schedule/?action=group-list")
  ).json();

  return {
    props: {
      tips: [...teachers.map(({ label }) => label), ...groups],
    },
  };
}
