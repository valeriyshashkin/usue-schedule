export default async function handler(req, res) {
  const teachers = await (
    await fetch("https://www.usue.ru/schedule/?action=teacher-list")
  ).json();

  const groups = await (
    await fetch("https://www.usue.ru/schedule/?action=group-list")
  ).json();

  res.json([...teachers, ...groups.map((g) => ({ label: g }))]);
}
