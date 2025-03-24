export interface InOutBoxProcessorConfig {
    inboxCollectionName: string;
    targetCollectionName: string;
    aggregationPipelines: {
        [eventType: string]: any[];
    };
}
