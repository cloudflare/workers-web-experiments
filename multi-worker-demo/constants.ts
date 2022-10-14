export const images = [
  {
    name: `images/0.webp`,
    tags: ["dark", "ominous", "brooding"],
  },
  {
    name: `images/1.webp`,
    tags: ["grey", "muted", "mountains"],
  },
  {
    name: `images/2.webp`,
    tags: ["cloudy", "vivid"],
  },
  {
    name: `images/3.webp`,
    tags: ["dark", "ominous", "cumulonimbus"],
  },
  {
    name: `images/4.webp`,
    tags: ["bright", "vibrant", "pink"],
  },
  {
    name: `images/5.webp`,
    tags: ["pink", "purple", "stratus"],
  },
  {
    name: `images/6.webp`,
    tags: ["vibrant", "pier", "sunset", "cirrus"],
  },
  {
    name: `images/7.webp`,
    tags: ["blue", "vibrant", "beach"],
  },
  {
    name: `images/8.webp`,
    tags: ["cumulus", "classic", "bright"],
  },
  {
    name: `images/9.webp`,
    tags: ["cumulonimbus"],
  },
  {
    name: `images/10.webp`,
    tags: ["muted"],
  },
  {
    name: `images/11.webp`,
    tags: ["cirrus", "altostratus", "blue", "happy"],
  },
  {
    name: `images/12.webp`,
    tags: ["towering", "cumulonimbus", "purple"],
  },
  {
    name: `images/13.webp`,
    tags: ["sunset", "blue"],
  },
  {
    name: `images/14.webp`,
    tags: ["bright", "moon", "gradient"],
  },
  {
    name: `images/15.webp`,
    tags: ["contrail", "vertical", "cirrus"],
  },
  {
    name: `images/16.webp`,
    tags: ["starry", "night", "cumulus"],
  },
  {
    name: `images/17.webp`,
    tags: ["ocean", "nimbus", "beige"],
  },
  {
    name: `images/18.webp`,
    tags: ["blue", "classic", "happy", "cumulus"],
  },
  {
    name: `images/19.webp`,
    tags: ["thin", "blue"],
  },
  {
    name: `images/20.webp`,
    tags: ["grey", "stormy", "nimbus", "ominous"],
  },
  {
    name: `images/21.webp`,
    tags: ["solo", "tiny", "gradient"],
  },
  {
    name: `images/22.webp`,
    tags: ["sunset", "contrail", "birds"],
  },
  {
    name: `images/23.webp`,
    tags: ["highlights", "cumulonimbus"],
  },
  {
    name: `images/24.webp`,
    tags: ["flying", "sunset", "pillowy"],
  },
  {
    name: `images/25.webp`,
    tags: ["cumulus", "flying", "classic"],
  },
  {
    name: `images/26.webp`,
    tags: ["contrail", "towering"],
  },
  {
    name: `images/27.webp`,
    tags: ["purple", "nimbus", "sunset"],
  },
  {
    name: `images/28.webp`,
    tags: ["grey", "nimbus"],
  },
  {
    name: `images/29.webp`,
    tags: ["nimbus", "purple", "pink"],
  },
  {
    name: `images/30.webp`,
    tags: ["cirrus", "blue", "silky"],
  },
  {
    name: `images/31.webp`,
    tags: ["cumulonimbus", "ominous", "green"],
  },
  {
    name: `images/32.webp`,
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
