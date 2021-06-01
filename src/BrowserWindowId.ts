import { v4 as uuidv4 } from 'uuid';

const key = 'browser-window-id';

export const browserWindowId: string = (function () {
  try {
    let value = window.sessionStorage.getItem(key);
    if (value !== null && value !== '') {
      return value;
    }

    value = uuidv4();
    window.sessionStorage.setItem(key, value as string);

    return value;
  } catch (e) {
    return uuidv4();
  }
})();
