# Data Collection App

A React application for collecting structured data using JSON Schema definitions.

## Proof of Concept

**Important Note:** This application is a proof of concept and not intended for production use. It demonstrates the capabilities of dynamic form generation from JSON Schema with custom UI components and is meant to showcase what's possible rather than provide a complete solution.

## Features

-   Dynamic form generation from JSON Schema
-   Support for all common field types (text, number, boolean, arrays, objects)
-   Schema visualization and exploration
-   **Full support for JSON Schema references ($ref) and definitions**
-   **Custom interactive UI components for specialized data collection**

## Custom UI Components

This project demonstrates the ability to build custom, interactive UI components that extend beyond standard form controls:

### Graph Field

A custom component for positioning tokens in a triangular graph space:

-   Interactive drag-and-drop interface
-   Barycentric coordinate system
-   Visual representation of data points
-   Used for specialized data collection scenarios like threat assessments

![Graph Field UI Component](./images/custom-ui-graph.png)

### Timeline Field

A specialized component for visualizing and managing project timelines with:

-   Interactive timeline visualization
-   Dependency management between milestones
-   Status tracking with color coding
-   Date-based organization

The timeline custom ui component is just an example and does not represent a usecase for our purposes at this time.

### Wizard Field

A multi-step form wizard that:

-   Guides users through complex data entry processes
-   Validates each step before proceeding
-   Supports optional steps
-   Provides a streamlined onboarding experience

The wizard custom ui component is just an example and does not represent a usecase for our purposes at this time.

These custom components demonstrate how JSON Schema can be extended with specialized UI controls for complex data collection scenarios beyond what standard form controls can provide.

## JSON Schema Reference Support

This application supports JSON Schema with `$ref` references and `definitions` sections. This allows you to:

1. Define reusable components in the `definitions` section
2. Reference these components using `$ref` syntax
3. Create more maintainable and DRY schemas

### Example Schema with References

```json
{
    "type": "object",
    "title": "User Registration",
    "properties": {
        "user": {
            "type": "object",
            "properties": {
                "name": { "type": "string" },
                "address": { "$ref": "#/definitions/address" }
            }
        },
        "shippingAddress": { "$ref": "#/definitions/address" }
    },
    "definitions": {
        "address": {
            "type": "object",
            "properties": {
                "street": { "type": "string" },
                "city": { "type": "string" },
                "zipCode": { "type": "string" }
            }
        }
    }
}
```

### How It Works

The application includes a reference resolver that:

1. Detects `$ref` references in the schema
2. Resolves them by looking up the referenced definition
3. Replaces the reference with the actual schema content
4. Preserves any additional properties on the referencing object

This happens automatically when rendering forms or viewing schemas.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Deployment to GitHub Pages

This project is configured for easy deployment to GitHub Pages. To deploy:

1. Update the `homepage` field in `package.json` with your GitHub username:

    ```json
    "homepage": "https://YOUR_USERNAME.github.io/data-collection"
    ```

2. Deploy manually using:

    ```bash
    npm run deploy
    ```

3. Alternatively, push to the main branch to trigger automatic deployment via GitHub Actions.

## Technologies

-   React
-   TypeScript
-   Material UI
-   Vite

## Limitations and Future Work

As a proof of concept, this application has several limitations:

-   Limited validation capabilities compared to a production-ready solution
-   No backend integration for data persistence
-   Custom UI components are demonstrations and may need refinement for production use
-   Performance optimizations for large schemas are not fully implemented

Future work could include:

-   Adding more custom UI components
-   Implementing a backend for data storage
-   Enhancing validation capabilities
-   Improving performance for large and complex schemas

## License

MIT
