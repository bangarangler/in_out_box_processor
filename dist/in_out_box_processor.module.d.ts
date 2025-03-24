import { DynamicModule } from '@nestjs/common';
import { InOutBoxProcessorConfig } from './in_out_box_processor_config.interface';
export declare class InOutBoxProcessorModule {
    static forRoot(config: InOutBoxProcessorConfig): DynamicModule;
}
