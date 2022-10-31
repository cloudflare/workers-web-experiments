import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { Image } from "helpers";
import styles from "./GalleryItem.css?inline";

interface Props {
	src: string;
	tags: string[];
}

export const GalleryItem = component$<Props>((props) => {
	useStylesScoped$(styles);

	return (
		<div class="gallery-item">
			<Image
				class="gallery-image"
				alt="cloud picture"
				src={props.src}
				width={300}
				height={450}
			/>
			<div class="tags">{props.tags.join(", ")}</div>
		</div>
	);
});
