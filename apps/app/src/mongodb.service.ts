import { MongoClient, Db, Collection, ObjectId } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "myapp";

interface IDocument {
  _id?: ObjectId;
  [key: string]: any;
}

class MongoDBService {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(MONGO_URI);
      await this.client.connect();
      this.db = this.client.db(DB_NAME);
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        console.log("Disconnected from MongoDB");
      }
    } catch (error) {
      console.error("Failed to disconnect from MongoDB:", error);
      throw error;
    }
  }

  // CREATE
  async create(
    collectionName: string,
    document: IDocument
  ): Promise<ObjectId> {
    if (!this.db) throw new Error("Database not connected");
    const collection: Collection<IDocument> = this.db.collection(
      collectionName
    );
    const result = await collection.insertOne(document);
    console.log(`Document inserted with ID: ${result.insertedId}`);
    return result.insertedId;
  }

  async createMany(
    collectionName: string,
    documents: IDocument[]
  ): Promise<ObjectId[]> {
    if (!this.db) throw new Error("Database not connected");
    const collection: Collection<IDocument> = this.db.collection(
      collectionName
    );
    const result = await collection.insertMany(documents);
    console.log(`${documents.length} documents inserted`);
    return Object.values(result.insertedIds);
  }

  // READ
  async findById(collectionName: string, id: string): Promise<IDocument | null> {
    if (!this.db) throw new Error("Database not connected");
    const collection: Collection<IDocument> = this.db.collection(
      collectionName
    );
    const document = await collection.findOne({ _id: new ObjectId(id) });
    return document || null;
  }

  async findOne(
    collectionName: string,
    filter: Record<string, any>
  ): Promise<IDocument | null> {
    if (!this.db) throw new Error("Database not connected");
    const collection: Collection<IDocument> = this.db.collection(
      collectionName
    );
    const document = await collection.findOne(filter);
    return document || null;
  }

  async findAll(
    collectionName: string,
    filter: Record<string, any> = {}
  ): Promise<IDocument[]> {
    if (!this.db) throw new Error("Database not connected");
    const collection: Collection<IDocument> = this.db.collection(
      collectionName
    );
    const documents = await collection.find(filter).toArray();
    return documents;
  }

  // UPDATE
  async updateById(
    collectionName: string,
    id: string,
    updateData: Record<string, any>
  ): Promise<boolean> {
    if (!this.db) throw new Error("Database not connected");
    const collection: Collection<IDocument> = this.db.collection(
      collectionName
    );
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    console.log(`${result.modifiedCount} document(s) updated`);
    return result.modifiedCount > 0;
  }

  async updateMany(
    collectionName: string,
    filter: Record<string, any>,
    updateData: Record<string, any>
  ): Promise<number> {
    if (!this.db) throw new Error("Database not connected");
    const collection: Collection<IDocument> = this.db.collection(
      collectionName
    );
    const result = await collection.updateMany(filter, { $set: updateData });
    console.log(`${result.modifiedCount} document(s) updated`);
    return result.modifiedCount;
  }

  // DELETE
  async deleteById(collectionName: string, id: string): Promise<boolean> {
    if (!this.db) throw new Error("Database not connected");
    const collection: Collection<IDocument> = this.db.collection(
      collectionName
    );
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    console.log(`${result.deletedCount} document(s) deleted`);
    return result.deletedCount > 0;
  }

  async deleteMany(
    collectionName: string,
    filter: Record<string, any>
  ): Promise<number> {
    if (!this.db) throw new Error("Database not connected");
    const collection: Collection<IDocument> = this.db.collection(
      collectionName
    );
    const result = await collection.deleteMany(filter);
    console.log(`${result.deletedCount} document(s) deleted`);
    return result.deletedCount;
  }
}

export const mongoService = new MongoDBService();
