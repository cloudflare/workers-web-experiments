import {
  component$,
  Resource,
  Slot,
  useResource$,
  useStylesScoped$,
} from "@builder.io/qwik";
import { GalleryItem } from "./components/GalleryItem/GalleryItem";
import { images } from "../../constants";
import { getCookie, useLocation, useFragmentRoot } from "helpers";
import styles from "./Gallery.css?inline";

export const Gallery = component$(() => {
  useStylesScoped$(styles);
  useFragmentRoot();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const filter = queryParams.get("tag") ?? null;
  const filtered = images.filter((i) => !filter || i.tags.includes(filter));

  const delay = Number(getCookie("delay")) ?? 0;

  return (
    <div class="container">
      <div class="spinner-container">
        <span id="spinner" class="spinner"></span>
      </div>
      <div class="cloud-grid">
        {filtered.length === 0 && (
          <div>No matching photos. Try another filter</div>
        )}
        <Lag delay={delay}>
          <style>{`#spinner { display: none; }`}</style>
        </Lag>
        {filtered.length > 0 &&
          filtered.map((img, i) => (
            <Lag delay={delay * (i + 1)}>
              <GalleryItem src={img.name} tags={img.tags} />
            </Lag>
          ))}
      </div>
    </div>
  );
});

// For demonstration purposes only!
// This slows down the rendering of a component for the purpose of simulating a
// a slow network connection.
export const Lag = component$((props: { delay: number }) => {
  const resource = useResource$(async ({ track }) => {
    track(() => props.delay);
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), props.delay * 1000)
    );
  });
  return <Resource value={resource} onResolved={() => <Slot />} />;
});
