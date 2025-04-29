import { priorities } from "@/data/data";
import { atom } from "jotai";
const isLoggedInAtom = atom<boolean>(false);

const taskFilters = atom<any>({
  priority:[] ,
  status: [],
  dueDateTo: "",
  dueDateFrom: "",
});

export { isLoggedInAtom ,taskFilters};
