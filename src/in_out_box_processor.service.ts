import { Injectable, Logger, Inject } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ChangeStreamDocument } from 'mongodb';
import { InOutBoxProcessorConfig } from './in_out_box_processor_config.interface';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class InOutBoxProcessorService {
  private readonly logger = new Logger(InOutBoxProcessorService.name);
  private readonly maxRetries = 3;
  private inboxCollectionName: string;
  private targetCollectionName: string;
  private failedCollectionName: string;
  private outboxCollectionName: string;
  private aggregationPipelines: { [eventType: string]: any[] } = {};

  constructor(
    @Inject('IN_OUT_BOX_PROCESSOR_CONFIG') private readonly config: InOutBoxProcessorConfig,
    @InjectConnection() private readonly connection: Connection
  ) {
    this.inboxCollectionName = config.inboxCollectionName;
    this.targetCollectionName = config.targetCollectionName;
    this.failedCollectionName = 'failed';
    this.outboxCollectionName = 'outbox';
    this.aggregationPipelines = config.aggregationPipelines;
  }

  async watchCollection(eventType: string) {
    const aggregationPipeline = this.config.aggregationPipelines[eventType];
    if (!aggregationPipeline) {
      this.logger.error(`No aggregation pipeline found for event type: ${eventType}`);
      return;
    }

    this.logger.log(`Starting to watch collection for event type: ${eventType}`);
    const inboxCollection = this.connection.collection(this.inboxCollectionName);
    const changeStream = inboxCollection.watch([], { fullDocument: 'updateLookup' });

    changeStream.on('change', async (change: ChangeStreamDocument<any> & { fullDocument?: any }) => {
      this.logger.log(`Change detected for event type: ${eventType}, change: ${JSON.stringify(change)}`);
      if (change.fullDocument) {
        await this.processDocument(aggregationPipeline, change.fullDocument);
      }
    });

    changeStream.on('error', (error) => {
      this.logger.error(`Error in change stream for event type: ${eventType}, error: ${error}`);
    });

    changeStream.on('close', () => {
      this.logger.log(`Change stream closed for event type: ${eventType}`);
    });
  }

  private async processDocument(aggregationPipeline: any[], document: any, retries = 0) {
    this.logger.log('Processing document...');
    const inboxCollection = this.connection.collection(this.inboxCollectionName);
    const targetCollection = this.connection.collection(this.targetCollectionName);
    const failedCollection = this.connection.collection(this.failedCollectionName);

    try {
      // Check for trigger_error field in the document
      if (document.trigger_error) {
        throw new Error('Simulated error for testing retries');
      }

      const cursor = inboxCollection.aggregate([...aggregationPipeline, { $match: { _id: document._id } }]);
      const batch = await cursor.toArray();

      for (const doc of batch) {
        this.logger.log(`Processing document: ${JSON.stringify(doc)}`);
        await this.upsertDocument(doc);
      }
    } catch (error: any) {
      this.logger.error(`Error processing document: ${error.message}`);
      if (retries < this.maxRetries) {
        const delay = Math.pow(2, retries) * 1000;
        this.logger.log(`Retrying document processing in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        await this.processDocument(aggregationPipeline, document, retries + 1);
      } else {
        this.logger.error('Max retries reached. Moving document to failed collection.');
        try {
          await failedCollection.insertOne({ ...document, error: error.message, message: 'Max retries reached. Permanently failed.' });
          await inboxCollection.deleteOne({ _id: document._id });
        } catch (insertError: any) {
          this.logger.error(`Error moving document to failed collection: ${insertError.message}`);
        }
      }
    }
  }

  private async upsertDocument(doc: any) {
    const targetCollection = this.connection.collection(this.targetCollectionName);
    try {
      await targetCollection.updateOne(
        { _id: doc._id },
        { $set: doc },
        { upsert: true }
      );
      this.logger.log(`Document with _id: ${doc._id} upserted successfully.`);
    } catch (error: any) {
      this.logger.error(`Error upserting document: ${error.message}`);
      throw error;
    }
  }
  
  async addToOutbox(documents: any | any[]): Promise<void> {
    const outboxCollection = this.connection.collection(this.outboxCollectionName);
    if (!Array.isArray(documents)) {
      documents = [documents];
    }
    await outboxCollection.insertMany(documents.map((doc: any) => ({ ...doc, createdAt: new Date() })));
    this.logger.log(`Added ${documents.length} document(s) to the outbox.`);
  }
}
