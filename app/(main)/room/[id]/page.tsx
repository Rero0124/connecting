"use client";

import { useEffect, useState } from "react";
import { setTitle } from "@/lib/features/saveData/saveDataSlice";
import { useAppDispatch } from "@/lib/hooks";

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
