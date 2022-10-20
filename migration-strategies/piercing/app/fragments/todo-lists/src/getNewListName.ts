export function getNewListName(lists: { name: string; todos: any[] }[]) {
  const newListAlreadyPresent = !!lists.find(({ name }) => name === "new list");
  let newListSuffix = 0;
  let matchFound = false;
  if (newListAlreadyPresent) {
    do {
      newListSuffix++;
      const alreadyTaken = lists.find(
        ({ name }) => name === `new list ${newListSuffix}`
      );
      if (!alreadyTaken) matchFound = true;
    } while (!matchFound);
  }

  const newListName = `new list${!newListSuffix ? "" : ` ${newListSuffix}`}`;

  return newListName;
}
