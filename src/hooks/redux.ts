import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";

// Hook bertipe agar dispatch dan selector otomatis mengenali tipe store.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();