// biome-ignore-all lint/suspicious/noConsole: Used for intended logging

export class LoggerApi {
    readonly #tag: string[];

    constructor(id: string, color: string) {
        this.#tag = [`%c[${id}]`, `color:${color}`];
    }

    /** Logs data with a script-specific tag */
    log(...data: any[]) {
        console.log(...this.#tag, ...data);
    }

    /** Logs a warning with a script-specific tag */
    warn(...data: any[]) {
        console.warn(...this.#tag, ...data);
    }

    /** Logs an error with a script-specific tag */
    error(...data: any[]) {
        console.error(...this.#tag, ...data);
    }

    /** Logs info with a script-specific tag */
    info(...data: any[]) {
        console.info(...this.#tag, ...data);
    }

    /** Logs debug information with a script-specific tag */
    debug(...data: any[]) {
        console.debug(...this.#tag, ...data);
    }

    /** Logs a stack trace with a script-specific tag */
    trace(...data: any[]) {
        console.trace(...this.#tag, ...data);
    }
}

Object.freeze(LoggerApi);
Object.freeze(LoggerApi.prototype);
export default LoggerApi;
