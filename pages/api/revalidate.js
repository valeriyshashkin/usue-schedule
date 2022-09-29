import slugify from "slugify";

export default async function handler(req, res) {
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

  for (const s of slugifiedGroups) {
    fetch(`${process.env.DOMAIN}/${s}`);
  }

  for (const s of slugifiedTeachers) {
    fetch(`${process.env.DOMAIN}/${s}`);
  }

  res.end();
}
