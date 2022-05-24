export default async function handler(req, res) {
  const response = await fetch(
    "https://www.usue.ru/schedule/?action=group-list"
  );

  const groups = await response.json();

  res.json(groups);
}
