import {
  applyFilter,
  Filter,
  Query,
  QueryFieldMap,
  SortDirection,
  SortField,
  transformFilter,
  transformQuery,
  transformSort,
  DistinctField,
} from '../src';
import { transformDistinct } from '../src/helpers/query.helpers';

class TestDTO {
  first!: string;

  last!: string;
}

class TestEntity {
  firstName!: string;

  lastName!: string;
}

const fieldMap: QueryFieldMap<TestDTO, TestEntity> = {
  first: 'firstName',
  last: 'lastName',
};

describe('transformSort', () => {
  it('should return undefined if sorting is undefined', () => {
    expect(transformSort(undefined, fieldMap)).toBeUndefined();
  });

  it('should transform the fields to the correct names', () => {
    const dtoSort: SortField<TestDTO>[] = [
      { field: 'first', direction: SortDirection.DESC },
      { field: 'last', direction: SortDirection.ASC },
    ];
    const entitySort: SortField<TestEntity>[] = [
      { field: 'firstName', direction: SortDirection.DESC },
      { field: 'lastName', direction: SortDirection.ASC },
    ];
    expect(transformSort(dtoSort, fieldMap)).toEqual(entitySort);
  });

  it('should throw an error if the field name is not found', () => {
    const dtoSort: SortField<TestDTO>[] = [
      { field: 'first', direction: SortDirection.DESC },
      // @ts-ignore
      { field: 'lasts', direction: SortDirection.ASC },
    ];
    expect(() => transformSort(dtoSort, fieldMap)).toThrow(
      "No corresponding field found for 'lasts' when transforming SortField",
    );
  });
});

describe('transformDistinct', () => {
  it('should return undefined if distinctFields are undefined', () => {
    expect(transformDistinct(undefined, fieldMap)).toBeUndefined();
  });

  it('should transform the fields to the correct names', () => {
    const dtoSort: DistinctField<TestDTO>[] = [{ field: 'first' }, { field: 'last' }];
    const entitySort: DistinctField<TestEntity>[] = [{ field: 'firstName' }, { field: 'lastName' }];
    expect(transformDistinct(dtoSort, fieldMap)).toEqual(entitySort);
  });

  it('should throw an error if the field name is not found', () => {
    const dtoSort: DistinctField<TestDTO>[] = [
      { field: 'first' },
      // @ts-ignore
      { field: 'lasts' },
    ];
    expect(() => transformDistinct(dtoSort, fieldMap)).toThrow(
      "No corresponding field found for 'lasts' when transforming DistinctField",
    );
  });
});

describe('transformFilter', () => {
  it('should return undefined if filter is undefined', () => {
    expect(transformFilter(undefined, fieldMap)).toBeUndefined();
  });

  it('should transform the fields to the correct names', () => {
    const dtoFilter: Filter<TestDTO> = {
      first: { eq: 'foo' },
      last: { neq: 'bar' },
    };
    const entityFilter: Filter<TestEntity> = {
      firstName: { eq: 'foo' },
      lastName: { neq: 'bar' },
    };
    expect(transformFilter(dtoFilter, fieldMap)).toEqual(entityFilter);
  });

  it('should transform AND groupings to the correct names', () => {
    const dtoFilter: Filter<TestDTO> = {
      and: [{ first: { eq: 'foo' } }, { last: { neq: 'bar' } }],
    };
    const entityFilter: Filter<TestEntity> = {
      and: [{ firstName: { eq: 'foo' } }, { lastName: { neq: 'bar' } }],
    };
    expect(transformFilter(dtoFilter, fieldMap)).toEqual(entityFilter);
  });

  it('should not transform AND groupings if the array is undefined', () => {
    const dtoFilter: Filter<TestDTO> = {
      and: undefined,
      first: { eq: 'foo' },
    };
    const entityFilter: Filter<TestEntity> = {
      and: undefined,
      firstName: { eq: 'foo' },
    };
    expect(transformFilter(dtoFilter, fieldMap)).toEqual(entityFilter);
  });

  it('should transform OR groupings to the correct names', () => {
    const dtoFilter: Filter<TestDTO> = {
      or: [{ first: { eq: 'foo' } }, { last: { neq: 'bar' } }],
    };
    const entityFilter: Filter<TestEntity> = {
      or: [{ firstName: { eq: 'foo' } }, { lastName: { neq: 'bar' } }],
    };
    expect(transformFilter(dtoFilter, fieldMap)).toEqual(entityFilter);
  });
  it('should transform nested groupings to the correct names', () => {
    const dtoFilter: Filter<TestDTO> = {
      or: [
        { and: [{ first: { eq: 'foo' } }, { last: { neq: 'bar' } }] },
        { or: [{ first: { eq: 'foo' } }, { last: { neq: 'bar' } }] },
      ],
    };
    const entityFilter: Filter<TestEntity> = {
      or: [
        { and: [{ firstName: { eq: 'foo' } }, { lastName: { neq: 'bar' } }] },
        { or: [{ firstName: { eq: 'foo' } }, { lastName: { neq: 'bar' } }] },
      ],
    };
    expect(transformFilter(dtoFilter, fieldMap)).toEqual(entityFilter);
  });

  it('should throw an error if the field name is not found', () => {
    const dtoFilter: Filter<TestDTO> = {
      first: { eq: 'foo' },
      // @ts-ignore
      lasts: { neq: 'bar' },
    };
    expect(() => transformFilter(dtoFilter, fieldMap)).toThrow(
      "No corresponding field found for 'lasts' when transforming Filter",
    );
  });
});

describe('transformQuery', () => {
  it('should transform a Query', () => {
    const dtoQuery: Query<TestDTO> = {
      filter: {
        first: { eq: 'foo' },
        last: { neq: 'bar' },
      },
      paging: { offset: 10, limit: 10 },
      sorting: [
        { field: 'first', direction: SortDirection.DESC },
        { field: 'last', direction: SortDirection.ASC },
      ],
    };
    const entityQuery: Query<TestEntity> = {
      filter: {
        firstName: { eq: 'foo' },
        lastName: { neq: 'bar' },
      },
      paging: { offset: 10, limit: 10 },
      sorting: [
        { field: 'firstName', direction: SortDirection.DESC },
        { field: 'lastName', direction: SortDirection.ASC },
      ],
    };
    expect(transformQuery(dtoQuery, fieldMap)).toEqual(entityQuery);
  });
});

describe('applyFilter', () => {
  it('should handle eq comparisons', () => {
    const filter: Filter<TestDTO> = {
      first: { eq: 'foo' },
    };
    expect(applyFilter({ first: 'foo', last: 'bar' }, filter)).toBe(true);
    expect(applyFilter({ first: 'bar', last: 'foo' }, filter)).toBe(false);
  });

  it('should handle neq comparisons', () => {
    const filter: Filter<TestDTO> = {
      first: { neq: 'foo' },
    };
    expect(applyFilter({ first: 'bar', last: 'foo' }, filter)).toBe(true);
    expect(applyFilter({ first: 'foo', last: 'bar' }, filter)).toBe(false);
  });

  it('should handle gt comparisons', () => {
    const filter: Filter<TestDTO> = {
      first: { gt: 'b' },
    };
    expect(applyFilter({ first: 'c', last: 'foo' }, filter)).toBe(true);
    expect(applyFilter({ first: 'b', last: 'foo' }, filter)).toBe(false);
    expect(applyFilter({ first: 'a', last: 'bar' }, filter)).toBe(false);
  });

  it('should handle gte comparisons', () => {
    const filter: Filter<TestDTO> = {
      first: { gte: 'b' },
    };
    expect(applyFilter({ first: 'c', last: 'foo' }, filter)).toBe(true);
    expect(applyFilter({ first: 'b', last: 'foo' }, filter)).toBe(true);
    expect(applyFilter({ first: 'a', last: 'bar' }, filter)).toBe(false);
  });

  it('should handle lt comparisons', () => {
    const filter: Filter<TestDTO> = {
      first: { lt: 'b' },
    };
    expect(applyFilter({ first: 'a', last: 'foo' }, filter)).toBe(true);
    expect(applyFilter({ first: 'b', last: 'bar' }, filter)).toBe(false);
    expect(applyFilter({ first: 'c', last: 'bar' }, filter)).toBe(false);
  });

  it('should handle lte comparisons', () => {
    const filter: Filter<TestDTO> = {
      first: { lte: 'b' },
    };
    expect(applyFilter({ first: 'a', last: 'foo' }, filter)).toBe(true);
    expect(applyFilter({ first: 'b', last: 'bar' }, filter)).toBe(true);
    expect(applyFilter({ first: 'c', last: 'bar' }, filter)).toBe(false);
  });

  it('should handle like comparisons', () => {
    const filter: Filter<TestDTO> = {
      first: { like: '%oo' },
    };
    expect(applyFilter({ first: 'Foo', last: 'foo' }, filter)).toBe(true);
    expect(applyFilter({ first: 'FOO', last: 'bar' }, filter)).toBe(false);
    expect(applyFilter({ first: 'Foo Bar', last: 'foo' }, filter)).toBe(false);
    expect(applyFilter({ first: 'o bar', last: 'bar' }, filter)).toBe(false);
  });

  it('should handle notLike comparisons', () => {
    const filter: Filter<TestDTO> = {
      first: { notLike: '%oo' },
    };
    expect(applyFilter({ first: 'Foo', last: 'foo' }, filter)).toBe(false);
    expect(applyFilter({ first: 'FOO', last: 'bar' }, filter)).toBe(true);
    expect(applyFilter({ first: 'Foo Bar', last: 'foo' }, filter)).toBe(true);
    expect(applyFilter({ first: 'o bar', last: 'bar' }, filter)).toBe(true);
  });

  it('should handle iLike comparisons', () => {
    const filter: Filter<TestDTO> = {
      first: { iLike: '%oo' },
    };
    expect(applyFilter({ first: 'Foo', last: 'foo' }, filter)).toBe(true);
    expect(applyFilter({ first: 'FOO', last: 'bar' }, filter)).toBe(true);
    expect(applyFilter({ first: 'Foo Bar', last: 'foo' }, filter)).toBe(false);
    expect(applyFilter({ first: 'o bar', last: 'bar' }, filter)).toBe(false);
  });

  it('should handle notILike comparisons', () => {
    const filter: Filter<TestDTO> = {
      first: { notILike: '%oo' },
    };
    expect(applyFilter({ first: 'Foo', last: 'foo' }, filter)).toBe(false);
    expect(applyFilter({ first: 'FOO', last: 'bar' }, filter)).toBe(false);
    expect(applyFilter({ first: 'Foo Bar', last: 'foo' }, filter)).toBe(true);
    expect(applyFilter({ first: 'o bar', last: 'bar' }, filter)).toBe(true);
  });

  it('should handle in comparisons', () => {
    const filter: Filter<TestDTO> = {
      first: { in: ['Foo', 'Bar', 'Baz'] },
    };
    expect(applyFilter({ first: 'Foo', last: 'foo' }, filter)).toBe(true);
    expect(applyFilter({ first: 'Bar', last: 'bar' }, filter)).toBe(true);
    expect(applyFilter({ first: 'Baz', last: 'foo' }, filter)).toBe(true);
    expect(applyFilter({ first: 'Boo', last: 'bar' }, filter)).toBe(false);
  });

  it('should handle notIn comparisons', () => {
    const filter: Filter<TestDTO> = {
      first: { notIn: ['Foo', 'Bar', 'Baz'] },
    };
    expect(applyFilter({ first: 'Foo', last: 'foo' }, filter)).toBe(false);
    expect(applyFilter({ first: 'Bar', last: 'bar' }, filter)).toBe(false);
    expect(applyFilter({ first: 'Baz', last: 'foo' }, filter)).toBe(false);
    expect(applyFilter({ first: 'Boo', last: 'bar' }, filter)).toBe(true);
  });

  it('should handle between comparisons', () => {
    const filter: Filter<TestDTO> = {
      first: { between: { lower: 'b', upper: 'd' } },
    };
    expect(applyFilter({ first: 'a', last: 'foo' }, filter)).toBe(false);
    expect(applyFilter({ first: 'b', last: 'bar' }, filter)).toBe(true);
    expect(applyFilter({ first: 'c', last: 'foo' }, filter)).toBe(true);
    expect(applyFilter({ first: 'd', last: 'bar' }, filter)).toBe(true);
    expect(applyFilter({ first: 'e', last: 'bar' }, filter)).toBe(false);
  });

  it('should handle notBetween comparisons', () => {
    const filter: Filter<TestDTO> = {
      first: { notBetween: { lower: 'b', upper: 'd' } },
    };
    expect(applyFilter({ first: 'a', last: 'foo' }, filter)).toBe(true);
    expect(applyFilter({ first: 'b', last: 'bar' }, filter)).toBe(false);
    expect(applyFilter({ first: 'c', last: 'foo' }, filter)).toBe(false);
    expect(applyFilter({ first: 'd', last: 'bar' }, filter)).toBe(false);
    expect(applyFilter({ first: 'e', last: 'bar' }, filter)).toBe(true);
  });

  it('should throw an error for an unknown operator', () => {
    const filter: Filter<TestDTO> = {
      // @ts-ignore
      first: { foo: 'bar' },
    };
    expect(() => applyFilter({ first: 'baz', last: 'kaz' }, filter)).toThrow('unknown operator "foo"');
  });

  it('should handle and grouping', () => {
    const filter: Filter<TestDTO> = {
      and: [{ first: { eq: 'foo' } }, { last: { like: '%bar' } }],
    };
    expect(applyFilter({ first: 'foo', last: 'bar' }, filter)).toBe(true);
    expect(applyFilter({ first: 'foo', last: 'foobar' }, filter)).toBe(true);
    expect(applyFilter({ first: 'oo', last: 'bar' }, filter)).toBe(false);
    expect(applyFilter({ first: 'foo', last: 'baz' }, filter)).toBe(false);
  });

  it('should handle or grouping', () => {
    const filter: Filter<TestDTO> = {
      or: [{ first: { eq: 'foo' } }, { last: { like: '%bar' } }],
    };
    expect(applyFilter({ first: 'foo', last: 'bar' }, filter)).toBe(true);
    expect(applyFilter({ first: 'foo', last: 'foobar' }, filter)).toBe(true);
    expect(applyFilter({ first: 'oo', last: 'bar' }, filter)).toBe(true);
    expect(applyFilter({ first: 'foo', last: 'baz' }, filter)).toBe(true);
    expect(applyFilter({ first: 'fo', last: 'ba' }, filter)).toBe(false);
  });
});
