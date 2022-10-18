# Piercing Migration Strategy

## How to run the app locally

### build the piercing-library

```terminal
    cd piercing-library
    npm i
    npm run build
```

### build the shared library

```terminal
    cd app/shared
    npm i
    npm run build
```

### run productivity suite app

```terminal
    cd app/productivity-suite
    npm i
    npm run fe:dev
    npm run be:dev (in a separate terminal)
```

### run fragments

```terminal
    cd app/fragments/F
    npm i
    npm run dev
```

where `F = login|todo-lists|todos`
