import { Component, Show } from "solid-js";
import { A } from "solid-start";

import type { IStory } from "../types";

const Story: Component<{ story: IStory }> = (props) => {
  const hnUrl = (path) => `https://news.ycombinator.com${path}`;

  return (
    <li class="news-item">
      <span class="score">{props.story.points}</span>
      <span class="title">
        <Show
          when={props.story.url}
          fallback={
            <A href={hnUrl(`/item?id=${props.story.id}`)}>
              {props.story.title}
            </A>
          }
        >
          <a
            href={hnUrl(`/item?id=${props.story.id}`)}
            target="_blank"
            rel="noreferrer"
          >
            {props.story.title}
          </a>
          <span class="host"> ({props.story.domain})</span>
        </Show>
      </span>
      <br />
      <span class="meta">
        <Show
          when={props.story.type !== "job"}
          fallback={
            <A href={hnUrl(`/item?id=${props.story.id}`)}>
              {props.story.time_ago}
            </A>
          }
        >
          by{" "}
          <A href={hnUrl(`/user?id=${props.story.user}`)}>{props.story.user}</A>{" "}
          {props.story.time_ago} |{" "}
          <A href={hnUrl(`/item?id=${props.story.id}`)}>
            {props.story.comments_count
              ? `${props.story.comments_count} comments`
              : "discuss"}
          </A>
        </Show>
      </span>
      <Show when={props.story.type !== "link"}>
        {" "}
        <span class="label">{props.story.type}</span>
      </Show>
    </li>
  );
};

export default Story;
