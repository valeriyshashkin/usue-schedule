import Head from "next/head";
import { format, add } from "date-fns";
import { useRouter } from "next/router";
import slugify from "slugify";
import Page from "../components/Page";
import Content from "../components/Content";

export default function Group({ schedule, group, teacher }) {
  const router = useRouter();

  if (router.isFallback) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{group || teacher} - ush</title>
        <meta name="theme-color" content="#121212" />
      </Head>
      <Content>
        <Page>
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
        </Page>
      </Content>
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
  const { slug } = params;

  const teachers = await (
    await fetch("https://www.usue.ru/schedule/?action=teacher-list")
  ).json();
  const groups = await (
    await fetch("https://www.usue.ru/schedule/?action=group-list")
  ).json();

  const slugifiedGroups = groups.map((g) => slugify(g).toLowerCase());
  const slugifiedTeachers = teachers.map(({ label }) =>
    slugify(label).toLowerCase()
  );

  if (!slugifiedGroups.includes(slug) && !slugifiedTeachers.includes(slug)) {
    return { notFound: true };
  }

  const startDate = Date.now();
  const endDate = add(startDate, { months: 1 });

  let param = "";
  let group = "";
  let teacher = "";

  if (slugifiedGroups.includes(slug)) {
    group = groups[slugifiedGroups.findIndex((g) => g === slug)];
    param = `group=${group}`;
  } else if (slugifiedTeachers.includes(slug)) {
    teacher = teachers[slugifiedTeachers.findIndex((t) => t === slug)].label;
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
