export const images = [
  {
    name: `images/0.be040fc0eaf83c4b923870d46187385cfd40bba0.webp`,
    tags: ["dark", "ominous", "brooding"],
  },
  {
    name: `images/1.2b034445181723c898404526d2c43209b293b165.webp`,
    tags: ["grey", "muted", "mountains"],
  },
  {
    name: `images/2.cb0b5547a10f12e9ee45817e49733a652e790282.webp`,
    tags: ["cloudy", "vivid"],
  },
  {
    name: `images/3.22f850a2e846a58c303317483ad0444330902282.webp`,
    tags: ["dark", "ominous", "cumulonimbus"],
  },
  {
    name: `images/4.3557ae1aef15747d9edf37bd0c70ee9891b17ed0.webp`,
    tags: ["bright", "vibrant", "pink"],
  },
  {
    name: `images/5.135bc16e988b858cbb0a0643e81ec8bc4956a3d7.webp`,
    tags: ["pink", "purple", "stratus"],
  },
  {
    name: `images/6.c625cf7b03a93cdf5bffdd4f04544918549c23c0.webp`,
    tags: ["vibrant", "pier", "sunset", "cirrus"],
  },
  {
    name: `images/7.56595a43f311c9221337e823434faacb8cf6b43a.webp`,
    tags: ["blue", "vibrant", "beach"],
  },
  {
    name: `images/8.66e063493b4412c82e07462ada2f15dbc1930e47.webp`,
    tags: ["cumulus", "classic", "bright"],
  },
  {
    name: `images/9.2931380e22b4494664496cd20aba7f8cfd856548.webp`,
    tags: ["cumulonimbus"],
  },
  {
    name: `images/10.07798456101c010ab89bcd4208fd3f896c6bd2bf.webp`,
    tags: ["muted"],
  },
  {
    name: `images/11.21662704142dab8bb37d584ce50a7c4a3839d057.webp`,
    tags: ["cirrus", "altostratus", "blue", "happy"],
  },
  {
    name: `images/12.dbab356bde6b34d70dd34c83194fc5071dc1f1ac.webp`,
    tags: ["towering", "cumulonimbus", "purple"],
  },
  {
    name: `images/13.743bbc608ab5d2d077d7d623161d748b2cb8138e.webp`,
    tags: ["sunset", "blue"],
  },
  {
    name: `images/14.c0e5cd8fc4363441f9c92037759a3ae3ed5bf4ed.webp`,
    tags: ["bright", "moon", "gradient"],
  },
  {
    name: `images/15.1b1343e0c8655c0b56603434b985359be2bfe7f5.webp`,
    tags: ["contrail", "vertical", "cirrus"],
  },
  {
    name: `images/16.501020b731207313616c3da7b7742d7c0c4c69d4.webp`,
    tags: ["starry", "night", "cumulus"],
  },
  {
    name: `images/17.bf98cfc07603270210a99bbf0d86d12ab02c4243.webp`,
    tags: ["ocean", "nimbus", "beige"],
  },
  {
    name: `images/18.782d21c510d3628aaceb902f9586d84ccf5756b0.webp`,
    tags: ["blue", "classic", "happy", "cumulus"],
  },
  {
    name: `images/19.4338789677b3fce738edcb73af47c786e4fc646e.webp`,
    tags: ["thin", "blue"],
  },
  {
    name: `images/20.717dff0021c9f3361299f049e85ffb6dd6baf944.webp`,
    tags: ["grey", "stormy", "nimbus", "ominous"],
  },
  {
    name: `images/21.f77dc48b292f48651a523b1e691f991464d1ae80.webp`,
    tags: ["solo", "tiny", "gradient"],
  },
  {
    name: `images/22.8aa0153a717093083c03a080eeed1bea81df091a.webp`,
    tags: ["sunset", "contrail", "birds"],
  },
  {
    name: `images/23.5753f8d25980d429f50bd4369721790ea7dce1b2.webp`,
    tags: ["highlights", "cumulonimbus"],
  },
  {
    name: `images/24.8cc16c97b1ddef5e787f97798892cdbb16ebbd72.webp`,
    tags: ["flying", "sunset", "pillowy"],
  },
  {
    name: `images/25.a65c03081c6e32218447c27e9cf6d1638451fca2.webp`,
    tags: ["cumulus", "flying", "classic"],
  },
  {
    name: `images/26.24cd5ee5d934733286e4f76d5fc68c1babc0fbb1.webp`,
    tags: ["contrail", "towering"],
  },
  {
    name: `images/27.eab11ae92b20dd7987ac74bbe1eb4cd65f38865c.webp`,
    tags: ["purple", "nimbus", "sunset"],
  },
  {
    name: `images/28.21f9baf33a949204af6ffd7babf9670002831623.webp`,
    tags: ["grey", "nimbus"],
  },
  {
    name: `images/29.8e5cfe7592ea8c53db64718f587fb7d504ce5973.webp`,
    tags: ["nimbus", "purple", "pink"],
  },
  {
    name: `images/30.67b5ac5860b70c4c8c9db3031a70d4ad3b042c92.webp`,
    tags: ["cirrus", "blue", "silky"],
  },
  {
    name: `images/31.ea419a0eb6b1d898571a81ec0b18db2d9c6c3ad6.webp`,
    tags: ["cumulonimbus", "ominous", "green"],
  },
  {
    name: `images/32.9110c04b3e529c1a6996850dd1ba909ae9009141.webp`,
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
