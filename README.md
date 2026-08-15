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

## Persistence Model

SQLite was chosen because the challenge needs relational persistence but does not require an external database service. It keeps the project easy to run locally and still exercises TypeORM relations and constraints.

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

The repository includes starter NestJS unit/e2e tests and Angular unit-test setup. The most valuable additional coverage would target flow validation, duplicate-name behavior, component-definition parsing, dynamic field mapping, and full create/update API requests.

## Simplifications and Unfinished Areas

- The API URLs are currently hardcoded to `localhost`; environment-specific Angular configuration would be preferable.
- There is no authentication, authorization, pagination, filtering, or optimistic concurrency handling.
- The backend does not yet validate that every submitted component ID belongs to the selected role or that the stored configuration fully satisfies the definition metadata.
- SQLite schema synchronization is used instead of migrations.
- The UI is intentionally a form-based editor and does not provide a visual diagram or drag-and-drop canvas.
- The broader challenge library is exposed as metadata, but only components with matching local definition files are editable.
- Error handling is functional but could be improved with a consistent API error contract and more detailed loading/error states around component-definition requests.

## What I Would Improve With More Time

1. Validate component IDs and definition compatibility on the backend rather than relying primarily on the UI.
2. Add integration tests for all flow endpoints using an isolated test database.
3. Add Angular environment files, a configurable API base URL, and a production-oriented deployment configuration.
4. Replace `synchronize: true` with migrations and add transactional flow updates.
5. Improve accessibility and error recovery for failed definition loads and deletion requests.

## AI Tool Usage

AI tools were used as an implementation assistant for repository exploration, code drafting, and documentation. The resulting code and this README were checked against the source files, package scripts, API controllers, entities, component-definition JSON, and available tests. The solution remains intentionally understandable and should be reviewed and explained by the author before submission.

## License

This project was created solely for the evaluation challenge and is not production or commercial software.# Integration Flow Configuration

Small full-stack application for creating and managing configurable integration flows. The project was built for evaluation purposes based on the supplied component-definition library.

## Overview

The application provides a form-based Angular UI backed by a NestJS REST API. Users can:

- create, list, edit, and delete integration flows;
- choose one consumer and one producer;
- add zero or more ordered service steps, including repeated service types;
- configure each selected component from its definition metadata;
- receive feedback for missing required selections, invalid fields, missing definitions, and duplicate flow names.

A flow is persisted as a name and an ordered collection of components:

```text
Consumer -> Service 1 -> Service 2 -> ... -> Producer
```

## Tech Stack

- Frontend: Angular 22, Angular Material, Reactive Forms, Signals, RxJS
- Backend: NestJS 11, TypeORM, SQLite
- Language: TypeScript
- Runtime: Node.js 24, as specified in `.nvmrc`

## Project Structure

```text
backend/    NestJS API, TypeORM entities, component data, and tests
frontend/   Angular application and form-based flow editor
```

## Prerequisites

- Node.js 24.x
- npm

Using `nvm`:

```bash
nvm install
nvm use
```

## Setup and Run

Install dependencies in each application:

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

The API listens on `http://localhost:3000` and enables CORS for `http://localhost:4200`.

Start the frontend in a second terminal:

```bash
cd frontend
npm start
```

Open `http://localhost:4200` in a browser.

The frontend currently uses the backend URL directly in its API services. If either application runs on a different port, update the corresponding base URL and the backend CORS origin.

## Persistence

The backend uses SQLite through TypeORM. It was chosen because this is a small evaluation application and SQLite provides persistence without requiring a separate database server or credentials.

The database is stored at `backend/database.sqlite`. TypeORM is configured with `autoLoadEntities: true` and `synchronize: true`, so the schema is created automatically during development. This is convenient for the challenge, but migrations and a production database configuration would be preferable for a real deployment.

The model consists of:

- `Flow`: unique `name`, timestamps, and a one-to-many relation to components;
- `FlowComponent`: `role`, `componentId`, `position`, JSON `configuration`, timestamps, and a cascading relation back to its flow.

Deleting a flow cascades to its components. Updating a flow replaces its existing component rows with the submitted ordered collection.

## Component Definitions

The source of truth is `backend/src/component-definition/infrastructure/data/challenge-library.json`.

The backend reads the role-specific indexes in that file (`consumer_index`, `services_index`, and `producer_index`) to expose component IDs, names, descriptions, types, and availability. It then checks for a matching definition file named `<type>.json` in the same data directory and returns that JSON as configuration metadata. The application names these operations `getComponentListByRole` and `getConfigurationDefinition` to distinguish catalog retrieval from configuration metadata retrieval.

The supplied definition files currently available for dynamic configuration are:

- `myesb-cron-consumerType.json` - Scheduler
- `myesb-filereader-serviceType.json` - File Reader Service
- `myesb-xml2json-transformerType.json` - XML to JSON Transformer
- `myesb-file-producerType.json` - File Drop

The catalogue contains more entries than the four locally available definition files. Those entries remain visible in the API catalogue but are marked unavailable by the backend and disabled by the frontend.

The frontend loads component lists by role, keeps the selected component metadata in memory, fetches only its configuration definition on demand, and maps the returned `configuration` metadata, including field type, label, default value, enumeration, requiredness, and sequence information, to Angular form controls. This keeps the editor driven by the supplied metadata rather than hard-coding the four component forms.

## API

### Flows

| Method   | Endpoint    | Purpose                    |
| -------- | ----------- | -------------------------- |
| `POST`   | `/flow`     | Create a flow              |
| `GET`    | `/flow`     | List flows with components |
| `GET`    | `/flow/:id` | Get one flow               |
| `PUT`    | `/flow/:id` | Replace a flow definition  |
| `DELETE` | `/flow/:id` | Delete a flow              |

### Component definitions

| Method | Endpoint                             | Purpose                                    |
| ------ | ------------------------------------ | ------------------------------------------ |
| `GET`  | `/component-definitions/:role`       | List metadata for a role                   |
| `GET`  | `/component-definitions/:role/:type` | Get configuration metadata for a component |

The configuration-definition endpoint returns only the configuration metadata because the selected component's basic metadata is already available from the role list:

```json
{
  "configuration": {
    "id": {},
    "autostart": {},
    "cron-expression": {}
  }
}
```

Example flow payload:

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
        "autostart": true
      }
    },
    {
      "role": "service",
      "componentId": "myesb-filereader-service",
      "position": 1,
      "configuration": {
        "id": "reader-1",
        "file-uri": "file:/tmp/input.txt",
        "return-type": "TEXT"
      }
    },
    {
      "role": "producer",
      "componentId": "myesb-file-producer",
      "position": 2,
      "configuration": {
        "id": "drop-1",
        "directory": "file:/tmp/output"
      }
    }
  ]
}
```

## Validation and Error Handling

Frontend validation includes:

- required flow name;
- exactly one selected consumer and producer before submission;
- required, enumerated, boolean, and sequence-based configuration controls derived from metadata;
- disabled selection of catalogue entries whose definition file is unavailable.

Backend validation includes:

- unique flow names, returning a conflict when a duplicate is created or an update changes to an existing name;
- exactly one component with role `consumer`;
- exactly one component with role `producer`;
- not-found responses for missing flows and unavailable component definitions;
- integer parsing for flow IDs in route parameters.

The backend DTOs currently describe the request shape but do not use `class-validator` decorators or a global `ValidationPipe`. Consequently, the strongest structural validation is currently in the editor and service layer; deeper request validation would be a useful follow-up.

## Tests and Quality Checks

Backend:

```bash
cd backend
npm test
npm run test:e2e
npm run build
npm run lint
```

Frontend:

```bash
cd frontend
npm test
npm run build
```

The repository includes starter controller and application tests, plus a flow controller test scaffold. Test coverage is intentionally limited for this challenge and does not yet comprehensively exercise definition parsing, persistence, validation edge cases, or the full frontend editor workflow.

## Assumptions and Trade-offs

- Component IDs are the stable references persisted in a flow; definitions are resolved from the bundled data at runtime.
- `position` is used to preserve service order. The editor rebuilds positions sequentially when saving.
- Services are optional and can be added, removed, reordered by their form position, and repeated by type.
- Authentication and authorization are omitted because they are out of scope.
- The UI is intentionally form-based; it does not attempt to provide a visual graph editor.
- SQLite plus TypeORM synchronization was favored for zero-configuration local setup over a more operationally complex database.
- The API and UI currently assume local development URLs rather than environment-based configuration.

## Simplified or Unfinished Areas

- The backend does not yet validate that every submitted `componentId` belongs to the selected role or that its configuration matches the referenced configuration metadata.
- The backend does not independently validate configuration field requiredness; it stores the JSON submitted by the client.
- The catalogue exposes many definitions that do not have local JSON files and are therefore unavailable for configuration.
- Error handling is mainly surfaced through Angular snack bars and console logging; there is no centralized notification or logging strategy.
- The default Angular and NestJS test suites are present, but domain and integration coverage is still small.
- There is no Docker Compose setup, migration system, environment configuration, or production deployment profile.

## What I Would Improve With More Time

1. Add `class-validator` DTO rules and a global `ValidationPipe` for request validation.
2. Validate component IDs, roles, positions, and configurations against the component-definition library on the backend.
3. Add focused unit tests for definition mapping, dynamic validators, flow validation, and persistence, plus API integration tests for the CRUD lifecycle.
4. Move frontend API URLs and backend CORS settings to environment configuration.
5. Replace `synchronize: true` with explicit TypeORM migrations and add a production database profile.
6. Improve accessibility, loading states, and centralized error handling in the editor.

## AI Tool Usage

AI tools were used as an implementation and review aid for repository exploration, code scaffolding, and documentation drafting. The generated work was checked against the source files, package scripts, component-definition JSON, and available build/test commands. The submitter remains responsible for understanding and explaining the architecture, behavior, assumptions, and trade-offs described here.

## License and Scope

This application was created only for the evaluation challenge described in the brief. It is not production software and is not intended for commercial use.
