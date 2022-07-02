import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { StatusOfflineIcon } from "@heroicons/react/outline";
import InfiniteScroll from "react-infinite-scroll-component";
import { format, add, sub } from "date-fns";

export default function Home({ groups }) {
  const [group, setGroup] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refetch, setRefetch] = useState(true);
  const [mount, setMount] = useState(false);
  const startDateRef = useRef();
  const endDateRef = useRef();

  function showSchedule(groupFromSuggestion) {
    fetch("/api/schedule", {
      method: "POST",
      body: JSON.stringify({
        startDate: format(startDateRef.current, "dd.MM.yyyy"),
        endDate: format(endDateRef.current, "dd.MM.yyyy"),
        group: groupFromSuggestion || group,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        localStorage.setItem("group", groupFromSuggestion || group);
        localStorage.setItem("schedule", JSON.stringify(res));
        setSchedule(res);
        setLoading(false);
      });
  }

  const showScheduleFunc = useRef();
  showScheduleFunc.current = showSchedule;

  useEffect(() => {
    setMount(true);

    startDateRef.current = Date.now();
    endDateRef.current = add(Date.now(), { days: 7 });

    function onOnline() {
      setOffline(false);
      showScheduleFunc.current();
    }

    function onOffline() {
      setOffline(true);
    }

    setOffline(!navigator.onLine);

    addEventListener("online", onOnline);
    addEventListener("offline", onOffline);

    setGroup(localStorage.getItem("group") || "");
    setSchedule(JSON.parse(localStorage.getItem("schedule") || "[]"));
  }, []);

  useEffect(() => {
    if (group === "" || !navigator.onLine || !refetch) {
      return;
    }

    showScheduleFunc.current();
    setRefetch(false);
  }, [group, refetch]);

  function next() {
    if (offline) {
      return;
    }

    endDateRef.current = add(endDateRef.current, { days: 7 });
    showSchedule();
  }

  function prev() {
    setLoading(true);
    startDateRef.current = sub(startDateRef.current, { days: 7 });
    showSchedule();
  }

  function handleSelect(e) {
    setGroup(e.target.value);
    localStorage.setItem("group", e.target.value);
  }

  function reset() {
    localStorage.clear();
    location.reload();
  }

  return (
    <>
      {offline && (
        <div className="fixed bottom-0 z-30 w-full flex justify-center items-center bg-gray-900 p-1">
          <StatusOfflineIcon className="h-5 w-5 mr-2" />
          Вы не подключены к сети
        </div>
      )}
      <div className="mx-auto max-w-screen-md w-full">
        <Head>
          <title>ush</title>
          <meta name="theme-color" content="#2a303c" />
          <link rel="manifest" href="/manifest.json" />
        </Head>
        {mount && !group && (
          <>
            <input
              type="checkbox"
              id="select-group"
              defaultChecked
              className="modal-toggle"
            />
            <div className="modal modal-middle">
              <div className="modal-box">
                <h3 className="font-bold text-4xl text-center">Привет</h3>
                <div className="modal-action">
                  <select
                    className="select select-bordered w-full mx-auto max-w-xs"
                    onChange={handleSelect}
                    defaultValue=""
                  >
                    <option disabled value="">
                      В какой ты группе?
                    </option>
                    {groups.map((g, i) => (
                      <option value={g} key={i}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </>
        )}
        <div className="w-full mt-4 flex mx-4 justify-between items-center">
          <h1 className="font-bold text-2xl">ush</h1>
          <span className="text-sm cursor-pointer" onClick={reset}>
            Сбросить группу
          </span>
        </div>
        <button
          className={`w-full mx-4 mt-4 btn btn-accent text-black !no-underline${
            loading && " loading"
          }`}
          onClick={prev}
          disabled={offline}
        >
          Показать предыдущие дни
        </button>
        <div className="m-4 mt-0 w-full">
          <InfiniteScroll
            dataLength={schedule.length}
            next={next}
            hasMore
            loader={
              !offline && (
                <>
                  <div className="mt-4 p-4 bg-gray-700 h-[24px] rounded-lg"></div>
                  <div className="mt-4 bg-gray-700 h-[316px] rounded-lg"></div>
                  <div className="mt-4 p-4 bg-gray-700 h-[24px] rounded-lg"></div>
                  <div className="mt-4 bg-gray-700 h-[316px] rounded-lg"></div>
                  <div className="mt-4 p-4 bg-gray-700 h-[24px] rounded-lg"></div>
                  <div className="mt-4 bg-gray-700 h-[316px] rounded-lg"></div>
                </>
              )
            }
          >
            {loading ? (
              <>
                <div className="mt-4 p-4 bg-gray-700 h-[24px] rounded-lg"></div>
                <div className="mt-4 bg-gray-700 h-[316px] rounded-lg"></div>
                <div className="mt-4 p-4 bg-gray-700 h-[24px] rounded-lg"></div>
                <div className="mt-4 bg-gray-700 h-[316px] rounded-lg"></div>
                <div className="mt-4 p-4 bg-gray-700 h-[24px] rounded-lg"></div>
                <div className="mt-4 bg-gray-700 h-[316px] rounded-lg"></div>
              </>
            ) : (
              schedule.map(({ date, pairs, isCurrentDate, weekDay }, id) => (
                <div key={id}>
                  <h3 className="w-full h-[56px] flex justify-center items-center font-bold">
                    {date} - {weekDay}
                    {isCurrentDate !== 0 && (
                      <span className="badge badge-accent ml-2 text-black">
                        Сегодня
                      </span>
                    )}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="table table-compact table-zebra w-full">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Время</th>
                          <th>Предмет</th>
                          <th>Преподаватель</th>
                          <th>Аудитория</th>
                          <th>Группа</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pairs.map(
                          ({ N, time, isCurrentPair, schedulePairs }, id) =>
                            time !== "-" && (
                              <tr
                                key={id}
                                className={`${isCurrentPair && "text-black"}`}
                              >
                                <th
                                  className={`${isCurrentPair && "!bg-accent"}`}
                                >
                                  {N}
                                </th>
                                <td
                                  className={`${isCurrentPair && "!bg-accent"}`}
                                >
                                  {time}
                                </td>
                                <td
                                  className={`${isCurrentPair && "!bg-accent"}`}
                                >
                                  {schedulePairs[0]?.subject}
                                </td>
                                <td
                                  className={`${isCurrentPair && "!bg-accent"}`}
                                >
                                  {schedulePairs[0] && (
                                    <a
                                      className="link"
                                      href={`//usue.ru/raspisanie/getteams?prepod=${schedulePairs[0].teacher}`}
                                    >
                                      {schedulePairs[0].teacher}
                                    </a>
                                  )}
                                </td>
                                <td
                                  className={`${isCurrentPair && "!bg-accent"}`}
                                >
                                  {schedulePairs[0]?.aud}
                                </td>
                                <td
                                  className={`${isCurrentPair && "!bg-accent"}`}
                                >
                                  {schedulePairs[0]?.group}
                                </td>
                              </tr>
                            )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </InfiniteScroll>
        </div>
      </div>
      {offline && <div className="h-4 mb-2"></div>}
    </>
  );
}

export async function getStaticProps() {
  const response = await fetch(
    "https://www.usue.ru/schedule/?action=group-list"
  );

  const groups = await response.json();

  return {
    props: { groups },
    revalidate: 60 * 60 * 24 * 7,
  };
}
