import { component$, useContext } from "@builder.io/qwik";
import { FragmentContext } from "../base";

export const Image = component$((props: Record<string, string | number>) => {
	const { base } = useContext(FragmentContext);
	return <img {...props} src={base + props.src} />;
});
