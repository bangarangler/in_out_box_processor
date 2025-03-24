# InOutBoxProcessor

InOutBoxProcessor is a NestJS service that processes documents from an inbox collection, applies aggregation pipelines, and upserts the results into a target collection. It also handles retries and moves failed documents to a failed collection. Additionally, it allows adding documents to an outbox collection.

## Installation

```bash
npm install in-out-box-processor
```

## Usage

### Importing the Module

First, import the `InOutBoxProcessorModule` into your NestJS application and configure it with the necessary options.

```typescript
import { Module } from '@nestjs/common';
import { InOutBoxProcessorModule } from 'in-out-box-processor';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

   @Module({
     imports: [
       ConfigModule.forRoot({
         envFilePath: path.resolve(process.cwd(), `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`), isGlobal: true,
       }),
       MongooseModule.forRoot(process.env.MONGO_URI),
       InOutBoxProcessorModule.forRoot({
         inboxCollectionName: 'inbox',
         targetCollectionName: 'target',
         // Can be abstracted out into seperate file
         aggregationPipelines: {
           'authenticatedAvailableShiftOpeningCreated': [
             {
               $project: {
                 _id: 1,
                 event: "$event.string",
                 shift_id: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.shift_id.int",
                 shift_type: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.shift_type.string",
                 facility_team_id: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility_team_id.int",
                 is_from_on_shift: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.is_from_on_shift.boolean",
                 start_time: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.start_time.long",
                 end_time: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.end_time.long",
                 tz_converted_start_time: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.tz_converted_start_time.long",
                 tz_converted_end_time: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.tz_converted_end_time.long",
                 time_zone: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.time_zone.string",
                 specialty_name: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.specialty_name.string",
                 premium_rate: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.premium_rate.boolean",
                 covid: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.covid.boolean",
                 shift_kind: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.shift_kind.string",
                 opening_count: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.opening_count.int",
                 filled_count: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.filled_count.int",
                 latitude: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.latitude.float",
                 longitude: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.longitude.float",
                 facility_id: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility.AvailableShiftFacilityPropertiesRecord.facility_id.int",
                 facility_name: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility.AvailableShiftFacilityPropertiesRecord.facility_name.string",
                 facility_phone: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility.AvailableShiftFacilityPropertiesRecord.facility_phone.string",
                 facility_uses_digital_invoice: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility.AvailableShiftFacilityPropertiesRecord.facility_uses_digital_invoice.boolean",
                 facility_work_record_primary: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility.AvailableShiftFacilityPropertiesRecord.facility_work_record_primary.string",
                 facility_work_record_backup: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility.AvailableShiftFacilityPropertiesRecord.facility_work_record_backup.string",
                 facility_address_id: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility_address.AvailableShiftFacilityAddressPropertiesRecord.facility_address_id.int",
                 facility_address_one: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility_address.AvailableShiftFacilityAddressPropertiesRecord.facility_address_one.string",
                 facility_address_city: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility_address.AvailableShiftFacilityAddressPropertiesRecord.facility_address_city.string",
                 facility_address_zip: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility_address.AvailableShiftFacilityAddressPropertiesRecord.facility_address_zip.string",
                 facility_address_state_id: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility_address.AvailableShiftFacilityAddressPropertiesRecord.facility_address_state_record.AvailableShiftFacilityStatePropertiesRecord.id.int",
                 facility_address_state_name: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility_address.AvailableShiftFacilityAddressPropertiesRecord.facility_address_state_record.AvailableShiftFacilityStatePropertiesRecord.name.string",
                 facility_address_state_abbreviation: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility_address.AvailableShiftFacilityAddressPropertiesRecord.facility_address_state_record.AvailableShiftFacilityStatePropertiesRecord.abbreviation.string",
                 facility_address_geo_latitude: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility_address.AvailableShiftFacilityAddressGeoLocationPropertiesRecord.latitude.float",
                 facility_address_geo_longitude: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility_address.AvailableShiftFacilityAddressGeoLocationPropertiesRecord.longitude.float",
                 facility_type_id: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility_type.AvailableShiftFacilityTypeProperties.facility_type_id.int",
                 facility_type_name: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility_type.AvailableShiftFacilityTypeProperties.facility_type_name.string",
                 facility_type_color: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.facility_type.AvailableShiftFacilityTypeProperties.facility_type_color.string",
                 skill_type_id: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.skill_type.AvailableShiftSkillTypeProperties.skill_type_id.int",
                 skill_type_name: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.skill_type.AvailableShiftSkillTypeProperties.skill_type_name.string",
                 skill_type_color: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.skill_type.AvailableShiftSkillTypeProperties.skill_type_color.string",
                 localized_specialty_id: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.localized_specialty_properties.AvailableShiftsLocalizedSpecialtyProperties.id.int",
                 localized_specialty_specialty_id: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.localized_specialty_properties.AvailableShiftsLocalizedSpecialtyProperties.specialty_id.int",
                 localized_specialty_state_id: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.localized_specialty_properties.AvailableShiftsLocalizedSpecialtyProperties.state_id.int",
                 localized_specialty_name: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.localized_specialty_properties.AvailableShiftsLocalizedSpecialtyProperties.name.string",
                 localized_specialty_abbreviation: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.localized_specialty_properties.AvailableShiftsLocalizedSpecialtyProperties.abbreviation.string",
                 specialty_id: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.localized_specialty_properties.AvailableShiftsLocalizedSpecialtyProperties.specialty_properties_record.AvailableShiftSpecialtyPropertiesRecord.id.int",
                 specialty_record_name: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.localized_specialty_properties.AvailableShiftsLocalizedSpecialtyProperties.specialty_properties_record.AvailableShiftSpecialtyPropertiesRecord.name.string",
                 specialty_color: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.localized_specialty_properties.AvailableShiftsLocalizedSpecialtyProperties.specialty_properties_record.AvailableShiftSpecialtyPropertiesRecord.color.string",
                 specialty_abbreviation: "$properties.AuthenticatedAvailableShiftOpeningCreatedProperties.localized_specialty_properties.AvailableShiftsLocalizedSpecialtyProperties.specialty_properties_record.AvailableShiftSpecialtyPropertiesRecord.abbreviation.string",
                 created_at: "$created_at.long"
               }
             }
           ],
           'newEventType': [
             {
               $project: {
                 _id: 1,
                 event: "$event.string",
                 id: "$properties.NewEventTypeProperties.id.int",
                 name: "$properties.NewEventTypeProperties.name.string",
                 timestamp: "$properties.NewEventTypeProperties.timestamp.long",
                 details: "$properties.NewEventTypeProperties.details.string",
                 created_at: "$created_at.long"
               }
             }
           ]
         }
       })
     ],
     controllers: [AppController],
     providers: [AppService],
   })
   export class AppModule {
     constructor(private readonly watcherService: InOutBoxProcessorService) {
       this.watcherService.watchCollection('authenticatedAvailableShiftOpeningCreated');
       this.watcherService.watchCollection('newEventType');
     }
   }
```

### Using the Service

Inject the `InOutBoxProcessorService` into your service or controller and use the `watchCollection` method to start watching a collection for changes. You can also use the `addToOutbox` method to add documents to the outbox collection.

```typescript
import { Injectable} from '@nestjs/common';
import { InOutBoxProcessorService } from 'in-out-box-processor';

@Injectable()
export class AppService {
  constructor(private readonly inOutBoxProcessorService: InOutBoxProcessorService) {}

  async addDocumentToOutbox(document: any) {
    await this.inOutBoxProcessorService.addToOutbox(document);
  }
}
```

### Controller Example

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('add-to-outbox')
  async addToOutbox(@Body() document: any) {
    await this.appService.addDocumentToOutbox(document);
  }
}
```

## Configuration

The `InOutBoxProcessorModule` requires a configuration object with the following properties:

- `inboxCollectionName`: The name of the inbox collection.
- `targetCollectionName`: The name of the target collection.
- `aggregationPipelines`: An object where keys are event types and values are arrays of MongoDB aggregation pipeline stages.

## Methods

### `watchCollection(eventType: string)`

Starts watching the inbox collection for changes of the specified event type. When a change is detected, the corresponding aggregation pipeline is applied, and the results are upserted into the target collection.

### `addToOutbox(documents: any | any[])`

Adds a document or batch of documents to the outbox collection.

## Error Handling

If an error occurs during document processing, the service retries up to 3 times with exponential backoff. If all retries fail, the document is moved to a failed collection with an error message.
