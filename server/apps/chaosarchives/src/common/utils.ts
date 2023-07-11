import { convert } from "html-to-text";

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
};
