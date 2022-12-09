import queryString from "query-string";
import Table from "./components/Table/Table";
import "./styles.css";

export const App = () => {
    const queryParams = queryString.parse(window.location.search)
    const {width, height} = queryParams;

    console.log(queryParams);
    return (
    <div>
      <Table width={width} height={height} />
    </div>
  );
};
