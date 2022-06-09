import { useState, useEffect, useRef } from "react";
import Autosuggest from "react-autosuggest";
import Head from "next/head";
import { StatusOfflineIcon } from "@heroicons/react/outline";
import InfiniteScroll from "react-infinite-scroll-component";
import { format, add, sub } from "date-fns";

function getSuggestionValue(s) {
  return s;
}

function renderSuggestion(s) {
  return s;
}

export default function Home() {
  const [group, setGroup] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refetch, setRefetch] = useState(true);
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
        localStorage.setItem("group", group);
        localStorage.setItem("schedule", JSON.stringify(res));
        setSchedule(res);
        setLoading(false);
      });
  }

  const showScheduleFunc = useRef();
  showScheduleFunc.current = showSchedule;

  useEffect(() => {
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

    fetch("/api/suggestions")
      .then((res) => res.json())
      .then((res) => {
        setAllSuggestions(res);
      });
  }, []);

  useEffect(() => {
    if (group === "" || !navigator.onLine || !refetch) {
      return;
    }

    showScheduleFunc.current();
    setRefetch(false);
  }, [group, refetch]);

  function handleChange(e, { newValue }) {
    setGroup(newValue);
  }

  function fetchSuggestions({ value }) {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    setSuggestions(
      inputLength === 0
        ? []
        : allSuggestions.filter(
            (s) => s.toLowerCase().slice(0, inputLength) === inputValue
          )
    );
  }

  function clearSuggestions() {
    setSuggestions([]);
  }

  const inputProps = {
    value: group,
    onChange: handleChange,
  };

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

  return (
    <>
      {offline && (
        <div className="fixed bottom-0 z-30 w-full flex justify-center items-center bg-gray-900 p-1">
          <StatusOfflineIcon className="h-5 w-5 mr-2" />
          Вы не подключены к сети
        </div>
      )}
      <div className="mx-auto max-w-screen-lg w-full">
        <Head>
          <title>Расписание УрГЭУ</title>
          <meta name="theme-color" content="#2a303c" />
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={fetchSuggestions}
          onSuggestionsClearRequested={clearSuggestions}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
          getSuggestionValue={getSuggestionValue}
          highlightFirstSuggestion
          onSuggestionSelected={showSchedule}
        />
        <button
          className={`w-full mx-4 mt-4 btn btn-outline !no-underline${
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
                      <span className="badge badge-primary ml-2">Сегодня</span>
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
                              <tr key={id}>
                                <th
                                  className={`${
                                    isCurrentPair && "!bg-primary"
                                  }`}
                                >
                                  {N}
                                </th>
                                <td
                                  className={`${
                                    isCurrentPair && "!bg-primary"
                                  }`}
                                >
                                  {time}
                                </td>
                                <td
                                  className={`${
                                    isCurrentPair && "!bg-primary"
                                  }`}
                                >
                                  {schedulePairs[0]?.subject}
                                </td>
                                <td
                                  className={`${
                                    isCurrentPair && "!bg-primary"
                                  }`}
                                >
                                  {schedulePairs[0]?.teacher}
                                </td>
                                <td
                                  className={`${
                                    isCurrentPair && "!bg-primary"
                                  }`}
                                >
                                  {schedulePairs[0]?.aud}
                                </td>
                                <td
                                  className={`${
                                    isCurrentPair && "!bg-primary"
                                  }`}
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
          <a
            href="https://www.flaticon.com/free-icons/calendar"
            title="calendar icons"
            className="link mt-4 mb-6 block text-center"
          >
            Calendar icons created by Freepik - Flaticon
          </a>
        </div>
      </div>
      {offline && <div className="h-4 mb-2"></div>}
    </>
  );
}
