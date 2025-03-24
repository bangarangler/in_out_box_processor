"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var InOutBoxProcessorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InOutBoxProcessorService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const mongoose_2 = require("@nestjs/mongoose");
let InOutBoxProcessorService = InOutBoxProcessorService_1 = class InOutBoxProcessorService {
    constructor(config, connection) {
        this.config = config;
        this.connection = connection;
        this.logger = new common_1.Logger(InOutBoxProcessorService_1.name);
        this.maxRetries = 3;
        this.aggregationPipelines = {};
        this.inboxCollectionName = config.inboxCollectionName;
        this.targetCollectionName = config.targetCollectionName;
        this.failedCollectionName = 'failed';
        this.outboxCollectionName = 'outbox';
        this.aggregationPipelines = config.aggregationPipelines;
    }
    watchCollection(eventType) {
        return __awaiter(this, void 0, void 0, function* () {
            const aggregationPipeline = this.config.aggregationPipelines[eventType];
            if (!aggregationPipeline) {
                this.logger.error(`No aggregation pipeline found for event type: ${eventType}`);
                return;
            }
            this.logger.log(`Starting to watch collection for event type: ${eventType}`);
            const inboxCollection = this.connection.collection(this.inboxCollectionName);
            const changeStream = inboxCollection.watch([], { fullDocument: 'updateLookup' });
            changeStream.on('change', (change) => __awaiter(this, void 0, void 0, function* () {
                this.logger.log(`Change detected for event type: ${eventType}, change: ${JSON.stringify(change)}`);
                if (change.fullDocument) {
                    yield this.processDocument(aggregationPipeline, change.fullDocument);
                }
            }));
            changeStream.on('error', (error) => {
                this.logger.error(`Error in change stream for event type: ${eventType}, error: ${error}`);
            });
            changeStream.on('close', () => {
                this.logger.log(`Change stream closed for event type: ${eventType}`);
            });
        });
    }
    processDocument(aggregationPipeline, document, retries = 0) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const batch = yield cursor.toArray();
                for (const doc of batch) {
                    this.logger.log(`Processing document: ${JSON.stringify(doc)}`);
                    yield this.upsertDocument(doc);
                }
            }
            catch (error) {
                this.logger.error(`Error processing document: ${error.message}`);
                if (retries < this.maxRetries) {
                    const delay = Math.pow(2, retries) * 1000;
                    this.logger.log(`Retrying document processing in ${delay}ms...`);
                    yield new Promise(resolve => setTimeout(resolve, delay));
                    yield this.processDocument(aggregationPipeline, document, retries + 1);
                }
                else {
                    this.logger.error('Max retries reached. Moving document to failed collection.');
                    try {
                        yield failedCollection.insertOne(Object.assign(Object.assign({}, document), { error: error.message, message: 'Max retries reached. Permanently failed.' }));
                        yield inboxCollection.deleteOne({ _id: document._id });
                    }
                    catch (insertError) {
                        this.logger.error(`Error moving document to failed collection: ${insertError.message}`);
                    }
                }
            }
        });
    }
    upsertDocument(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetCollection = this.connection.collection(this.targetCollectionName);
            try {
                yield targetCollection.updateOne({ _id: doc._id }, { $set: doc }, { upsert: true });
                this.logger.log(`Document with _id: ${doc._id} upserted successfully.`);
            }
            catch (error) {
                this.logger.error(`Error upserting document: ${error.message}`);
                throw error;
            }
        });
    }
    addToOutbox(documents) {
        return __awaiter(this, void 0, void 0, function* () {
            const outboxCollection = this.connection.collection(this.outboxCollectionName);
            if (!Array.isArray(documents)) {
                documents = [documents];
            }
            yield outboxCollection.insertMany(documents.map((doc) => (Object.assign(Object.assign({}, doc), { createdAt: new Date() }))));
            this.logger.log(`Added ${documents.length} document(s) to the outbox.`);
        });
    }
};
InOutBoxProcessorService = InOutBoxProcessorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IN_OUT_BOX_PROCESSOR_CONFIG')),
    __param(1, (0, mongoose_2.InjectConnection)()),
    __metadata("design:paramtypes", [Object, mongoose_1.Connection])
], InOutBoxProcessorService);
exports.InOutBoxProcessorService = InOutBoxProcessorService;
//# sourceMappingURL=in_out_box_processor.service.js.map