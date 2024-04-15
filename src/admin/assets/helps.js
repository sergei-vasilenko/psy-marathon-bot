const millisecondsToTime = (ms) => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
};

export const localTime = (datestamp) => new Date(datestamp).toLocaleString();

export const fullname = (user) => `${user.first_name} ${user.last_name}`;

export const getDurationTime = (duration) => {
  const { since: start, until: end } = duration;
  const { hours, minutes } = millisecondsToTime(end - start);
  if (!hours) {
    return `${minutes}min`;
  }
  if (hours && !minutes) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}min`;
};

export const throttle = (fn, ms) => {
  let timer = null;

  return (...args) => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    timer = setTimeout(() => {
      const result = fn.apply(null, args);
      timer = null;
      return result;
    }, ms);
  };
};

export const arraysDeepEqual = (arr1, arr2, verifier) => {
  if (
    !Array.isArray(arr1) ||
    !Array.isArray(arr2) ||
    arr1.length !== arr2.length
  ) {
    return false;
  }

  for (const elem1 of arr1) {
    const hasSameElem = arr2.find((elem2) => verifier(elem1, elem2));
    if (!hasSameElem) {
      return false;
    }
  }

  return true;
};

export const removeFields = (target, predicat) => {
  if (Array.isArray(target)) {
    return target.map((elem) => removeFields(elem, predicat));
  }
  if (target !== null && typeof target === "object") {
    const fields = Object.keys(target);
    const result = {};
    for (const field of fields) {
      if (predicat(field)) {
        delete result[field];
        continue;
      }
      result[field] = removeFields(target[field], predicat);
    }
    return result;
  }
  return target;
};
