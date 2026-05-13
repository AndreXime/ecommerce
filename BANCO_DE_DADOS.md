# Banco de dados

> **Navegação:**
> - [Visão geral](./README.md)
> - [Funcionalidades e Regras de Negócio](./FUNCIONALIDADES.md)
> - **Modelo de Dados**
> - [Fluxos](./FLUXO.md)

O backend usa **PostgreSQL** com **Prisma**. O schema está dividido em arquivos em [api/prisma/models/](./api/prisma/models/) e o datasource em [api/prisma/schema.prisma](./api/prisma/schema.prisma). O cliente Prisma é gerado em `api/src/database/client`.

---

## Diagrama de entidades (Mermaid)

Visão do modelo lógico: cardinalidade, tabelas mapeadas e FKs principais.

```mermaid
erDiagram
  User {
    string id
    string email
    string name
    string role
    int session_version
    datetime deleted_at
  }

  RefreshToken {
    string id
    string hashed_token
    string user_id
    boolean revoked
    datetime expires_at
  }

  PasswordResetToken {
    string id
    string token
    string user_id
    datetime expires_at
    datetime used_at
  }

  UserNotification {
    string id
    string user_id
    string message
    boolean read
    string link
  }

  Address {
    string id
    string user_id
    string type
    string street
    string city
    boolean is_default
  }

  PaymentCard {
    string id
    string user_id
    string brand
    string last4
    string holder
    string expiry
  }

  Cart {
    string id
    string user_id
    datetime reminder_sent_at
  }

  CartItem {
    string id
    string cart_id
    string product_id
    int quantity
    string variant_signature
  }

  WishlistItem {
    string id
    string user_id
    string product_id
    datetime created_at
  }

  Category {
    string id
    string name
  }

  Product {
    string id
    string category_id
    string name
    decimal price
    int stock_quantity
    int quantity_sold
  }

  ProductImage {
    string id
    string product_id
    string url
    string object_key
    int position
  }

  SelectableOption {
    string id
    string product_id
    string label
    string ui_type
  }

  Review {
    string id
    string product_id
    string user_id
    int rating
    string title
  }

  Order {
    string id
    string user_id
    decimal total
    string status
  }

  OrderItem {
    string id
    string order_id
    string product_id
    string name
    int quantity
    decimal unit_price
    decimal subtotal
  }

  User ||--o{ RefreshToken : cascade
  User ||--o{ PasswordResetToken : cascade
  User ||--o{ UserNotification : cascade
  User ||--o{ Address : cascade
  User ||--o{ PaymentCard : cascade
  User ||--o{ WishlistItem : cascade
  User ||--o{ Order : cascade
  User ||--o{ Review : set_null
  User ||--o| Cart : um_por_usuario

  Category ||--o{ Product : contem

  Product ||--o{ ProductImage : cascade
  Product ||--o{ SelectableOption : cascade
  Product ||--o{ Review : cascade
  Product ||--o{ CartItem : cascade
  Product ||--o{ WishlistItem : cascade
  Product ||--o{ OrderItem : set_null

  Cart ||--o{ CartItem : cascade
  Order ||--o{ OrderItem : cascade
```

---

## Enums

| Enum (Prisma) | Valores |
|---------------|---------|
| `Roles` | `ADMIN`, `CUSTOMER`, `SUPPORT` |
| `OrderStatus` | `pending`, `delivered`, `intransit`, `cancelled` |
| `UIType` | `color`, `pill`, `select` |

---

## Restrições e deletes

| Tabela / modelo | Destaque |
|-----------------|----------|
| `cart_items` | `@@unique([cartId, productId, variantSignature])` |
| `wishlist_items` | `@@unique([userId, productId])` |
| `reviews` | `@@unique([productId, userId])` quando `userId` preenchido |
| `carts` | `userId` único (um carrinho por usuário) |
| `order_items` | `productId` opcional; `onDelete: SetNull` no produto |
| `reviews` | `userId` opcional; `onDelete: SetNull` no usuário |