import { useState } from "react";
import Autosuggest from "react-autosuggest";
import Head from "next/head";

const startDate = "23.05.2022";
const endDate = "29.05.2022";

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

  function showSchedule() {
    fetch("/api/schedule", {
      method: "POST",
      body: JSON.stringify({ startDate, endDate, group }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setSchedule(res);
      });
  }

  function handleChange(e, { newValue }) {
    setGroup(newValue);
  }

  function fetchSuggestions({ value }) {
    fetch("/api/suggestions", {
      method: "POST",
      body: JSON.stringify({ group: value }),
    })
      .then((res) => res.json())
      .then((res) => setSuggestions(res));
  }

  function clearSuggestions() {
    setSuggestions([]);
  }

  const inputProps = {
    value: group,
    onChange: handleChange,
  };

  return (
    <div className="mx-auto max-w-screen-lg">
      <Head>
        <title>Расписание УрГЭУ</title>
      </Head>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={fetchSuggestions}
        onSuggestionsClearRequested={clearSuggestions}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        getSuggestionValue={getSuggestionValue}
      />
      <button
        className="btn btn-primary w-full mx-4 mt-0"
        onClick={showSchedule}
      >
        Показать расписание
      </button>
      <div className="m-4 mt-0 w-full">
        {schedule.length > 0 && (
          <div className="btn-group grid grid-cols-2 mt-4 w-full">
            <button className="btn btn-outline">Прошлое</button>
            <button className="btn btn-outline">Будущее</button>
          </div>
        )}
        {schedule.map(({ date, pairs, weekDay }, id) => (
          <div key={id}>
            <h3 className="w-full p-4 text-center font-bold">
              {date} - {weekDay}
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
                    ({ N, time, isCurrentPair, schedulePairs }) =>
                      time !== "-" && (
                        <tr>
                          <th className={`${isCurrentPair && "!bg-primary"}`}>
                            {N}
                          </th>
                          <td className={`${isCurrentPair && "!bg-primary"}`}>
                            {time}
                          </td>
                          <td className={`${isCurrentPair && "!bg-primary"}`}>
                            {schedulePairs[0]?.subject}
                          </td>
                          <td className={`${isCurrentPair && "!bg-primary"}`}>
                            {schedulePairs[0]?.teacher}
                          </td>
                          <td className={`${isCurrentPair && "!bg-primary"}`}>
                            {schedulePairs[0]?.aud}
                          </td>
                          <td className={`${isCurrentPair && "!bg-primary"}`}>
                            {schedulePairs[0]?.group}
                          </td>
                        </tr>
                      )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
