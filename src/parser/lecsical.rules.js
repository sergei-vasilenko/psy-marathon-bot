const lecsicalRules = {
  defaultSignature: "command_name:cmd",
  separators: {
    args: " ",
    token: ":",
  },
  types: {
    cmd: {
      validator: () => true,
      converter: (value) => value,
    },
    int: {
      validator: (value) => /^\d+$/.test(value),
      converter: (value) => Number(value),
    },
    bool: {
      validator: (value) => ["true", "false"].includes(value),
      converter: (value) => Boolean(value),
    },
    str: {
      validator: () => true,
      converter: (value) => value,
    },
    any: {
      validator: () => true,
      converter: (value) => value,
    },
    list: {
      base: [],
      add: (list, value) => list.push(value),
      validator: () => true,
      converter: (value) => value,
    },
  },
};

export default lecsicalRules;
