import { component$, useStylesScoped$ } from "@builder.io/qwik";
import FooterCSS from "./Footer.css?inline";

export const Footer = component$(() => {
  useStylesScoped$(FooterCSS);

  return <footer class="container">Copyright Cloudflare 2022</footer>;
});
