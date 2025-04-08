"use client";

import { setTitle } from "@/lib/features/savedata/savedataSlice";
import { useAppDispatch } from "@/lib/hooks";
import { useEffect } from "react";

export default function Main() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setTitle('room'))
  }, [])

  return (
    <div className="">
      <main className="">

      </main>
    </div>
  );
}
