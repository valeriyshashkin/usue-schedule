import Header from "../components/Header";
import Search from "../components/Search";
import Content from "../components/Content";
import { useState } from "react";

export default function Page({ homepage, children, tips }) {
  const [search, setSearch] = useState(false);

  function showSearch() {
    setSearch(true);
  }

  function hideSearch() {
    setSearch(false);
  }

  return (
    <Content>
      <Header homepage={homepage} onSearchClick={showSearch} />
      {search ? <Search allTips={tips} onBackClick={hideSearch} /> : children}
    </Content>
  );
}
