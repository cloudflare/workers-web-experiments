import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./Footer.css?inline";

export const Footer = component$(() => {
  useStylesScoped$(styles);

  return <div class="container">Copyright Cloudflare 2022</div>;
});
