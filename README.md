# 🛍️ BhaiKiDukaan — Microservices E-Commerce Platform

<p align="center">
  <img src="web/src/assets/hero.png" alt="BhaiKiDukaan Hero" width="800" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.5);" />
</p>

<p align="center">
  <strong>A high-performance, modern full-stack E-Commerce platform built with TypeScript, gRPC / Connect-RPC microservices, Turborepo, React 19, and Docker.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/gRPC-Protobuf-244c5a?logo=grpc&logoColor=white" alt="gRPC" />
  <img src="https://img.shields.io/badge/Turborepo-Monorepo-EF4444?logo=turborepo&logoColor=white" alt="Turborepo" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white" alt="Redis" />
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [Service Breakdown & Port Mapping](#-service-breakdown--port-mapping)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Running with Docker](#running-with-docker)
  - [Running Locally (Hybrid Dev Mode)](#running-locally-hybrid-dev-mode)
- [Environment Variables](#-environment-variables)
- [NPM Scripts Reference](#-npm-scripts-reference)
- [Protobuf & gRPC Workflow](#-protobuf--grpc-workflow)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**BhaiKiDukaan** is an end-to-end e-commerce monorepo application structured around modular, independently scalable microservices communicating via **gRPC** and **Connect-RPC**, fronted by an **API Gateway (REST)** and a modern **React 19 SPA**.

The project demonstrates:
- Polyglot persistence (PostgreSQL with Drizzle ORM for ACID compliance; MongoDB with Mongoose for catalog search flexibility; Redis for caching).
- Automated Protobuf-to-TypeScript compilation using `@bufbuild/buf` and Connect-RPC.
- Live gRPC telemetry and request inspection dock on the web interface.
- Complete Docker and Docker Compose orchestration for local development and production.

---

## 🏛️ System Architecture

```
                                  +-----------------------------+
                                  |    Web Client (React 19)    |
                                  |   (Vite / Nginx :5173 / :80)|
                                  +--------------+--------------+
                                                 |
                                         HTTP / REST / Connect
                                                 v
                                  +-----------------------------+
                                  |         API Gateway         |
                                  |     (Express REST :4000)    |
                                  +-------+------+-------+------+
                                          |      |       |      |
             +----------------------------+      |       |      +----------------------------+
             |                                   |       |                                   |
             v (gRPC)                            v (gRPC)| (gRPC)                            v (gRPC)
    +-----------------+                 +----------------+                 +-----------------+
    |   User Service  |                 | Product Service|                 | Payment Service |
    |   (Port 50051)  |                 |  (Port 50052)  |                 |  (Port 50054)   |
    +--------+--------+                 +--------+-------+                 +--------+--------+
             |                                   |                                  |
             v                                   v                                  v
      +--------------+                    +--------------+                  (Razorpay Gateway)
      |  PostgreSQL  |                    |   MongoDB    |
      |   (:5432)    |                    |   (:27017)   |
      +--------------+                    +--------------+
                                                 ^
                                                 | (Inter-service gRPC)
                                        +--------+-------+
                                        |  Order Service |
                                        |  (Port 50053)  |
                                        +---+---------+--+
                                            |         |
                                            v         v
                                     +------------+ +------------+
                                     | PostgreSQL | |   Redis    |
                                     |  (:5432)   | |  (:6379)   |
                                     +------------+ +------------+
```

---

## 🛠️ Tech Stack

### Frontend (`web/`)
- **Core**: React 19, TypeScript, Vite
- **Routing & State**: `react-router-dom` v7, `zustand` (with LocalStorage persist)
- **RPC Client**: `@connectrpc/connect`, `@connectrpc/connect-web`, `@bufbuild/protobuf`
- **UI & Animations**: Vanilla CSS Modules / tokens, `framer-motion`, `lucide-react`, `react-hot-toast`

### Backend Services (`services/`)
- **API Gateway**: Express, Helmet, CORS, Rate-limiting, Pino Logger, gRPC Client bridge
- **User Service**: gRPC, PostgreSQL, Drizzle ORM, JWT, Bcrypt
- **Product Service**: gRPC, MongoDB, Mongoose
- **Order Service**: gRPC, PostgreSQL, Drizzle ORM, Redis (ioredis), Inter-service client
- **Payment Service**: gRPC, Razorpay Node SDK, Sandbox Simulator

### Shared & Tooling (`packages/`, `proto/`)
- **Monorepo**: Turborepo, NPM Workspaces
- **Protobuf**: Buf CLI (`@bufbuild/buf`), `@connectrpc/protoc-gen-connect-es`, `@bufbuild/protoc-gen-es`
- **DevOps**: Docker, Docker Compose, Nginx Alpine

---

## ✨ Key Features

- 🔐 **Authentication & Profiles**: Registration, JWT Login, Refresh Tokens, Profile updates, and full Multi-Address Book management.
- 📦 **Product Catalog & Search**: Category-based filtering, text search, price sorting, detailed specs, and stock quantity tracking.
- 🛒 **Cart & Checkout**: Interactive sliding drawer cart, live subtotal/tax/shipping calculations, and streamlined checkout.
- 💳 **Payment Gateway**: Integrated Razorpay checkout with HMAC-SHA256 signature verification and automatic sandbox mock fallback.
- 📜 **Orders & Tracking**: Complete order history, order status timeline badges, and cancellation handling with inventory restock.
- 📡 **Live gRPC Telemetry Inspector**: Interactive client-side dock displaying real-time gRPC payloads, latency benchmarks, and status codes.
- 🐳 **Dual-Mode Docker**: Spin up only infrastructure (Postgres, Mongo, Redis) for fast local coding, or containerize the entire stack in one command.

---

## 🔌 Service Breakdown & Port Mapping

| Service | Type / Protocol | Port | Description | Database / Storage |
| :--- | :--- | :--- | :--- | :--- |
| **Web Frontend** | React / Vite / Nginx | `5173` (or `80`) | Client-side E-Commerce Web App | LocalStorage / Cache |
| **API Gateway** | REST / Express | `4000` | REST API translating to gRPC services | - |
| **User Service** | gRPC | `50051` | Auth, profiles, and address book | PostgreSQL (`5432`) |
| **Product Service**| gRPC | `50052` | Product catalog, categories, search | MongoDB (`27017`) |
| **Order Service** | gRPC | `50053` | Order processing & cart caching | PostgreSQL + Redis |
| **Payment Service**| gRPC | `50054` | Razorpay order creation & signature verification | In-memory / DB |
| **PostgreSQL** | Database | `5432` | Relational storage for users and orders | Persistent volume |
| **MongoDB** | Database | `27017` | Document storage for products & catalog | Persistent volume |
| **Redis** | In-Memory Cache | `6379` | Fast caching & cart store | Persistent volume |

---

## 📂 Project Directory Structure

```text
bhaikidukaan/
├── packages/
│   └── proto-gen/             # Auto-generated TypeScript types & Connect-RPC clients
├── proto/                     # Protocol Buffer (.proto) service definitions
│   ├── buf.gen.yaml           # Buf generation pipeline configuration
│   ├── buf.yaml               # Buf module config
│   ├── order/v1/order.proto
│   ├── payment/v1/payment.proto
│   ├── product/v1/product.proto
│   └── user/v1/user.proto
├── scripts/
│   └── generate-proto.sh      # Script to compile protobuf to TS
├── services/
│   ├── gateway/               # REST API Gateway (Express)
│   ├── order-service/         # Order Management microservice (gRPC)
│   ├── payment-service/       # Payment & Razorpay microservice (gRPC)
│   ├── product-service/       # Product Catalog microservice (gRPC)
│   └── user-service/          # User Auth & Profile microservice (gRPC)
├── web/                       # React 19 Frontend Web SPA
│   ├── src/
│   │   ├── api/client.ts      # Connect-RPC transport & telemetry inspector bus
│   │   ├── components/        # Navbar, Footer, CartDrawer, AuthModal, GrpcInspector
│   │   ├── pages/             # Home, Products, ProductDetail, Checkout, Orders, Profile
│   │   └── stores/            # Zustand state stores (auth, cart, products, modal)
│   └── nginx.conf             # Production Nginx configuration
├── docker-compose.yml         # Full-stack containerization compose file
├── docker-compose.infra.yml   # Database-only containerization (Postgres, Mongo, Redis)
├── .env.docker.example        # Environment variables template for Docker
├── package.json               # Root monorepo configuration
├── turbo.json                 # Turborepo task pipeline configuration
└── tsconfig.json              # Base TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (>= 20.0.0)
- [npm](https://www.npmjs.com/) (>= 10.0.0)
- [Docker & Docker Compose](https://www.docker.com/) (Recommended)

---

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Knottykoder/bhaikidukaan.git
   cd bhaikidukaan
   ```

2. **Install all monorepo dependencies**:
   ```bash
   npm install
   ```

3. **Generate Protobuf Definitions**:
   ```bash
   npm run proto:generate
   ```

---

### Running with Docker

#### Option A: Local Development with Docker Infrastructure (Recommended)
Run only the databases (Postgres, Mongo, Redis) in Docker while running your application code on your host machine for hot-reloading:

```bash
# 1. Start Postgres, Mongo, and Redis containers
npm run docker:infra

# 2. Start all microservices, API Gateway, and Frontend concurrently
npm run dev

# 3. (Optional) Stop databases when done
npm run docker:infra:down
```

#### Option B: Full-Stack Docker Deployment
Build and run everything (all 4 microservices, gateway, frontend, and databases) inside containers:

```bash
# Start all containers in detached mode
npm run docker:up

# Stream real-time container logs
npm run docker:logs

# Stop all containers
npm run docker:down
```

---

## 🔑 Environment Variables

Copy `.env.docker.example` or individual `.env.example` files in each service directory:

| Service | Environment File | Key Variables |
| :--- | :--- | :--- |
| **User Service** | `services/user-service/.env` | `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` |
| **Product Service** | `services/product-service/.env` | `MONGODB_URI` |
| **Order Service** | `services/order-service/.env` | `DATABASE_URL`, `PRODUCT_SERVICE_ADDRESS`, `PAYMENT_SERVICE_ADDRESS` |
| **Payment Service** | `services/payment-service/.env` | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `ORDER_SERVICE_ADDRESS` |
| **API Gateway** | `services/gateway/.env` | `GATEWAY_PORT`, `USER_SERVICE_ADDRESS`, `PRODUCT_SERVICE_ADDRESS`, `ORDER_SERVICE_ADDRESS`, `PAYMENT_SERVICE_ADDRESS` |

---

## 📜 NPM Scripts Reference

From the root directory:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts all microservices, gateway, and frontend in parallel via Turborepo |
| `npm run build` | Builds all packages, microservices, and frontend for production |
| `npm run proto:generate` | Compiles `.proto` files into TypeScript definitions & Connect-RPC clients |
| `npm run typecheck` | Runs TypeScript type checking across all workspaces |
| `npm run format` | Formats all files with Prettier |
| `npm run docker:infra` | Starts PostgreSQL, MongoDB, and Redis in background |
| `npm run docker:infra:down` | Stops infrastructure containers |
| `npm run docker:up` | Builds and runs the entire full-stack application in Docker |
| `npm run docker:down` | Stops and removes all full-stack containers |
| `npm run docker:logs` | Streams logs from all running Docker containers |

---

## 📡 Protobuf & gRPC Workflow

When editing or adding new RPC endpoints:
1. Update or create `.proto` files in the [`proto/`](file:///c:/Users/mayan/Desktop/hemant/bhaikidunkaan/proto) directory.
2. Run the code generation script:
   ```bash
   npm run proto:generate
   ```
3. Types and clients will automatically be generated in [`packages/proto-gen`](file:///c:/Users/mayan/Desktop/hemant/bhaikidunkaan/packages/proto-gen).
4. Import the generated types and services across the frontend or backend services.

---

## 🤝 Contributing

Contributions are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
