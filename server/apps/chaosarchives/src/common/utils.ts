import { convert } from "html-to-text";
import { DateTime } from "luxon";

export default {
  compareNumbers(a: number, b: number): -1 | 0 | 1 {
    if (a < b) {
      return -1;
    }

    if (a > b) {
      return 1;
    }

    return 0;
  },

  htmlToText(html: string): string {
    return convert(html, {
      wordwrap: false,
      selectors: [
        {
          selector: 'a',
          options: {
            ignoreHref: true,
          },
        },
        {
          selector: 'img',
          format: 'skip',
        }
      ]
    });
  },

  async delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  },

  async delayUntil(time: DateTime): Promise<void> {
    return this.delay(time.diff(DateTime.now()).toMillis());
  },
};
