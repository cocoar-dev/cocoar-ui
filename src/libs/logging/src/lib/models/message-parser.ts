/* eslint-disable @typescript-eslint/no-explicit-any */

interface Token {
  name?: string;
  text?: string;
  destructure?: boolean;
  raw: string;
  isEnriched?: boolean;
}

export class MessageParser {
  private tokens: Token[];


  public constructor(messageTemplate?: string) {
    this.tokens = this.tokenize(messageTemplate ?? '');
  }

  public render(properties: Record<string, any>, enrichedProperties: Record<string, any>): string {
    const message = this.tokens
      .map((token) => {
        if (token.text) return token.text;
        if (token.name && token.isEnriched) {
          if (Object.prototype.hasOwnProperty.call(enrichedProperties, token.name)) {
            const value = enrichedProperties[token.name];
            return this.toText(value);
          }
          return token.raw;
        }
        if (token.name && Object.prototype.hasOwnProperty.call(properties, token.name)) {
          const value = properties[token.name];
          return this.toText(value);
        }
        return token.raw;
      })
      .join('');

    return message;
  }

  public bindProperties(...args: any[]): { boundProperties: Record<string, any>; unboundProperties: any[] } {
    let properties: Record<string, any> = {};
    const unboundProperties: any[] = [];
    let argIndex = 0;

    if (args.length > 0 && typeof args[0] === 'object' && !this.ignoreFirstArgumentType(args[0])) {
      properties = { ...args[0] };
      argIndex = 1;
    }

    this.tokens.forEach((token) => {
      if (token.name && !token.isEnriched) {
        if (!(token.name in properties)) {
          if (argIndex < args.length) {
            properties[token.name] = args[argIndex++];
          }
        }
      }
    });

    for (; argIndex < args.length; argIndex++) {
      unboundProperties.push(args[argIndex]);
    }

    return { boundProperties: properties, unboundProperties };
  }


  private tokenize(template: string): Token[] {
    const tokenizer = /\{[@~]?\w+}/g;
    const tokens: Token[] = [];
    let lastIndex = 0;

    template.replace(tokenizer, (match, offset) => {
      if (offset > lastIndex) {
        tokens.push({ text: template.substring(lastIndex, offset), raw: '' });
      }
      let name = match.slice(1, -1);
      const isDestructured = name.startsWith('@');
      name = name.slice(isDestructured ? 1 : 0);
      const isEnriched = name.startsWith('~');
      name = name.slice(isEnriched ? 1 : 0);
      tokens.push({ name, raw: match, destructure: isDestructured, isEnriched: isEnriched });
      lastIndex = offset + match.length;
      return match;
    });

    if (lastIndex < template.length) {
      tokens.push({ text: template.substring(lastIndex), raw: '' });
    }

    return tokens;
  }

  private ignoreFirstArgumentType(value: any) {
    if (Array.isArray(value)) {
      return true;
    }

    if (value instanceof Date) {
      return true;
    }

    if (value instanceof Error) {
      return true;
    }

    return false;
  }

  private toText(value: any): string {
    if (value === null) {
      return 'null';
    }

    if (Array.isArray(value)) {
      return value.map((v) => this.toText(v)).join(', ');
    }

    if (value instanceof Error) {
      return value.message; // Or any other representation you prefer
    }

    if (typeof value.toISOString === 'function') {
      return value.toISOString();
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }
}
