export default async function handler(req, res) {
  if (req.method === "POST") {
    const { startDate, endDate, group } = JSON.parse(req.body);

    const response = await fetch(
      `https://www.usue.ru/schedule/?action=show&startDate=${startDate}&endDate=${endDate}&group=${group}`
    );

    const schedule = await response.json();

    res.json(schedule);
  }
}
