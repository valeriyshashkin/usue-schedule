export default async function handler(req, res) {
  if (req.method === "POST") {
    const { group } = JSON.parse(req.body);

    const response = await fetch(
      `https://www.usue.ru/schedule/?action=group-list&term=${group}`
    );

    const groups = await response.json();

    res.json(groups);
  }
}
