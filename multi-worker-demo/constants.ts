export const images = [
	{
		name: `images/0.jpg`,
		tags: ["dark", "ominous", "brooding" ],
	},
	{
		name: `images/1.jpg`,
		tags: ["grey", "muted", "mountains"],
	},
	{
		name: `images/2.jpg`,
		tags: ["cloudy", "vivid"],
	},
	{
		name: `images/3.jpg`,
		tags: ["dark", "ominous", "cumulonimbus"],
	},
	{
		name: `images/4.jpg`,
		tags: ["bright", "vibrant", "pink"],
	},
	{
		name: `images/5.jpg`,
		tags: ["pink", "purple", "stratus"],
	},
	{
		name: `images/6.jpg`,
		tags: ["vibrant", "pier", "sunset", "cirrus"],
	},
	{
		name: `images/7.jpg`,
		tags: ["blue", "vibrant", "beach"],
	},
	{
		name: `images/8.jpg`,
		tags: ["cumulus", "classic", "bright"],
	},
	{
		name: `images/9.jpg`,
		tags: ["cumulonimbus"],
	},
	{
		name: `images/10.jpg`,
		tags: ["muted"],
	},
	{
		name: `images/11.jpg`,
		tags: ["cirrus", "altostratus", "blue", "happy"],
	},
	{
		name: `images/12.jpg`,
		tags: ["towering", "cumulonimbus", "purple"],
	},
	{
		name: `images/13.jpg`,
		tags: ["sunset", "blue"],
	},
	{
		name: `images/14.jpg`,
		tags: ["bright", "moon", "gradient"],
	},
	{
		name: `images/15.jpg`,
		tags: ["contrail", "vertical", "cirrus"],
	},
	{
		name: `images/16.jpg`,
		tags: ["starry", "night", "cumulus"],
	},
	{
		name: `images/17.jpg`,
		tags: ["ocean", "nimbus", "beige"],
	},
	{
		name: `images/18.jpg`,
		tags: ["blue", "classic", "happy", "cumulus"],
	},
	{
		name: `images/19.jpg`,
		tags: ["thin", "blue"],
	},
	{
		name: `images/20.jpg`,
		tags: ["grey", "stormy", "nimbus", "ominous"],
	},
	{
		name: `images/21.jpg`,
		tags: ["solo", "tiny", "gradient"],
	},
	{
		name: `images/22.jpg`,
		tags: ["sunset", "contrail", "birds"],
	},
	{
		name: `images/23.jpg`,
		tags: ["highlights", "cumulonimbus"],
	},
	{
		name: `images/24.jpg`,
		tags: ["flying", "sunset", "pillowy"],
	},
	{
		name: `images/25.jpg`,
		tags: ["cumulus", "flying", "classic"],
	},
	{
		name: `images/26.jpg`,
		tags: ["contrail", "towering"],
	},
	{
		name: `images/27.jpg`,
		tags: ["purple", "nimbus", "sunset"],
	},
	{
		name: `images/28.jpg`,
		tags: ["grey", "nimbus"],
	},
	{
		name: `images/29.jpg`,
		tags: ["nimbus", "purple", "pink"],
	},
	{
		name: `images/30.jpg`,
		tags: ["cirrus", "blue", "silky"],
	},
	{
		name: `images/31.jpg`,
		tags: ["cumulonimbus", "ominous", "green"],
	},
	{
		name: `images/32.jpg`,
		tags: ["blanket", "trees", "gradient"],
	},
];

export const tags = Object.keys(
	images.reduce(
		(acc, img) => ({
			...acc,
			...Object.fromEntries(img.tags.map((tag) => [tag, null])),
		}),
		{}
	)
);
