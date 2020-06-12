// eslint-disable-next-line max-classes-per-file
import { ObjectType, InputType, Query, Resolver, Args, Int } from '@nestjs/graphql';
import { FilterableField, DistinctType } from '../../../src';
import { expectSDL, distinctInputTypeSDL } from '../../__fixtures__';

describe('DistinctType', (): void => {
  @ObjectType({ isAbstract: true })
  class BaseType {
    @FilterableField()
    id!: number;
  }

  @ObjectType()
  class TestDistinct extends BaseType {
    @FilterableField()
    stringField!: string;

    @FilterableField()
    numberField!: number;

    @FilterableField()
    boolField!: boolean;
  }

  it('should create the correct graphql schema for distinct type', () => {
    @InputType()
    class Distinct extends DistinctType(TestDistinct) {}

    @Resolver()
    class DistinctTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: Distinct): number {
        return 1;
      }
    }
    return expectSDL([DistinctTypeSpec], distinctInputTypeSDL);
  });

  it('should throw an error if the class is not annotated with @ObjectType', () => {
    class BadTestDistinct {}
    expect(() => DistinctType(BadTestDistinct)).toThrow(
      'Unable to make DistinctType. Ensure BadTestDistinct is annotated with @nestjs/graphql @ObjectType',
    );
  });
  it('should throw an error if no fields are found', () => {
    @ObjectType()
    class BadTestDistinct {}
    expect(() => DistinctType(BadTestDistinct)).toThrow(
      'No fields found to create DistinctType for BadTestDistinct. Ensure fields are annotated with @FilterableField',
    );
  });
});
