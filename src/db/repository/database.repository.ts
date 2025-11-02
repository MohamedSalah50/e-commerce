import { Injectable } from '@nestjs/common';
import {
  CreateOptions,
  DeleteResult,
  FlattenMaps,
  HydratedDocument,
  Model,
  MongooseUpdateQueryOptions,
  PopulateOptions,
  ProjectionType,
  QueryOptions,
  RootFilterQuery,
  Types,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongoose';

export type Lean<T> = FlattenMaps<T>;

@Injectable()
export abstract class DatabaseRepository<
  TRawDocument,
  TDocument = HydratedDocument<TRawDocument>,
> {
  constructor(protected model: Model<TDocument>) {}

  async create({
    data,
    options,
  }: {
    data: Partial<TRawDocument>[];
    options?: CreateOptions | undefined;
  }): Promise<TDocument[]> {
    return (await this.model.create(data, options)) || [];
  }

  async findOne({
    filter,
    select,
    options,
  }: {
    filter?: RootFilterQuery<TRawDocument>;
    select?: ProjectionType<TRawDocument> | null;
    options?: QueryOptions<TDocument> | null;
  }): Promise<Lean<TDocument> | TDocument | null> {
    const doc = this.model.findOne(filter).select(select || '');
    if (options?.populate) doc.populate(options.populate as PopulateOptions[]);
    if (options?.lean) doc.lean(options.lean);
    return await doc.exec();
  }

  async findById({
    id,
    options,
    select,
  }: {
    id?: Types.ObjectId;
    select?: string | null;
    options?: QueryOptions<TDocument> | null;
    populate?: string | PopulateOptions | (string | PopulateOptions)[];
  }): Promise<TDocument | Lean<TDocument> | null> {
    return await this.model.findById(id, select || null, options || undefined);

    // if (populate) {
    //   query = query.populate(populate);
    // }

    // return await query.exec();
  }

  async updateOne({
    filter,
    update,
    options,
  }: {
    filter: RootFilterQuery<TRawDocument>;
    update: UpdateQuery<TDocument>;
    options?: MongooseUpdateQueryOptions<TDocument> | null;
  }): Promise<UpdateWriteOpResult> {
    return await this.model.updateOne(
      filter,
      {
        ...update,
        $inc: {
          __v: 1,
        },
      },
      options,
    );
  }

  async deleteOne({
    filter,
  }: {
    filter: RootFilterQuery<TRawDocument>;
  }): Promise<DeleteResult> {
    return await this.model.deleteOne(filter);
  }
}
