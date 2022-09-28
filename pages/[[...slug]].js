import Head from "next/head";
import { format, add } from "date-fns";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import slugify from "slugify";
import {
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import Fuse from "fuse.js";
import Link from "next/link";
import Image from "next/image";

export default function Group({ schedule, group, teacher }) {
  const router = useRouter();
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [tips, setTips] = useState([]);
  const [fuse, setFuse] = useState();

  useEffect(() => {
    fetch("/api/tips")
      .then((res) => res.json())
      .then((res) => setFuse(new Fuse(res, { keys: ["label"] })));
  }, []);

  function showSearch() {
    setSearch(true);
  }

  function hideSearch() {
    setSearch(false);
  }

  function clear() {
    setQuery("");
    setTips([]);
  }

  function changeQuery({ target: { value } }) {
    setQuery(value);
    setTips(fuse.search(value).slice(0, 14));
  }

  function rememberGroup({ target: { innerText } }) {
    Cookies.set("group", innerText);
    setSearch(false);
  }

  function reset() {
    Cookies.remove("group");
  }

  if (router.isFallback) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          {group ? `${group} - ` : teacher ? `${teacher} - ` : ""}ush
        </title>
        <meta name="theme-color" content="#121212" />
      </Head>
      <div className="mx-auto max-w-screen-md w-full">
        <div className="w-full mt-4 px-4 flex justify-between items-center">
          {(group || teacher) && (
            <Link href="/">
              <a onClick={reset}>
                <ArrowLeftIcon className="w-6" />
              </a>
            </Link>
          )}
          <h1 className="font-bold text-2xl">ush</h1>
          <button onClick={showSearch}>
            <MagnifyingGlassIcon className="w-6" />
          </button>
        </div>
        {search ? (
          <div className="max-w-screen-md mx-auto px-4 pt-4 absolute top-0 w-full bg-[#121212] h-screen">
            <div className="flex items-center">
              <button onClick={hideSearch}>
                <ArrowLeftIcon className="w-6 shrink-0" />
              </button>
              <div className="relative ml-4 w-full">
                <input
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
        ) : group || teacher ? (
          <div className="mt-0 w-full px-4">
            {schedule.map(({ date, pairs, weekDay }, id) => (
              <div key={id}>
                {pairs.filter((p) => p.schedulePairs[0]).length !== 0 && (
                  <div key={id}>
                    <h3 className="w-full h-[56px] flex justify-center items-center">
                      {date} - {weekDay}
                    </h3>
                    <div className="divide-y divide-neutral-500">
                      {pairs.map(
                        ({ time, schedulePairs }, id) =>
                          time !== "-" &&
                          schedulePairs[0]?.subject && (
                            <div key={id} className="py-2">
                              <div>{time}</div>
                              <div>{schedulePairs[0]?.subject}</div>
                              <div className="text-neutral-500">
                                {schedulePairs[0] && (
                                  <a
                                    href={`//usue.ru/raspisanie/getteams?prepod=${schedulePairs[0].teacher}`}
                                  >
                                    {schedulePairs[0].teacher}
                                  </a>
                                )}
                              </div>
                              <div className="text-neutral-500">
                                {schedulePairs[0]?.aud}
                              </div>
                              <div className="text-neutral-500">
                                {schedulePairs[0]?.group}
                              </div>
                            </div>
                          )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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
      </div>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  if (params.slug === undefined) {
    return {
      props: {
        group: "",
      },
    };
  }

  const { slug } = params;

  const groups = await (
    await fetch("https://www.usue.ru/schedule/?action=group-list")
  ).json();
  const teachers = await (
    await fetch("https://www.usue.ru/schedule/?action=teacher-list")
  ).json();

  const slugifiedGroups = groups.map((g) => slugify(g).toLowerCase());
  const slugifiedTeachers = teachers.map(({ label }) =>
    slugify(label).toLowerCase()
  );

  if (
    !slugifiedGroups.includes(slug[0]) &&
    !slugifiedTeachers.includes(slug[0])
  ) {
    return { notFound: true };
  }

  const startDate = Date.now();
  const endDate = add(startDate, { months: 1 });

  let param = "";
  let group = "";
  let teacher = "";

  if (slugifiedGroups.includes(slug[0])) {
    group = groups[slugifiedGroups.findIndex((g) => g === slug[0])];
    param = `group=${group}`;
  } else if (slugifiedTeachers.includes(slug[0])) {
    teacher = teachers[slugifiedTeachers.findIndex((t) => t === slug[0])].label;
    param = `teacher=${teacher}`;
  }

  const schedule = await (
    await fetch(
      `https://www.usue.ru/schedule/?action=show&startDate=${format(
        startDate,
        "dd.MM.yyyy"
      )}&endDate=${format(endDate, "dd.MM.yyyy")}&${param}`
    )
  ).json();

  return {
    props: {
      schedule,
      group,
      teacher,
    },
    revalidate: 60 * 60 * 6,
  };
}
