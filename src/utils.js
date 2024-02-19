export const getEnvKey = (key) => {
  if (Array.isArray(key)) {
    return key.reduce((result, keyName) => {
      result[keyName] =
        process.env[keyName] || new Error("[ConfigService]: No specified key");
      return result;
    }, {});
  }
  const res = process.env[key];
  if (!res) {
    return new Error("[ConfigService]: No specified key");
  }
  return res;
};

export const getConfigKey = (key) => getEnvKey(key);

export const getChatId = (msg) =>
  msg.message ? msg.message.chat.id : msg.chat.id;

export const match = (verifiable, defaultValue = false, ...samples) => {
  for (const [sample, value] of samples) {
    const validator =
      typeof sample === "function" ? sample : (val) => val === sample;
    if (validator(verifiable)) return value;
  }
  return defaultValue !== false ? defaultValue : null;
};

export const callIfAvailable = (...branches) => {
  const storage = new Map(branches);
  return (name, ...args) =>
    storage.has(name) ? storage.get(name)(...args) : undefined;
};

export const pluralizeWord = (number, forms = []) => {
  const [one, few, many] = forms;
  if (number % 10 === 1 && number % 100 !== 11) {
    return one;
  } else if (
    number % 10 >= 2 &&
    number % 10 <= 4 &&
    (number % 100 < 10 || number % 100 >= 20)
  ) {
    return few;
  } else {
    return many;
  }
};

export const millisecondsToTime = (ms) => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
};

export const callHandlerByKey = (
  cases = [],
  defaultHandler = () => undefined
) => {
  const state = new Map(cases);
  return async (cmdName, ...args) => {
    state.has(cmdName) ? await state.get(cmdName)(...args) : defaultHandler();
  };
};
