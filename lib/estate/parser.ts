import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown';
import { LinkType } from 'contentful-management/typings/appDefinition';
import {
  ContentFields,
  Item,
} from 'contentful-management/typings/contentFields';
import { RichText } from 'contentful-management/typings/entryFields';
import { ImportEntity } from '../../types';

export const getParser = (field: ContentFields | Item): Parser => {
  switch (field.type) {
    case 'Symbol':
    case 'Text':
      return new StringParser(field);
    case 'RichText':
      return new MarkdownParser(field);
    case 'Integer':
      return new IntegerParser(field);
    case 'Number':
      return new NumberParser(field);
    case 'Boolean':
      return new BooleanParser(field);
    case 'Link':
      return new LinkParser(field);
    case 'Array':
      return new ArrayParser(field);
    case 'Object':
      return new ObjectParser(field);
    default:
      console.info(`No parser defined for ${field.type}`);
      return new Parser(field);
  }
};

export class Parser {
  constructor(protected field: ContentFields | Item) {}
  async parse(val?: any): Promise<any | undefined> {
    return val;
  }
}

export class BooleanParser extends Parser {
  async parse(val?: any): Promise<boolean> {
    if (val === undefined || val === null) return;
    return typeof val === 'boolean'
      ? val
      : Boolean(val.toString().match(/AVAILABLE|YES|true|1/i));
  }
}

export class StringParser extends Parser {
  async parse(val?: any): Promise<string | undefined> {
    if (val === undefined || val === null) return;
    return val.toString();
  }
}

export class ObjectParser extends Parser {
  async parse(val?: any): Promise<object | undefined> {
    if (val === undefined || val === null) return;
    return val;
  }
}

export class IntegerParser extends Parser {
  async parse(val?: any): Promise<number | undefined> {
    if (val === undefined || val === null) return;
    return isNaN(val) ? undefined : parseInt(val);
  }
}

export class NumberParser extends Parser {
  async parse(val?: any): Promise<number | undefined> {
    if (val === undefined || val === null) return;
    return isNaN(val) ? undefined : parseFloat(val);
  }
}

export class LinkParser extends Parser {
  async parse(val?: any): Promise<ImportEntity | undefined> {
    if (val === undefined || val === null) return;
    return {
      entity: val,
      sys: {
        type: this.field.type,
        linkType: this.field.linkType as LinkType,
        id: val.entityID,
      },
    };
  }
}

export class ArrayParser extends Parser {
  async parse(val?: any): Promise<any[] | undefined> {
    if (val === undefined || val === null) return;
    return Promise.all(
      val.map((v) => {
        const parser = getParser((this.field as ContentFields).items);
        return parser.parse(v);
      })
    );
  }
}

export class MarkdownParser extends Parser {
  async parse(val?: any): Promise<RichText | undefined> {
    if (val === undefined || val === null) return;
    return richTextFromMarkdown(val);
  }
}
