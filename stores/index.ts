import { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
// import { State } from 'react-use/lib/useMouse';

// export const useStoreCustom = (cb: any) => {
//   const store = cb()
//   const [data, setData] = useState()

//   useEffect(() => {
//     setData(store)
//   }, [store])

//   return data;
// }


export const useStoreCustom = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F
) => {
  const result = store(callback) as F
  const [data, setData] = useState<F>()

  useLayoutEffect(() => {
    // console.log(1)
    setData(result)
  }, [result])

  return data;
};