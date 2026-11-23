# Application Architecture Guidelines

## 1. Architecture Overview

The application follows four responsibility layers:

1. Presentation
2. Application
3. Domain
4. Data

Each layer has a specific responsibility. Financial business rules must not be implemented directly inside screens or UI components.

## 2. Presentation Layer

Location:
- app/
- src/components/
- src/features/{feature}/presentation/

Responsibilities:
- Screens and navigation
- User input and form handling
- Reusable UI components
- Displaying application state
- Presenting validation and operation errors

Restrictions:
- Must not directly write financial data to Firestore.
- Must not independently implement financial balance rules.
- Must not contain repository implementation details.

## 3. Application Layer

Location:
- src/features/{feature}/application/

Responsibilities:
- Coordinate application use cases.
- Call domain logic.
- Coordinate repository operations.
- Manage application workflows.
- Return results suitable for presentation.

Examples:
- RegisterUser
- LoginUser
- CreateAccount
- CreateExpense
- TransferMoney

## 4. Domain Layer

Location:
- src/features/{feature}/domain/
- src/types/
- src/utils/

Responsibilities:
- Core domain models and rules.
- Financial calculations.
- Transaction validation.
- Account lifecycle rules.
- Recurrence calculations.

Restrictions:
- Must not depend on React Native components.
- Must not directly access Firebase or Firestore.
- Must not depend on screen-specific state.

## 5. Data Layer

Location:
- src/services/firebase/
- src/services/repositories/
- src/features/{feature}/data/

Responsibilities:
- Firebase initialization.
- Firestore access.
- Authentication integration.
- Repository implementations.
- Mapping persisted documents to application models.

Restrictions:
- Firebase SDK calls must remain within the data layer.
- Firestore document paths must not be constructed inside screens.
- Repository implementations must follow the application's defined contracts.

## 6. Dependency Guidelines

- Presentation calls application use cases.
- Application coordinates domain logic and repository contracts.
- Domain remains independent of infrastructure and presentation.
- Data implements repository contracts and handles external services.
- Financial operations must not bypass their application and domain rules.

## 7. Implementation Guidelines

- Create feature folders only when implementing the relevant feature.
- Avoid empty folders and unnecessary abstractions.
- Keep each implementation task focused.
- Preserve the approved Firebase and Expo architecture.
- Do not introduce an unapproved backend or dependency.
