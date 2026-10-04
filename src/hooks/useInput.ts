import { useState } from "react";
import type { ChangeEvent } from "react";

type InputElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function useInput(defaultValue = "") {
  const [value, setValue] = useState<string>(defaultValue);

  function handleValueChange(event: ChangeEvent<InputElement>) {
    setValue(event.target.value);
  }

  return [value, handleValueChange, setValue] as const;
}

export default useInput;