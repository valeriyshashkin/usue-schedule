import { useState, useEffect, useRef } from "react";
import Autosuggest from "react-autosuggest";
import Head from "next/head";
import startOfWeek from "date-fns/startOfWeek";
import endOfWeek from "date-fns/endOfWeek";
import format from "date-fns/format";
import {
  StatusOfflineIcon,
  ArrowNarrowLeftIcon,
  ArrowNarrowRightIcon,
} from "@heroicons/react/outline";

function getSuggestionValue(s) {
  return s;
}

function renderSuggestion(s) {
  return s;
}

function getStartDay(delta) {
  return format(
    startOfWeek(Date.now() + 7 * 24 * 60 * 60 * 1000 * delta, {
      weekStartsOn: 1,
    }),
    "dd.MM.yyyy"
  );
}

function getEndDay(delta) {
  return format(
    endOfWeek(Date.now() + 7 * 24 * 60 * 60 * 1000 * delta, {
      weekStartsOn: 1,
    }),
    "dd.MM.yyyy"
  );
}

export default function Home() {
  const [group, setGroup] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [weekDelta, setWeekDelta] = useState(0);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refetch, setRefetch] = useState(true);

  function showSchedule(e) {
    e?.preventDefault();
    setWeekDelta(0);
    setLoading(true);
    fetch("/api/schedule", {
      method: "POST",
      body: JSON.stringify({
        startDate: getStartDay(0),
        endDate: getEndDay(0),
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
    function onOnline() {
      setOffline(false);
      showScheduleFunc.current();
    }

    function onOffline() {
      setOffline(true);
    }

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

  function past() {
    setLoading(true);
    setWeekDelta(weekDelta - 1);

    fetch("/api/schedule", {
      method: "POST",
      body: JSON.stringify({
        startDate: getStartDay(weekDelta - 1),
        endDate: getEndDay(weekDelta - 1),
        group,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        setSchedule(res);
        setLoading(false);
      });
  }

  function future() {
    setLoading(true);
    setWeekDelta(weekDelta + 1);

    fetch("/api/schedule", {
      method: "POST",
      body: JSON.stringify({
        startDate: getStartDay(weekDelta + 1),
        endDate: getEndDay(weekDelta + 1),
        group,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        setSchedule(res);
        setLoading(false);
      });
  }

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

  return (
    <>
      {offline && (
        <>
          <div className="fixed z-30 w-full flex justify-center items-center bg-gray-900 p-1">
            <StatusOfflineIcon className="h-5 w-5 mr-2" />
            Вы не подключены к сети
          </div>
          <div className="h-4 mb-4"></div>
        </>
      )}
      <div className="mx-auto max-w-screen-lg w-full">
        <Head>
          <title>Расписание УрГЭУ</title>
          <meta name="theme-color" content="#2a303c" />
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <form onSubmit={showSchedule}>
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={fetchSuggestions}
            onSuggestionsClearRequested={clearSuggestions}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps}
            getSuggestionValue={getSuggestionValue}
          />

          <button className="btn btn-primary w-full mx-4 mt-0" type="submit">
            Показать расписание
          </button>
        </form>
        <div className="m-4 mt-0 w-full">
          {schedule.length > 0 && (
            <div className="btn-group grid grid-cols-2 mt-4 w-full">
              <button className="btn btn-outline" onClick={past}>
                <ArrowNarrowLeftIcon className="h-6 w-6" />
              </button>
              <button className="btn btn-outline" onClick={future}>
                <ArrowNarrowRightIcon className="h-6 w-6" />
              </button>
            </div>
          )}
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
                <h3 className="w-full p-4 text-center font-bold">
                  {date} - {weekDay}
                  {isCurrentDate !== 0 && <span className="badge badge-primary ml-2">Сегодня</span>}
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
                                className={`${isCurrentPair && "!bg-primary"}`}
                              >
                                {N}
                              </th>
                              <td
                                className={`${isCurrentPair && "!bg-primary"}`}
                              >
                                {time}
                              </td>
                              <td
                                className={`${isCurrentPair && "!bg-primary"}`}
                              >
                                {schedulePairs[0]?.subject}
                              </td>
                              <td
                                className={`${isCurrentPair && "!bg-primary"}`}
                              >
                                {schedulePairs[0]?.teacher}
                              </td>
                              <td
                                className={`${isCurrentPair && "!bg-primary"}`}
                              >
                                {schedulePairs[0]?.aud}
                              </td>
                              <td
                                className={`${isCurrentPair && "!bg-primary"}`}
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
          <a
            href="https://www.flaticon.com/free-icons/calendar"
            title="calendar icons"
            className="link mt-4 mb-6 block text-center"
          >
            Calendar icons created by Freepik - Flaticon
          </a>
        </div>
      </div>
    </>
  );
}
