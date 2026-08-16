# Integration Flow Configuration

This repository contains a small Angular and NestJS application for creating and managing configurable integration flows.

The application supports:

- Creating, listing, editing, and deleting flows.
- Selecting one consumer and one producer.
- Adding zero or more ordered service steps, including repeated service types.
- Loading component metadata and configuration fields from the supplied JSON definitions.
- Persisting flows and their component configurations in a local SQLite database.
- Reporting missing selections, invalid form fields, missing definitions, duplicate names, and other API errors to the user.

## Technology Stack

- Frontend: Angular 22, Angular Material, Reactive Forms, and signals.
- Backend: NestJS 11 and TypeORM.
- Database: SQLite through the `sqlite3` driver.
- Language: TypeScript.
- Runtime: Node.js 24, as specified by `.nvmrc` and the package engine constraints.

## Repository Structure

```text
integration-flow/
├── backend/     NestJS API, TypeORM entities, services, and component data
├── frontend/    Angular application and form-based flow editor
└── README.md
```

## Prerequisites

- Node.js 24.x
- npm
- A Chrome or Chromium binary, only required to run the frontend unit tests (`npm test` in `frontend`); not needed to build or serve the app.

Using a Node version manager, the repository version can be selected with:

```bash
nvm use
```

## Setup and Run

Install dependencies in both applications:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Start the backend in one terminal:

```bash
cd backend
npm run start:dev
```

The API listens on `http://localhost:3000`. The first startup creates `backend/database.sqlite` automatically through TypeORM.

Start the frontend in a second terminal:

```bash
cd frontend
npm start
```

Open `http://localhost:4200` in a browser. The frontend currently uses the local backend URLs directly and the backend allows CORS requests from this origin.

## Available API

### Flow endpoints

| Method   | Endpoint    | Purpose                                |
| -------- | ----------- | -------------------------------------- |
| `POST`   | `/flow`     | Create a flow                          |
| `GET`    | `/flow`     | List flows, including their components |
| `GET`    | `/flow/:id` | Retrieve one flow                      |
| `PUT`    | `/flow/:id` | Replace a flow name and component list |
| `DELETE` | `/flow/:id` | Delete a flow                          |

A flow payload has this shape:

```json
{
  "name": "Scheduled file conversion",
  "components": [
    {
      "role": "consumer",
      "componentId": "myesb-cron-consumer",
      "position": 0,
      "configuration": {
        "id": "scheduler-1",
        "cron-expression": "0 0/5 * * * ?"
      }
    },
    {
      "role": "service",
      "componentId": "myesb-filereader-service",
      "position": 1,
      "configuration": {}
    },
    {
      "role": "producer",
      "componentId": "myesb-file-producer",
      "position": 2,
      "configuration": {}
    }
  ]
}
```

### Component-definition endpoints

| Method | Endpoint                             | Purpose                                                |
| ------ | ------------------------------------ | ------------------------------------------------------ |
| `GET`  | `/component-definitions/:role`       | List metadata for a role                               |
| `GET`  | `/component-definitions/:role/:type` | Retrieve configuration metadata for one component type |

## Component Definitions

The source of truth is `backend/src/component-definition/infrastructure/data/challenge-library.json`.

The backend reads the role-specific indexes (`consumer_index`, `services_index`, and `producer_index`) and exposes the component `id`, display name, description, type, and availability. The role is represented by the request path. Availability is calculated by checking whether a matching definition file named `<type>.json` exists beside the library file.

The included configuration definitions describe fields such as:

- required or optional usage;
- display labels and descriptions;
- default values;
- booleans, text, enumerations, and sequence fields;
- ordering metadata for the configuration form.

The frontend requests these definitions when a component is selected, maps the metadata to Angular Reactive Form controls, and displays the component description and configuration fields. Components without a local definition file are shown as unavailable and cannot be selected.

The supplied files cover the challenge's demonstrated components: Scheduler, File Reader Service, XML to JSON Transformer, and File Drop. The library itself contains additional catalog entries, but catalog entries without matching local definition JSON files are intentionally unavailable in the editor.

## Known Limitation: Component Definitions Do Not Declare a UI Control Type

The biggest limitation of the supplied component-definition model is that it describes configuration fields for a legacy XML-based schema, not the intended user interaction or UI representation. Each field carries `name`, `type`, `use`, `description`, `order`, and an `appinfo` object, but there is no explicit property that says "render this as a checkbox", "render this as a dropdown", or "render this as a repeatable list".

As a result, the frontend currently has to infer the appropriate control from a combination of loosely related signals:

- `appinfo.sequence` (boolean) marks repeatable fields such as `exception-handling` and `meta-data`.
- `appinfo.enumeration` (an array) marks selectable values, but it appears under at least two different `appinfo.fieldType` values in the supplied JSON: `"textenumeration"` (e.g. `messagepart`, `messagepart-out`) and `"enumeration"` (e.g. `return-type`). The presence of the enumeration array, rather than the `fieldType` value alone, is what currently identifies a select field.
- `appinfo.fieldType === "boolean"` marks checkboxes (e.g. `autostart`, `omit-root-element`, `serialize`).
- Several other `fieldType` values exist (`"cron"`, `"string"`, `"beanreference"`, `"description"`) or are left as an empty string, but they do not explicitly describe their intended UI representation. They currently fall back to a plain text input, even though `cron-expression` could benefit from cron-specific input assistance and `filename-generator` (`"beanreference"`) or `description` (`"description"`) may warrant different controls.

This logic currently lives in `resolveEditorType` (`frontend/src/flow/presentation/components/dynamic-cofiguration/dynamic-field/dynamic-field.model.ts`). It checks `sequence`, then `enumeration`, then `fieldType === 'boolean'`, in that specific order, before defaulting to `text`.

The important limitation is therefore not simply where this logic lives. Moving the mapping to another layer, such as a backend adapter, would improve separation of concerns but would not remove the underlying ambiguity. The adapter would still have to inspect the same legacy metadata and infer that, for example, `fieldType === "boolean"` means `checkbox` or that the presence of `enumeration` means `select`. When a new field type such as `date` appears, the system still needs an additional rule to determine whether it should be rendered as a date picker, a datetime picker, or a plain text input. The source model does not currently contain enough information to make that decision explicitly.

This does not block the four required components, since their fields resolve correctly through the existing heuristics, but it is a significant scalability limitation. Adding genuinely new UI controls (a date picker, numeric input, multiline text area, autocomplete field, etc.) requires introducing new interpretation rules based on the supplied definition. An unrecognized `fieldType` currently falls back silently to a text input, so a mismatch between the definition and the frontend's assumptions can go unnoticed until the rendered form is inspected manually.

### Recommended Direction

For the current challenge, the existing inference can be kept deliberately small and centralized, with explicit handling of unknown field types and tests covering all `fieldType`/metadata combinations present in the supplied definitions. This makes the current implementation easier to understand without pretending that the underlying schema is more expressive than it actually is.

For a production implementation, the preferred solution would be to extend or complement the component-definition contract with explicit UI metadata. For example:

```json
{
  "name": "autostart",
  "type": "boolean",
  "uiControl": {
    "type": "checkbox"
  }
}
```

or:

```json
{
  "name": "return-type",
  "type": "string",
  "uiControl": {
    "type": "select",
    "options": ["string", "integer", "boolean"]
  }
}
```

This would make the intended editing experience part of the definition rather than something that clients have to infer.

If the supplied legacy schema cannot be changed, an adapter or normalization layer can still be valuable: it can translate the legacy definition into a UI-oriented definition and keep the legacy vocabulary out of the rendering layer. However, this should be understood as an encapsulation of the ambiguity, not a complete solution to it. The adapter would still require a documented mapping or additional source metadata to determine how ambiguous fields should be presented.

The ideal architecture would therefore be:

```text
Legacy Component Definition
            │
            ▼
   Definition Adapter
   (only if legacy schema
    cannot be changed)
            │
            ▼
    UI-oriented Definition
    ├── field metadata
    ├── control type
    └── control-specific data
            │
            ▼
    Dynamic Form Renderer
```

This separates the configuration schema from the presentation model while making the UI contract explicit. Most importantly, the frontend would no longer need to infer presentation semantics from unrelated configuration metadata. If the upstream definition can eventually provide this information directly, the adapter can be removed and the explicit UI metadata can become part of the component-definition contract itself.

## Persistence Model

SQLite was intentionally chosen for the evaluation because it provides relational persistence without requiring an external database service. Since the application uses TypeORM, switching to PostgreSQL would mainly involve changing the database driver and connection configuration, while keeping the domain model and repositories largely unchanged.

For a production deployment, PostgreSQL would be preferred due to its stronger concurrency model, transaction capabilities, operational tooling, and scalability. The production setup would use environment-based database configuration, connection pooling, migrations instead of synchronize, and a managed PostgreSQL instance where appropriate.

The model contains:

- `Flow`: a unique name, timestamps, and a one-to-many relation to components.
- `FlowComponent`: role, component ID, ordered position, and JSON configuration.

The component-to-flow relation uses cascade delete, so deleting a flow also deletes its components. `position` preserves service ordering. No uniqueness constraint is placed on service component IDs, which allows the same service type to appear multiple times.

TypeORM is configured with `synchronize: true` for this evaluation project. This is convenient for local development, but it should be replaced with migrations and a deliberate schema strategy in production.

## Validation and Error Handling

The frontend validates that the flow name is present, that a consumer and producer are selected, and that dynamically generated configuration controls satisfy metadata-derived validators such as required fields and sequence length constraints.

The backend validates that every flow contains exactly one consumer and exactly one producer. Services are optional and are stored in the submitted order. Flow names are protected by both an application-level duplicate check and the database unique constraint. Duplicate names return a conflict response, and missing flows return `404 Not Found`.

The frontend converts API error messages into snack-bar notifications. Component-definition lookup failures and unavailable definition files are returned as `404 Not Found` responses by the backend.

## Design Decisions and Assumptions

- A flow is represented as an ordered list of components rather than a graph because the assignment explicitly allows a form-based editor and does not require diagram editing.
- The consumer is stored at position `0`, services occupy the positions between the endpoints, and the producer is stored after the services.
- `componentId` identifies the catalog entry, while `type` identifies the configuration-definition file used to build the editor form.
- Configuration is stored as a JSON object so the persistence model does not need to change whenever the supplied metadata introduces a new field.
- Authentication and authorization are out of scope.
- The frontend and backend are expected to run on their default local ports: `4200` and `3000`.
- The backend uses `class-validator` decorators and a global `ValidationPipe` to validate request shape, enum values, positions, nested components, and basic configuration object structure. Flow-specific rules such as exactly one consumer and one producer remain in the application service.

## Tests and Build Commands

Backend:

```bash
cd backend
npm run build
npm test
npm run test:e2e
```

Frontend:

```bash
cd frontend
npm run build
npm test
```

Backend unit tests focus on the areas most likely to hide real bugs: component-definition parsing, flow validation, persistence interactions, and API delegation.

- `component-definition.service.spec.ts` exercises the real `challenge-library.json` and the bundled definition files (no mocking): it asserts that `getComponentListByRole` parses the consumer/service/producer indexes correctly, that `available` reflects whether a `<type>.json` definition file actually exists on disk, and that `getConfigurationDefinition` reads real configuration fields and throws `NotFoundException` for unavailable or role-mismatched types.
- `flow.service.spec.ts` mocks the TypeORM repositories and covers the core business rules: rejecting a duplicate flow name, rejecting a flow without exactly one consumer or exactly one producer, rejecting a rename to an already-used name, and the persistence flow for `update` (deleting existing `FlowComponent` rows before saving the new ordered list) and `remove`.
- `flow.controller.spec.ts` mocks `FlowFacade` and asserts that each HTTP handler (`create`, `findAll`, `findOne`, `update`, `remove`) delegates to the facade with the expected arguments.

Jest's `modulePaths` was configured (`"modulePaths": ["<rootDir>/.."]` in `backend/package.json`) so the bare `src/...` imports already used across the backend (e.g. in `component-definition.service.ts` and `flow.controller.ts`) resolve correctly under `ts-jest`, matching how the Nest CLI already resolves them via `tsconfig.json`'s `baseUrl`.

The Angular side uses the default Karma/Jasmine scaffolding (the same `*.spec.ts` convention as the backend, but executed inside a real/headless Chrome browser instead of Node). Beyond the generated `app.component.spec.ts`, three focused unit tests cover the dynamic-field utilities discussed in the limitation above, since they are plain functions and do not require a component test harness:

- `dynamic-field.mapper.spec.ts` asserts that `mapDynamicField` parses `use`, `description`, `order`, boolean vs. string default values, `enumeration`, and `sequence`/`sequenceTemplateFields` the same way the real `autostart`, `return-type`, `messagepart`, and `exception-handling` fields are shaped in the supplied JSON.
- `dynamic-field.model.spec.ts` asserts the exact priority `resolveEditorType` uses (`sequence` before `enumeration` before `fieldType === 'boolean'`) and that unmapped `fieldType` values such as `cron` or `beanreference` fall back to `text`, plus `getFieldLabel`'s fallback to the field name.
- `dynamic-field.validators.spec.ts` asserts the `required`, cron-format, and enumeration validators built by `buildFieldValidators`, and the corresponding messages from `resolveFieldErrorMessage`.

Run them with `npm test` in `frontend`; Karma requires a Chrome (or Chromium) binary on the machine running the tests, set via the `CHROME_BIN` environment variable if it is not auto-detected.

## Simplifications and Unfinished Areas

- Main point here is what has been said in the previous "Known Limitation: Component Definitions Do Not Declare a UI Control Type" section.
- Also due to not understanding the product in its own detail, configuration probably could be improved adding more validators, presets, auto generated id's etc.
- There is no authentication
- Pagination for flow list. Pagination should be developed in the backend so that the frontend can choose page and limit for each petition.
- SQLite schema synchronization is used instead of migrations since we are using SQLite. In production we would be using Postgres with the correspondent configuration.
- The UI is simple for the test purpose but snackbar could be color coded, and the UI itself could be made in diagram like form.
- The data we get from the json files should be stored in a database.

## What I Would Improve With More Time

1. I would have used Postgres and dockerized the whole project, first to make it closer to a production like project, and second to make it simple to execute.
2. Add validation for required configuration fields in the backend.
3. Add integration tests for all the components and services.

## AI Tools Usage

AI tools were used as development assistants throughout the implementation, primarily ChatGPT and GitHub Copilot Chat.

They were used for:

- Exploring implementation approaches and architectural alternatives.
- Assisting with boilerplate and repetitive code.
- Reviewing and discussing TypeScript, Angular, NestJS and TypeORM patterns.
- Identifying potential edge cases and areas for improvement.
- Discussing trade-offs and validating technical decisions.

All AI-generated suggestions and code were reviewed and validated manually before being incorporated into the project. The final implementation and architectural decisions were made with a focus on keeping the code modular, maintainable and scalable, while following established best practices and the existing project structure.

AI assistance was therefore used as a development and reasoning tool rather than as an autonomous implementation mechanism.

## License

This project was created solely for the evaluation challenge and is not production or commercial software.
