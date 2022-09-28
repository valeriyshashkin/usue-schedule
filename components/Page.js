import Header from "../components/Header";
import Search from "../components/Search";
import Content from "../components/Content";
import { useEffect, useState } from "react";
import useSWR from "swr";
import Fuse from "fuse.js";

export default function Page({ homepage, children }) {
  const [search, setSearch] = useState(false);
  const [fuse, setFuse] = useState();

  const { data } = useSWR("/api/tips", (...args) =>
    fetch(...args).then((res) => res.json())
  );

  function showSearch() {
    setSearch(true);
  }

  function hideSearch() {
    setSearch(false);
  }

  useEffect(() => {
    setFuse(new Fuse(data, { keys: ["label"] }));
  }, [data]);

  return (
    <Content>
      <Header loading={!data} homepage={homepage} onSearchClick={showSearch} />
      {search ? <Search fuse={fuse} onBackClick={hideSearch} /> : children}
    </Content>
  );
}
