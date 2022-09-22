import Head from "next/head";
import { format, add } from "date-fns";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

export default function Group({ schedule, group }) {
  const router = useRouter();

  function reset() {
    Cookies.remove("group");
    router.push("/");
  }

  return (
    <>
      <Head>
        <title>{group} - ush</title>
        <meta name="theme-color" content="#121212" />
      </Head>
      <div className="mx-auto max-w-screen-md w-full">
        <div className="w-full mt-4 px-4 flex justify-between items-center">
          <h1 className="font-bold text-2xl">ush</h1>
          <span
            className="text-sm cursor-pointer select-none text-blue-500"
            onClick={reset}
          >
            Сбросить группу
          </span>
        </div>
        <div className="mt-0 w-full px-4">
          {schedule.map(({ date, pairs, weekDay }, id) => (
            <div key={id}>
              {pairs.filter((p) => p.schedulePairs[0]).length !== 0 && (
                <div key={id}>
                  <h3 className="w-full h-[56px] flex justify-center items-center">
                    {date} - {weekDay}
                  </h3>
                  <div className="divide-y divide-gray-500">
                    {pairs.map(
                      ({ time, schedulePairs }, id) =>
                        time !== "-" &&
                        schedulePairs[0]?.subject && (
                          <div key={id} className="py-2">
                            <div>{time}</div>
                            <div>{schedulePairs[0]?.subject}</div>
                            <div className="text-gray-500">
                              {schedulePairs[0] && (
                                <a
                                  href={`//usue.ru/raspisanie/getteams?prepod=${schedulePairs[0].teacher}`}
                                >
                                  {schedulePairs[0].teacher}
                                </a>
                              )}
                            </div>
                            <div className="text-gray-500">
                              {schedulePairs[0]?.aud}
                            </div>
                            <div className="text-gray-500">
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
      </div>
    </>
  );
}

export async function getServerSideProps({ params, res }) {
  const { group } = params;
  const startDate = Date.now();
  const endDate = add(startDate, { months: 1 });

  const schedule = await (
    await fetch(
      `https://www.usue.ru/schedule/?action=show&startDate=${format(
        startDate,
        "dd.MM.yyyy"
      )}&endDate=${format(endDate, "dd.MM.yyyy")}&group=${decodeURIComponent(
        group
      )}`
    )
  ).json();

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );

  return {
    props: { schedule, group: decodeURIComponent(group) },
  };
}
