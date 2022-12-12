import { initializeServerSideMessageBus } from "piercing-library";
import {
  createHandler,
  renderAsync,
  StartServer,
} from "solid-start/entry-server";

export default createHandler(
  renderAsync((event) => {
    initializeServerSideMessageBus(event.request);
    return <StartServer event={event} />;
  })
);
