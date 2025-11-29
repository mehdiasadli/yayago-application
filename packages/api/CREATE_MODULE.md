# Create Module inside /packages/api/src/modules folder

Module usually represents a single entity/feature in the database/application. (but sometimes different entities can be grouped, e.g. translations tables usually)

## Creating Module

### Naming

Name the folder singular and kebab case
examples:

- 'country'
- 'city'
- 'vehicle-brand'
  etc.

### Inside the folder

There will be 4 essential files:

- {module}.utils.ts
- {module}.schema.ts
- {module}.service.ts
- {module}.router.ts

### .utils.ts file

In this file there will be util/helper ts functions that can be used inside .schema, .service etc. The util function should only related to that module, otherwise it should be placed in the ../**shared** folder. Specifically, **shared**/utils.ts file.

### .schema.ts file

In this file there will be the zod schemas for the module.

#### Entity Schema

Every module should have a entity schema that will be extended by the BaseSchema, BaseEntitySchema etc. based on if they have timestamps or soft deletable feature.

#### Method schemas

Every method in the service should have an Input (unless it is not an object, and a simple type like `string`, `number` etc. in that case we can use zod itself in the `router`) and Output (unless service returns `void`) schemas.

examples:

- CreateCountryInputSchema
- CreateCountryOutputSchema
- UpdateCountryInputSchema
- UpdateCountryOutputSchema
- DeleteCountryInputSchema
- DeleteCountryOutputSchema
- FindCountryInputSchema
- FindCountryOutputSchema
- ListCountryInputSchema
- ListCountryOutputSchema

Every method schema MUST extend the base entity schema. either by picking, omitting, extending, combining, making partial or required, new schemas can be obtained. You can use .shape on extending the other schemas with schemas.

### .service.ts file

In this file there will be the service functions for the module. The service should be named like {module}Service. The service should be used to perform the business logic for the module. Service will be a class and have static methods for the methods.

### .router.ts file

In this file there will be the router functions for the module. The router should be named like {module}Router. The router should be used to perform the router logic for the module. We are using orpc here. so we can specify input and output schemas for the method and handler, and there service method will be called.

### procedures

If you can check the index.ts file in src, you will see there is publicProcedure, and roleProcedure function which accepts roles. User sessions can be used in the `context` on router handlers as well.

#### To get the data, you should check /packages/db/prisma/schema folder and its files.

### Enums

All enums should be declared inside **shared**/enums.schema.ts file.
