"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var InOutBoxProcessorModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InOutBoxProcessorModule = void 0;
const common_1 = require("@nestjs/common");
const in_out_box_processor_service_1 = require("./in_out_box_processor.service");
let InOutBoxProcessorModule = InOutBoxProcessorModule_1 = class InOutBoxProcessorModule {
    static forRoot(config) {
        return {
            module: InOutBoxProcessorModule_1,
            providers: [
                {
                    provide: 'IN_OUT_BOX_PROCESSOR_CONFIG',
                    useValue: config
                },
                in_out_box_processor_service_1.InOutBoxProcessorService
            ],
            exports: [in_out_box_processor_service_1.InOutBoxProcessorService]
        };
    }
};
InOutBoxProcessorModule = InOutBoxProcessorModule_1 = __decorate([
    (0, common_1.Module)({})
], InOutBoxProcessorModule);
exports.InOutBoxProcessorModule = InOutBoxProcessorModule;
//# sourceMappingURL=in_out_box_processor.module.js.map