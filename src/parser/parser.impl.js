import lecsicalRules from "./lecsical.rules.js";
import { signatures } from "../constants/commands.js";

class LineParser {
  #lecsicalRules = null;
  #signatures = new Map();

  constructor(lecsicalRules, signatures) {
    this.#lecsicalRules = lecsicalRules;
    Object.entries(signatures).forEach(([signatureName, signatureValue]) => {
      this.#signatures.set(signatureName, this.#parseSignature(signatureValue));
    });
    this.#signatures.set(
      "$default",
      this.#parseSignature(lecsicalRules.defaultSignature)
    );
  }

  #getTypeHandlers(typename) {
    const { types } = this.#lecsicalRules;

    const validatorErrWrapper = {
      apply() {
        const result = Reflect.apply(...arguments);
        if (!result) {
          console.error(
            `The type for the "${arguments[2][0]}" argument doesn't match the specified one`
          );
        }
        return result;
      },
    };

    return {
      validator: new Proxy(types[typename].validator, validatorErrWrapper),
      converter: types[typename].converter,
    };
  }

  #wrapBaseStruct(target, addMethod) {
    class StructWrapper {
      #target = null;

      constructor(target) {
        this.#target = target;
      }

      get state() {
        return this.#target;
      }

      add(value) {
        addMethod(this.#target, value);
      }
    }
    return new StructWrapper(target, addMethod);
  }

  #parseSignature(signature) {
    const { separators, types } = this.#lecsicalRules;
    return signature
      .replace(/\s+/g, " ")
      .split(separators.args)
      .reduce((result, token) => {
        const [name, type] = token.split(separators.token);

        const typeHandlers = this.#getTypeHandlers(type);

        result.push({
          name,
          type,
          validator: typeHandlers.validator,
          converter: typeHandlers.converter,
          ...(types[type].base && {
            base: this.#wrapBaseStruct(types[type].base, types[type].add),
          }),
        });

        return result;
      }, []);
  }

  #getSignature(string) {
    const cmdEndIdx = string.indexOf(this.#lecsicalRules.separators.args);
    const cmdName = string.slice(0, cmdEndIdx);

    return this.#signatures.has(cmdName)
      ? this.#signatures.get(cmdName)
      : this.#signatures.get("$default");
  }

  getArgs(string = "") {
    const { separators } = this.#lecsicalRules;
    const result = {};
    const pointers = [0, null];
    const trimedStr = string.trim().replace(/\s+/g, " ");

    this.#getSignature(trimedStr).forEach(
      (signature, signatureIndex, { length }) => {
        const { name, validator, converter, base } = signature;

        const endOfArgIdx = trimedStr.indexOf(separators.args, pointers[0]);
        pointers[1] =
          signatureIndex === length - 1 || endOfArgIdx === -1
            ? Infinity
            : endOfArgIdx;

        if (base) {
          trimedStr
            .slice(...pointers)
            .split(separators.args)
            .forEach((arg) => {
              if (validator(arg)) {
                base.add(converter(arg));
              }
            });
          result[name] = base.state;
        } else {
          const arg = trimedStr.slice(...pointers);
          if (validator(arg)) {
            result[name] = converter(arg);
          }
        }

        if (pointers[1] !== null) {
          pointers[0] = pointers[1] + 1;
        }
      }
    );
    return result;
  }
}

const parser = new LineParser(lecsicalRules, signatures);

export default parser;
