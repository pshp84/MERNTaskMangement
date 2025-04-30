import { addDays } from "date-fns";
import { atom } from "jotai";
const isLoggedInAtom = atom<boolean>(false);

const taskFilters = atom<any>({
  priority:[] ,
  status: [],
  dueDateTo: addDays(new Date(), 20),
  dueDateFrom: new Date(),
});

export { isLoggedInAtom ,taskFilters};
