# Infrastructure, Deployment & DevOps
**Production-Ready SaaS Deployment Architecture**

---

## 1. Deployment Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CDN (Cloudflare)                         │
│              (Static assets, DDoS protection)               │
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│               Load Balancer (AWS ALB / Nginx)               │
│         (SSL/TLS termination, request routing)              │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┴───────┬──────────────┐
    │                │              │
┌───▼────┐    ┌──────▼─────┐   ┌───▼────┐
│ API 1  │    │ API 2      │   │ API 3  │
│ (Node) │    │ (Node)     │   │ (Node) │
└───┬────┘    └──────┬─────┘   └───┬────┘
    │                │              │
    └────────────┬───┴──────────────┘
                 │
    ┌────────────▼────────────────────┐
    │      MongoDB Replica Set        │
    │  (Primary + 2 Secondaries)      │
    │  (Automatic failover)           │
    └────────────┬────────────────────┘
                 │
    ┌────────────▼────────────────────┐
    │      Redis Cluster              │
    │  (Session, cache, queues)       │
    └─────────────────────────────────┘

    ┌─────────────────────────────────────┐
    │   Bull Workers (Job Queue)          │
    │  (Automation, AI, notifications)    │
    └─────────────────────────────────────┘

    ┌─────────────────────────────────────┐
    │   Background Services               │
    │  (Analytics, cleanup, reports)      │
    └─────────────────────────────────────┘
```

---

## 2. Technology Stack for Infrastructure

| Component | Technology | Why |
|-----------|-----------|-----|
| **Hosting** | AWS EC2 or DigitalOcean Apps | Scalable, reliable, cost-effective |
| **Container** | Docker | Consistency across environments |
| **Orchestration** | Docker Compose (dev) / Kubernetes (prod) | Container management at scale |
| **Load Balancer** | AWS ALB or Nginx | High availability, SSL termination |
| **CDN** | Cloudflare or AWS CloudFront | Global content delivery, DDoS protection |
| **Database** | MongoDB Atlas or Self-managed | Managed or full control |
| **Cache** | Redis Cloud or Self-managed | Fast data access, sessions, queues |
| **File Storage** | AWS S3 or Wasabi | Resume/document storage, backups |
| **CI/CD** | GitHub Actions | Simple, integrated with GitHub |
| **Monitoring** | Datadog or New Relic | Application performance monitoring |
| **Logging** | ELK Stack or Datadog | Centralized logging, debugging |
| **Error Tracking** | Sentry | Real-time error alerts |
| **Email** | SendGrid | Transactional emails |
| **Secrets** | AWS Secrets Manager / HashiCorp Vault | Secure credential management |

---

## 3. Docker Setup (Multi-stage Build)

### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json .
COPY src ./src

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy dependencies from builder
COPY package*.json ./
RUN npm ci --only=production

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Copy other necessary files
COPY --chown=nodejs:nodejs .env.production .

USER nodejs

EXPOSE 5000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/server.js"]

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
```

### Docker Compose (Development)

```yaml
version: '3.9'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongo:27017/career-agent-dev
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      mongo:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./src:/app/src
    networks:
      - app-network
    restart: unless-stopped

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=career-agent-dev
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network
    restart: unless-stopped

  worker:
    build:
      context: .
      dockerfile: Dockerfile
    command: node dist/jobs/workers.js
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongo:27017/career-agent-dev
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - mongo
      - redis
    networks:
      - app-network
    restart: unless-stopped

  # Optional: Manage UI for Bull queues
  bull-board:
    image: deadly/bull-board:latest
    ports:
      - "3001:3001"
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis
    networks:
      - app-network

volumes:
  mongo_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

---

## 4. GitHub Actions CI/CD Pipeline

### Build & Test Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6.0
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test:unit
        env:
          MONGODB_URI: mongodb://localhost:27017/career-agent-test
          REDIS_HOST: localhost

      - name: Run integration tests
        run: npm run test:integration
        env:
          MONGODB_URI: mongodb://localhost:27017/career-agent-test
          REDIS_HOST: localhost

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to production
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
          DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
          DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
        run: |
          mkdir -p ~/.ssh
          echo "$DEPLOY_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H $DEPLOY_HOST >> ~/.ssh/known_hosts
          
          ssh -i ~/.ssh/deploy_key $DEPLOY_USER@$DEPLOY_HOST << 'EOF'
          cd /app/career-agent
          git pull origin main
          docker-compose pull
          docker-compose up -d
          EOF

      - name: Run smoke tests
        run: |
          sleep 10
          curl -f https://api.careerbot.com/health || exit 1

      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "✅ Deployment to production successful"
            }
```

---

## 5. Kubernetes Deployment (Production Scale)

### Kubernetes Manifests

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: career-agent

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
  namespace: career-agent
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  MONGODB_URI: "mongodb+srv://user:pass@cluster.mongodb.net/career-agent"
  REDIS_HOST: "redis-master.career-agent.svc.cluster.local"

---
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
  namespace: career-agent
type: Opaque
stringData:
  JWT_SECRET: <base64-encoded-secret>
  OPENAI_API_KEY: <base64-encoded-key>

---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
  namespace: career-agent
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  
  selector:
    matchLabels:
      app: api-server
  
  template:
    metadata:
      labels:
        app: api-server
    
    spec:
      containers:
      - name: api
        image: ghcr.io/yourorg/career-agent:latest
        imagePullPolicy: Always
        
        ports:
        - containerPort: 5000
          name: http
        
        envFrom:
        - configMapRef:
            name: api-config
        - secretRef:
            name: api-secrets
        
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 15"]

---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: api-service
  namespace: career-agent
spec:
  type: ClusterIP
  selector:
    app: api-server
  ports:
  - port: 80
    targetPort: 5000
    protocol: TCP
    name: http

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  namespace: career-agent
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.careerbot.com
    secretName: api-tls
  rules:
  - host: api.careerbot.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80

---
# k8s/hpa.yaml (Horizontal Pod Autoscaler)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: career-agent
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 6. Monitoring & Logging Setup

### Prometheus & Grafana

```yaml
# docker-compose additions for monitoring
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
    depends_on:
      - prometheus
```

### Winston Logger Configuration

```typescript
// src/config/logger.ts
import winston from 'winston';
import * as Sentry from "@sentry/node";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const transports = [
  // Console
  new winston.transports.Console(),
  
  // Error logs to file
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // All logs to file
  new winston.transports.File({
    filename: 'logs/all.log',
    maxsize: 5242880,
    maxFiles: 5,
  }),
];

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels,
  format,
  transports,
});

// Sentry integration
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

---

## 7. Security Best Practices

### SSL/TLS Configuration

```javascript
// Express HTTPS setup
import https from 'https';
import fs from 'fs';
import helmet from 'helmet';

app.use(helmet());

const options = {
  key: fs.readFileSync('/etc/ssl/private/key.pem'),
  cert: fs.readFileSync('/etc/ssl/certs/cert.pem'),
};

https.createServer(options, app).listen(443);
```

### Security Headers

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
}));
```

### Environment Variables Management

```bash
# .env.production (never commit to repo)
NODE_ENV=production
DATABASE_URL=mongodb+srv://...
REDIS_URL=redis://...
JWT_SECRET=<generate-with-crypto.randomBytes(32).toString('hex')>
JWT_REFRESH_SECRET=<generate-with-crypto.randomBytes(32).toString('hex')>
OPENAI_API_KEY=...
SENTRY_DSN=...

# Load from AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id prod/api --query SecretString --output text
```

### Database Backups

```bash
# MongoDB backup strategy
# Daily automated backups to S3

# In production cron job:
0 2 * * * /scripts/backup-mongodb.sh

# Backup script
#!/bin/bash
BACKUP_DIR="/backups/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILE="$BACKUP_DIR/mongo_backup_$TIMESTAMP.tar.gz"

mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR/dump_$TIMESTAMP
tar -czf $FILE $BACKUP_DIR/dump_$TIMESTAMP
aws s3 cp $FILE s3://backups-bucket/mongodb/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

---

## 8. Performance Optimization

### Caching Strategy

```typescript
// Redis cache layers
const CACHE_KEYS = {
  JOBS: (page: number) => `jobs:all:${page}`,
  JOB_DETAIL: (id: string) => `job:${id}`,
  USER_APPLICATIONS: (userId: string) => `applications:${userId}`,
  ANALYTICS_SUMMARY: (userId: string) => `analytics:${userId}:summary`,
};

const CACHE_TTL = {
  JOBS: 3600, // 1 hour
  JOB_DETAIL: 7200, // 2 hours
  USER_DATA: 600, // 10 minutes
  ANALYTICS: 300, // 5 minutes
};
```

### Database Query Optimization

```typescript
// Use lean() for read-only queries
const jobs = await Job.find().lean();

// Select only needed fields
const applications = await Application
  .find({ userId })
  .select('status appliedAt interviewDate')
  .lean();

// Use batch operations
const results = await Job.bulkWrite([
  { updateOne: { filter: {...}, update: {...} } },
  { insertOne: { document: {...} } },
]);
```

---

## 9. Monitoring Metrics

### Key Metrics to Track

```javascript
// Application Metrics
- API Response Time (p50, p95, p99)
- Request Rate
- Error Rate
- CPU Usage
- Memory Usage
- Database Query Time
- Cache Hit Rate
- Job Queue Depth
- Active Connections

// Business Metrics
- Daily Active Users
- Applications Created
- Success Rate
- User Retention
- Conversion Rate (Free → Paid)
- MRR (Monthly Recurring Revenue)

// Automation Metrics
- Automation Success Rate
- Account Ban Rate
- Average Applications per Day
- Completion Time
- Error Distribution
```

---

## 10. Disaster Recovery & Failover

### Backup & Restore Strategy

```bash
# Daily automated backups
MongoDB: AWS Backup Service (continuous)
Redis: RDB snapshots (hourly)
S3 Buckets: Versioning enabled

# Restore procedure
1. Stop application
2. Restore database from backup
3. Restore Redis cache (optional, can rebuild)
4. Verify data integrity
5. Start application
6. Run smoke tests

# RTO: 30 minutes
# RPO: 1 hour
```

### Monitoring & Alerting

```yaml
# AlertManager rules
- alert: HighErrorRate
  expr: rate(requests_total{status=~"5.."}[5m]) > 0.05
  for: 5m
  annotations:
    summary: "High error rate detected"

- alert: HighLatency
  expr: histogram_quantile(0.95, requests_duration_seconds) > 1
  for: 10m
  annotations:
    summary: "High API latency"

- alert: DatabaseDown
  expr: up{job="mongodb"} == 0
  for: 1m
  annotations:
    summary: "MongoDB is down"
```

---

## 11. Deployment Checklist

- [ ] SSL/TLS certificate configured
- [ ] Environment variables set securely
- [ ] Database backups tested
- [ ] Load balancer configured
- [ ] CDN configured (Cloudflare)
- [ ] Monitoring & logging setup
- [ ] Error tracking (Sentry) configured
- [ ] Email service configured
- [ ] Payment processor (Stripe) configured
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Database indexes verified
- [ ] Cache strategy implemented
- [ ] Health check endpoints working
- [ ] Security headers configured
- [ ] API documentation deployed
- [ ] Performance baseline established
- [ ] Disaster recovery tested
- [ ] Team trained on runbooks
- [ ] Status page created

---

## 12. Cost Optimization

```javascript
// Estimated Monthly Costs (AWS)

EC2 (3x t3.medium): $60
RDS MongoDB (M10): $70
ElastiCache Redis: $20
S3 Storage & Transfer: $30
CloudFront CDN: $20
SendGrid Email: $15
Stripe Processing: ~2.9% of revenue

// Total Infrastructure: ~$215/month
// + Operational costs (support, monitoring)
// = ~$400/month base

// Per 1000 users (annual):
// Revenue: $120k (if $10/month average)
// Costs: ~$5k
// Margin: 95%+
```

---

**Infrastructure is production-ready with scalability, security, and reliability as core principles.**
