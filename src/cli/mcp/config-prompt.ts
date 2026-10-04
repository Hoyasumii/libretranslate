import { ConfigKey, ConfigValues, DEFAULT_PORT, DEFAULT_URL } from "../../mcp/config";
import { CLEAR_SECRET, configValueError } from "./config-ui";
import { PickerTerminal, TextInputOptions, textInput } from "./picker";

/** A blank line is fine (it means the default); anything else must pass the form's check. */
function optional(key: ConfigKey): (value: string) => string | undefined {
  return (value) => (value.trim() === "" ? undefined : configValueError(key, value.trim()));
}

function secret(saved: ConfigValues, key: ConfigKey, hint: string): TextInputOptions {
  return {
    mask: true,
    hint: saved[key] ? `saved · enter keeps it, ${CLEAR_SECRET} clears it` : hint,
    summary: (value) =>
      value.trim() === CLEAR_SECRET ? "cleared" : value.trim() ? "••••••••" : saved[key] ? "kept" : "none",
  };
}

/**
 * Ask for each setting in turn, starting from the saved values, with the form's rules: a blank
 * secret keeps the saved one, `-` clears it, other blanks fall back to defaults. Answers what was
 * entered, for `valuesFromInput`, or `undefined` when a prompt was cancelled.
 */
export async function promptConfig(saved: ConfigValues, terminal: PickerTerminal): Promise<ConfigValues | undefined> {
  const input: ConfigValues = {};
  const ask = async (key: ConfigKey, options: TextInputOptions): Promise<boolean> => {
    const value = await textInput(key, options, terminal);
    if (value === undefined) return false;
    input[key] = value;
    return true;
  };

  const baseUrl: TextInputOptions = {
    hint: "your LibreTranslate instance, with its base path if any",
    initial: saved.LIBRETRANSLATE_URL ?? DEFAULT_URL,
    placeholder: DEFAULT_URL,
    validate: (value) =>
      value.trim() ? configValueError("LIBRETRANSLATE_URL", value.trim()) : "LIBRETRANSLATE_URL is required.",
  };
  if (!(await ask("LIBRETRANSLATE_URL", baseUrl))) return undefined;
  if (
    !(await ask(
      "LIBRETRANSLATE_API_KEY",
      secret(
        saved,
        "LIBRETRANSLATE_API_KEY",
        "only for instances that issue keys (e.g. libretranslate.com) · blank: none"
      )
    ))
  ) {
    return undefined;
  }
  const port: TextInputOptions = {
    hint: `MCP server port on 127.0.0.1 · blank: ${DEFAULT_PORT}`,
    initial: saved.PORT,
    placeholder: String(DEFAULT_PORT),
    validate: optional("PORT"),
    summary: (value) => value.trim() || `${DEFAULT_PORT} (default)`,
  };
  if (!(await ask("PORT", port))) return undefined;
  return input;
}
