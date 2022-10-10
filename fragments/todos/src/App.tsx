import "./App.css";
import { dispatchPiercingEvent } from "piercing-lib";
import { UIEvent } from "react";

const App: React.FC<{ todosListDetails: { listName: string | null } }> = ({
  todosListDetails: { listName },
}) => {
  return (
    <>
      <h3>{listName}</h3>
      <ul>
        <li>todo 1</li>
        <li>todo 2</li>
        <li>todo 3</li>
        <li>todo 4</li>
        <li>todo 5</li>
      </ul>
    </>
  );
};

export default App;
