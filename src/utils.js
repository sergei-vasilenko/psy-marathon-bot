import path from "path";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { PROJECT_NAME } from "./constants.js";

export const getEnvKey = (key) => {
  const { error, parsed } = config();
  if (error || !parsed) {
    return new Error("[ConfigService]: Check your file .env");
  }

  if (Array.isArray(key)) {
    return key.reduce((result, keyName) => {
      result[keyName] =
        parsed[keyName] || new Error("[ConfigService]: No specified key");
      return result;
    }, {});
  }
  const res = parsed[key];
  if (!res) {
    return new Error("[ConfigService]: No specified key");
  }
  return res;
};

// export const getEnvKey = (key) => {
//   if (Array.isArray(key)) {
//     return key.reduce((result, keyName) => {
//       result[keyName] =
//         process.env[keyName] || new Error("[ConfigService]: No specified key");
//       return result;
//     }, {});
//   }
//   const res = process.env[key];
//   if (!res) {
//     return new Error("[ConfigService]: No specified key");
//   }
//   return res;
// };

export const pipe =
  (...fns) =>
  (value, context) => {
    let result = value;
    let isContinue = true;
    const stop = (data) => {
      result = data;
      isContinue = false;
    };
    for (const fn of fns) {
      result = fn(result, context, stop);

      if (!isContinue) break;
    }
    return result;
  };

export const compose =
  (...fns) =>
  (value, context) => {
    let result = value;
    let isContinue = true;
    const stop = (data) => {
      result = data;
      isContinue = false;
    };
    for (let i = fns.length - 1; i >= 0; i--) {
      result = fns[i](result, context, stop);

      if (!isContinue) break;
    }
    return result;
  };

export const getConfigKey = (key) => getEnvKey(key);

export const getChatId = (msg) =>
  msg.message ? msg.message.chat.id : msg.chat.id;

export const match =
  (defaultValue = false, ...samples) =>
  (verifiable) => {
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

export const checkFields = (object, fields) => {
  for (const [key, value] of Object.entries(fields)) {
    if (object[key] !== value) {
      return false;
    }
  }
  return true;
};

export const objectFromFields = (object, fields) => {
  return fields.reduce((result, field) => {
    result[field] = object[field];
    return result;
  }, {});
};

export function paths(url) {
  const __filename = fileURLToPath(url);
  const __dirname = path.dirname(__filename);
  const projectNameStartIdx = __dirname.indexOf(PROJECT_NAME);
  const __root =
    projectNameStartIdx === -1
      ? ""
      : __dirname.slice(0, projectNameStartIdx + PROJECT_NAME.length);
  return {
    join: path.join,
    __root,
    __filename,
    __dirname,
  };
}

export const timeToMs = (time, unit) => {
  const unitsCoef = {
    seconds: 1000,
    minutes: 60000,
    hours: 3600000,
    days: 86400000,
  };
  return time * unitsCoef[unit];
};
