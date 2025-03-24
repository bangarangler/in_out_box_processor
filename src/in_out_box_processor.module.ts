import { Module, DynamicModule } from '@nestjs/common';
import { InOutBoxProcessorService } from './in_out_box_processor.service';
import { InOutBoxProcessorConfig } from './in_out_box_processor_config.interface';

@Module({})
export class InOutBoxProcessorModule {
  static forRoot(config: InOutBoxProcessorConfig): DynamicModule {
    return {
      module: InOutBoxProcessorModule,
      providers: [
        {
          provide: 'IN_OUT_BOX_PROCESSOR_CONFIG',
          useValue: config
        },
        InOutBoxProcessorService
      ],
      exports: [InOutBoxProcessorService]
    };
  }
}
