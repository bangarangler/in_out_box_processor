import { Connection } from 'mongoose';
import { InOutBoxProcessorConfig } from './in_out_box_processor_config.interface';
export declare class InOutBoxProcessorService {
    private readonly config;
    private readonly connection;
    private readonly logger;
    private readonly maxRetries;
    private inboxCollectionName;
    private targetCollectionName;
    private failedCollectionName;
    private outboxCollectionName;
    private aggregationPipelines;
    constructor(config: InOutBoxProcessorConfig, connection: Connection);
    watchCollection(eventType: string): Promise<void>;
    private processDocument;
    private upsertDocument;
    addToOutbox(documents: any | any[]): Promise<void>;
}
