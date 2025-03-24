   export interface InOutBoxProcessorConfig {
     inboxCollectionName: string;
     targetCollectionName: string;
     // failedCollectionName: string;
     aggregationPipelines: { [eventType: string]: any[] };
   }
