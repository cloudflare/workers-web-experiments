import { FragmentPlaceholder } from "helpers";
import "./global.scss";
import "./normalize.css";
import "./layout.css";

export default () => {
	return (
		<>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<meta
					name="description"
					content="A demo showcasing a fragments architecture on Cloudflare Workers"
				/>
				<title>Cloud Gallery</title>
			</head>
			<body>
				<div class="page-container">
					<div class="header-fragment">
						<a
							href="https://cloud-gallery-header.web-experiments.workers.dev/"
							class="seam-link"
						>
							header
						</a>
						<FragmentPlaceholder name="header" />
					</div>
					<div class="body-fragment">
						<a
							href="https://cloud-gallery-body.web-experiments.workers.dev/"
							class="seam-link"
						>
							body
						</a>
						<FragmentPlaceholder name="body" />
					</div>
					<div class="footer-fragment">
						<a
							href="https://cloud-gallery-footer.web-experiments.workers.dev/"
							class="seam-link"
						>
							footer
						</a>
						<FragmentPlaceholder name="footer" />
					</div>
				</div>
			</body>
		</>
	);
};
