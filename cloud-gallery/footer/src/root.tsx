import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./Footer.css?inline";

export const Footer = component$(() => {
	useStylesScoped$(styles);

	return (
		<div class="container">
			<div class="content">
				<p>
					This is a demo application for micro-frontends implemented using{" "}
					<a href="https://workers.cloudflare.com/">Cloudflare Workers</a>. For
					more information check out{" "}
					<a href="https://blog.cloudflare.com/better-micro-frontends">
						the accompanying blog post
					</a>
					.
				</p>
				<div class="copyright">Copyright Cloudflare 2022</div>
			</div>
		</div>
	);
});
