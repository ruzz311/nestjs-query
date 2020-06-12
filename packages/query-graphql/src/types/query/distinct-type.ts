import { Class, DistinctField } from '@nestjs-query/core';
import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsIn } from 'class-validator';
import { getMetadataStorage } from '../../metadata';
import { UnregisteredObjectType } from '../type.errors';

export function DistinctType<T>(TClass: Class<T>): Class<DistinctField<T>> {
  const metadataStorage = getMetadataStorage();
  const existing = metadataStorage.getDistinctType<T>(TClass);
  if (existing) {
    return existing;
  }
  const objMetadata = metadataStorage.getGraphqlObjectMetadata(TClass);
  if (!objMetadata) {
    throw new UnregisteredObjectType(TClass, 'Unable to make DistinctType.');
  }
  const fields = metadataStorage.getFilterableObjectFields(TClass);
  if (!fields) {
    throw new Error(
      `No fields found to create DistinctType for ${TClass.name}. Ensure fields are annotated with @FilterableField`,
    );
  }
  const prefix = objMetadata.name;
  const fieldNames = fields.map((f) => f.propertyName);
  const fieldNameMap = fieldNames.reduce((acc, f) => ({ ...acc, [f]: f }), {});
  registerEnumType(fieldNameMap, { name: `${prefix}DistinctFields` });
  @InputType(`${prefix}Distinct`)
  class Distinct {
    @Field(() => fieldNameMap)
    @IsIn(fieldNames)
    field!: keyof T;
  }
  metadataStorage.addDistinctType(TClass, Distinct);
  return Distinct;
}
