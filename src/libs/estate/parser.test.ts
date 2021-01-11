import {
  getParser,
  StringParser,
  MarkdownParser,
  IntegerParser,
  NumberParser,
  BooleanParser,
  LinkParser,
  ArrayParser,
  ObjectParser,
  Parser,
} from './parser';

describe('parser.ts', () => {
  it('should get the correct parser', () => {
    expect(getParser({ type: 'Symbol' })).toBeInstanceOf(StringParser);
    expect(getParser({ type: 'RichText' })).toBeInstanceOf(MarkdownParser);
    expect(getParser({ type: 'Integer' })).toBeInstanceOf(IntegerParser);
    expect(getParser({ type: 'Number' })).toBeInstanceOf(NumberParser);
    expect(getParser({ type: 'Boolean' })).toBeInstanceOf(BooleanParser);
    expect(getParser({ type: 'Link' })).toBeInstanceOf(LinkParser);
    expect(getParser({ type: 'Array' })).toBeInstanceOf(ArrayParser);
    expect(getParser({ type: 'Object' })).toBeInstanceOf(ObjectParser);
    expect(getParser({ type: 'Foo' })).toBeInstanceOf(Parser);
  });

  it('should parse Boolean', async () => {
    const parser = getParser({ type: 'Boolean' });
    expect(await parser.parse('yes')).toBe(true);
    expect(await parser.parse('no')).toBe(false);
    expect(await parser.parse(true)).toBe(true);
    expect(await parser.parse(false)).toBe(false);
  });

  it('should parse Symbol', async () => {
    const parser = getParser({ type: 'Symbol' });
    expect(await parser.parse('yes')).toBe('yes');
    expect(await parser.parse(true)).toBe('true');
  });

  it('should parse Object', async () => {
    const parser = getParser({ type: 'Object' });
    expect(await parser.parse({ foo: 'bar' })).toEqual({
      foo: 'bar',
    });
  });

  it('should parse Integer', async () => {
    const parser = getParser({ type: 'Integer' });
    expect(await parser.parse(1)).toBe(1);
    expect(await parser.parse(1.1)).toBe(1);
  });

  it('should parse Number', async () => {
    const parser = getParser({ type: 'Number' });
    expect(await parser.parse(1)).toBe(1);
    expect(await parser.parse(1.1)).toBe(1.1);
  });

  it('should parse Link', async () => {
    const parser = getParser({ type: 'Link', linkType: 'Entry' });
    const entity = { entityID: '1' };
    expect(await parser.parse(entity)).toEqual({
      entity: {
        entityID: '1',
      },
      sys: {
        id: '1',
        linkType: 'Entry',
        type: 'Link',
      },
    });
  });

  it('should parse Array recursively', async () => {
    const parser = getParser({
      type: 'Array',
      linkType: 'Asset',
      items: { type: 'Integer' },
    });
    const entity = [1.0, 4.5];
    expect(await parser.parse(entity)).toEqual([1, 4]);
  });

  it('should parse RichText', async () => {
    const parser = getParser({
      type: 'RichText',
    });
    expect(await parser.parse('# Foo')).toEqual({
      content: [
        {
          content: [{ data: {}, marks: [], nodeType: 'text', value: 'Foo' }],
          data: {},
          nodeType: 'heading-1',
        },
      ],
      data: {},
      nodeType: 'document',
    });
  });
});
