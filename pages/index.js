import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import InfiniteScroll from "react-infinite-scroll-component";
import { format, add } from "date-fns";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const groupAtom = atomWithStorage("group", "");

export default function Home() {
  const [group, setGroup] = useAtom(groupAtom);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mount, setMount] = useState(false);
  const [groupInput, setGroupInput] = useState("");
  const startDateRef = useRef();
  const endDateRef = useRef();

  function showSchedule() {
    fetch("/api/schedule", {
      method: "POST",
      body: JSON.stringify({
        startDate: format(startDateRef.current, "dd.MM.yyyy"),
        endDate: format(endDateRef.current, "dd.MM.yyyy"),
        group,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
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
  }, []);

  useEffect(() => {
    if (group === "") {
      return;
    }

    showScheduleFunc.current();
  }, [group]);

  function next() {
    endDateRef.current = add(endDateRef.current, { days: 7 });
    showSchedule();
  }

  function reset() {
    setGroup("");
    setSchedule([]);
  }

  function changeGroup(e) {
    setGroupInput(e.target.value);
  }

  function rememberGroup() {
    setGroup(groupInput);
  }

  return (
    <>
      <Head>
        <title>ush</title>
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
        {mount &&
          (!group ? (
            <div className="text-center px-4">
              <div className="text-xl mt-20 mb-6">
                Напиши свою группу так, как ты пишешь ее в расписании на сайте
                УрГЭУ
              </div>
              <input
                onChange={changeGroup}
                className="text-lg rounded-xl py-2 px-4"
              />
              <div>
                <button
                  onClick={rememberGroup}
                  className="bg-blue-500 rounded-xl text-lg py-2 px-4 mt-6"
                >
                  Запомнить группу
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-0 w-full px-4">
                {mount && (
                  <InfiniteScroll
                    dataLength={schedule.length}
                    next={next}
                    hasMore
                    loader={
                      <>
                        <div className="mt-4 p-4 bg-neutral-800 h-[24px] rounded-lg"></div>
                        <div className="mt-4 bg-neutral-800 h-[316px] rounded-lg"></div>
                        <div className="mt-4 p-4 bg-neutral-800 h-[24px] rounded-lg"></div>
                        <div className="mt-4 bg-neutral-800 h-[316px] rounded-lg"></div>
                        <div className="mt-4 p-4 bg-neutral-800 h-[24px] rounded-lg"></div>
                        <div className="mt-4 bg-neutral-800 h-[316px] rounded-lg"></div>
                      </>
                    }
                  >
                    {loading ? (
                      <>
                        <div className="mt-4 p-4 bg-neutral-800 h-[24px] rounded-lg"></div>
                        <div className="mt-4 bg-neutral-800 h-[316px] rounded-lg"></div>
                        <div className="mt-4 p-4 bg-neutral-800 h-[24px] rounded-lg"></div>
                        <div className="mt-4 bg-neutral-800 h-[316px] rounded-lg"></div>
                        <div className="mt-4 p-4 bg-neutral-800 h-[24px] rounded-lg"></div>
                        <div className="mt-4 bg-neutral-800 h-[316px] rounded-lg"></div>
                      </>
                    ) : (
                      schedule.map(({ date, pairs, weekDay }, id) => (
                        <div key={id}>
                          {pairs.filter((p) => p.schedulePairs[0]).length !==
                            0 && (
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
                      ))
                    )}
                  </InfiniteScroll>
                )}
              </div>
            </>
          ))}
      </div>
    </>
  );
}
