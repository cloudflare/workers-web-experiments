export const images = [
	{
		name: "images/0-e72f5f6be5a5eeaf0be7a319c8dd675c.webp",
		tags: ["dark", "ominous", "brooding"],
	},
	{
		name: "images/1-371e66d2495da5bc8613494e69becc0a.webp",
		tags: ["grey", "muted", "mountains"],
	},
	{
		name: "images/2-65437db5ab531e9f94cadd6fe11cf8b6.webp",
		tags: ["cloudy", "vivid"],
	},
	{
		name: "images/3-0ac0c949c428ac3379e3327f45b7a089.webp",
		tags: ["dark", "ominous", "cumulonimbus"],
	},
	{
		name: "images/4-229d24e98db1a7b666f031531c472d7c.webp",
		tags: ["bright", "vibrant", "pink"],
	},
	{
		name: "images/5-953af62d3089a93606df34e008c66919.webp",
		tags: ["pink", "purple", "stratus"],
	},
	{
		name: "images/6-acfc98dfa2bd3cf234b30eb0c6e0cc90.webp",
		tags: ["vibrant", "pier", "sunset", "cirrus"],
	},
	{
		name: "images/7-a34452011e17e2c2a75f03aa31e32941.webp",
		tags: ["blue", "vibrant", "beach"],
	},
	{
		name: "images/8-7401be035d142d807cf7735063eab67b.webp",
		tags: ["cumulus", "classic", "bright"],
	},
	{
		name: "images/9-fa4744cdfcbb3a9c0efcd174103f1ab5.webp",
		tags: ["cumulonimbus"],
	},
	{
		name: "images/10-69984df5e645701f4581536323b7c41f.webp",
		tags: ["muted"],
	},
	{
		name: "images/11-b1a732f1997cce0fde4cda885757e359.webp",
		tags: ["cirrus", "altostratus", "blue", "happy"],
	},
	{
		name: "images/12-1ac2a536afbe9a9313c62170c23f9358.webp",
		tags: ["towering", "cumulonimbus", "purple"],
	},
	{
		name: "images/13-33199ff009abeee46360306c60606269.webp",
		tags: ["sunset", "blue"],
	},
	{
		name: "images/14-ebc2c044328779fdecaf95c1597a7417.webp",
		tags: ["bright", "moon", "gradient"],
	},
	{
		name: "images/15-df5bb570b072e3065f69f203ddc431d1.webp",
		tags: ["contrail", "vertical", "cirrus"],
	},
	{
		name: "images/16-9f3b9c41c785fb903e5bf057f01d9574.webp",
		tags: ["starry", "night", "cumulus"],
	},
	{
		name: "images/17-2052ce0c884e68504cee2572cc43c387.webp",
		tags: ["ocean", "nimbus", "beige"],
	},
	{
		name: "images/18-37006d1d4d8a6d248926c6abefaa6a51.webp",
		tags: ["blue", "classic", "happy", "cumulus"],
	},
	{
		name: "images/19-dc53160057692285d5c98f8682aebab6.webp",
		tags: ["thin", "blue"],
	},
	{
		name: "images/20-1236954bab135dbd13999373d07229f5.webp",
		tags: ["grey", "stormy", "nimbus", "ominous"],
	},
	{
		name: "images/21-e48b1de452f07bb3dc9bccf0ba1e0403.webp",
		tags: ["solo", "tiny", "gradient"],
	},
	{
		name: "images/22-e3c852822e0eed97155f80d04eb0bcda.webp",
		tags: ["sunset", "contrail", "birds"],
	},
	{
		name: "images/23-56c44e769289f7676f7481d1b7876c24.webp",
		tags: ["highlights", "cumulonimbus"],
	},
	{
		name: "images/24-d339f318a01c4fd61fa907fa6025a9fe.webp",
		tags: ["flying", "sunset", "pillowy"],
	},
	{
		name: "images/25-238c18ff90baeb48000b0992bd0a4084.webp",
		tags: ["cumulus", "flying", "classic"],
	},
	{
		name: "images/26-cdf2b4f87cd8de7f289bda5a84656f00.webp",
		tags: ["contrail", "towering"],
	},
	{
		name: "images/27-e320c5de78839b6c68376bf5598b6c8e.webp",
		tags: ["purple", "nimbus", "sunset"],
	},
	{
		name: "images/28-5c73bf34b108c2cee91121c0e0e015ee.webp",
		tags: ["grey", "nimbus"],
	},
	{
		name: "images/29-1eb37b19296a00d743ace24a681b0a6a.webp",
		tags: ["nimbus", "purple", "pink"],
	},
	{
		name: "images/30-05a58814d600b7cb304e41d5eeac4e0f.webp",
		tags: ["cirrus", "blue", "silky"],
	},
	{
		name: "images/31-f8f288e7d84f83c51fed3e356309f95a.webp",
		tags: ["cumulonimbus", "ominous", "green"],
	},
	{
		name: "images/32-c3e2027743fa80a97c4c17fba203c768.webp",
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
