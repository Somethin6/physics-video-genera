# Physics Foundry - Complete Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- Python 3.11+ with pip
- Git and modern terminal
- 8GB+ RAM recommended
- GPU with 4GB+ VRAM (optional, for rendering)

### Installation

```bash
# Clone the repository
git clone https://github.com/Somethin6/physics-video-genera.git
cd physics-video-genera

# Install dependencies
npm install
cd apps/gui && npm install
cd ../orchestrator && pip install -e .

# Start development servers
npm run dev  # or: just dev-all
```

## 🏗️ Architecture Overview

### System Design

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GUI Client    │    │  Orchestrator   │    │ Render Workers  │
│  (React/Vite)   │◄──►│   (FastAPI)     │◄──►│ (Blender/Manim)│
│                 │    │                 │    │                 │
│ • Project Mgmt  │    │ • Pipeline      │    │ • Video Gen     │
│ • Quality UI    │    │ • LLM Integration│    │ • Effects       │
│ • Real-time     │    │ • Media Proc    │    │ • Export        │
│   Monitoring    │    │ • Error Recovery│    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Shared Types  │
                    │   & Validation  │
                    │                 │
                    │ • JSON Schema   │
                    │ • Type Gen      │
                    │ • Validation    │
                    └─────────────────┘
```

### Technology Stack

#### Frontend (GUI)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6.3.5 with SWC
- **UI Library**: Radix UI + Tailwind CSS 4.1
- **State**: React Query + KV hooks
- **Testing**: Vitest + React Testing Library + Playwright
- **Icons**: Lucide React (consistent icon set)
- **Performance**: Web Vitals monitoring

#### Backend (Orchestrator)
- **Framework**: FastAPI with async/await
- **WebSockets**: Real-time pipeline updates
- **Media**: OpenTimelineIO + OpenImageIO + FFmpeg
- **LLM**: OpenAI-compatible API client
- **Monitoring**: Prometheus + OpenTelemetry
- **Testing**: Pytest with async support
- **Error Handling**: Comprehensive recovery system

### Key Features

#### 🎯 Production-Ready Pipeline
- **Real-time progress tracking** with WebSocket updates
- **Intelligent error recovery** with 15+ recovery strategies
- **Multi-engine rendering** (Blender OptiX/CUDA/CPU fallback)
- **Professional color management** (OCIO with Rec.709/BT.1886)

#### 🔒 Enterprise Security
- **Input validation** with custom sanitization
- **Rate limiting** per endpoint and user
- **CSP headers** and security middleware
- **Vulnerability scanning** in CI/CD

#### ⚡ Performance Optimized
- **Bundle splitting** and lazy loading
- **Image optimization** with WebP/AVIF
- **Caching strategies** for API and assets
- **Web Vitals** monitoring (LCP < 2.5s, FID < 100ms)

#### ♿ Accessibility First
- **WCAG 2.1 AA compliance** verified
- **Keyboard navigation** throughout
- **Screen reader** optimized
- **High contrast** themes
- **Focus management** in modals

#### 🌍 Internationalization
- **10 languages** supported (EN, ES, FR, DE, JA, ZH, PT, RU, AR, HI)
- **RTL support** for Arabic
- **Number/date formatting** per locale
- **Dynamic language switching**

## 🛠️ Development Workflow

### Project Structure

```
physics-foundry/
├── 📱 apps/
│   ├── gui/                     # React frontend
│   │   ├── src/
│   │   │   ├── components/      # UI components
│   │   │   │   ├── ui/          # Design system
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   └── AccessibilityHelp.tsx
│   │   │   ├── lib/             # Utilities
│   │   │   │   ├── security.ts  # Input validation
│   │   │   │   ├── performance.ts # Monitoring
│   │   │   │   └── i18n.ts      # Internationalization
│   │   │   ├── __tests__/       # Unit tests
│   │   │   └── e2e/             # E2E tests
│   │   ├── eslint.config.js     # Modern ESLint v9
│   │   ├── vitest.config.ts     # Test configuration
│   │   └── playwright.config.ts # E2E configuration
│   └── orchestrator/            # FastAPI backend
│       ├── orchestrator/
│       │   ├── api/            # REST endpoints
│       │   ├── core/           # Business logic
│       │   │   ├── error_handling.py  # Recovery system
│       │   │   ├── media_pipeline.py  # Media processing
│       │   │   └── dsl_models.py      # Data models
│       │   └── workers/        # Render workers
│       └── tests/              # Comprehensive tests
├── 🔄 .github/workflows/        # CI/CD automation
│   ├── ci-cd.yml              # Main pipeline
│   └── maintenance.yml        # Automated maintenance
├── 📚 docs/                    # Documentation
├── 🔧 scripts/                # Development tools
└── 🎨 config/                 # Configuration files
```

### Development Commands

```bash
# Development
npm run dev              # Start GUI dev server
npm run dev:api         # Start API dev server
npm run dev:all         # Start all services

# Building
npm run build           # Build all components
npm run build:gui       # Build GUI only
npm run build:api       # Build API only

# Testing
npm run test            # Run all tests
npm run test:unit       # Unit tests only
npm run test:e2e        # E2E tests with Playwright
npm run test:coverage   # With coverage report

# Code Quality
npm run lint            # Lint all code
npm run lint:fix        # Auto-fix linting issues
npm run format          # Format code with Prettier
npm run type-check      # TypeScript type checking

# Security
npm audit               # Check for vulnerabilities
npm run security-scan   # Comprehensive security check

# Performance
npm run build:analyze   # Bundle size analysis
npm run lighthouse      # Performance audit
```

### Git Workflow

```bash
# Feature development
git checkout -b feature/awesome-feature
git commit -m "feat: add awesome feature"
git push origin feature/awesome-feature

# Create PR via GitHub
# CI/CD automatically runs:
# - Security scanning
# - Linting and formatting
# - Unit + integration tests
# - E2E tests across browsers
# - Performance testing
# - Bundle size analysis
```

## 🧪 Testing Strategy

### Test Pyramid

```
      ┌─────────────────┐
     ┌┴─────────────────┴┐    E2E Tests (10%)
    ┌┴───────────────────┴┐   - Full user workflows
   ┌┴─────────────────────┴┐  - Cross-browser testing
  ┌┴───────────────────────┴┐ - Performance validation
 ┌┴─────────────────────────┴┐
┌┴───────────────────────────┴┐ Unit Tests (70%)
└┬───────────────────────────┬┘ - Individual functions
 └┬─────────────────────────┬┘  - Component isolation
  └┬───────────────────────┬┘   - Fast execution
   └┬─────────────────────┬┘
    └┬───────────────────┬┘
     └┴─────────────────┴┘
```

### Test Coverage

- **Unit Tests**: 90%+ coverage target
- **Integration Tests**: 80%+ coverage
- **E2E Tests**: Critical user paths
- **Performance Tests**: Core Web Vitals
- **Security Tests**: OWASP Top 10

### Quality Gates

All PRs must pass:
1. ✅ Security scan (no high/critical vulnerabilities)
2. ✅ Linting (no errors, warnings < 10)
3. ✅ Type checking (strict TypeScript)
4. ✅ Unit tests (90%+ coverage)
5. ✅ E2E tests (all critical paths)
6. ✅ Performance budget (bundle size < 2MB)
7. ✅ Accessibility audit (WCAG AA)

## 🚀 Deployment

### Environment Configuration

```bash
# Development
NODE_ENV=development
API_URL=http://localhost:8000
VITE_LOG_LEVEL=debug

# Staging  
NODE_ENV=staging
API_URL=https://api-staging.physics-foundry.com
VITE_ANALYTICS=false

# Production
NODE_ENV=production
API_URL=https://api.physics-foundry.com
VITE_ANALYTICS=true
VITE_ERROR_REPORTING=true
```

### CI/CD Pipeline

```yaml
# Automated workflow:
Code Push → Security Scan → Build → Test → Deploy
     ↓           ↓           ↓       ↓       ↓
  GitHub    → Trivy     → Vite    → Jest → Staging
  Actions     CodeQL      Docker    E2E    Production
                                   ↓
                              Performance
                              Monitoring
```

### Monitoring & Observability

- **Application Performance**: Web Vitals, bundle analysis
- **Error Tracking**: Comprehensive error boundaries
- **User Analytics**: Privacy-respecting metrics
- **Infrastructure**: Prometheus + Grafana dashboards
- **Logs**: Structured logging with correlation IDs

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear caches
rm -rf node_modules package-lock.json
npm install

# Reset TypeScript cache
rm -rf apps/gui/.tsbuildinfo
npm run type-check
```

#### Test Failures
```bash
# Update test snapshots
npm run test -- --updateSnapshot

# Debug specific test
npm run test -- --debug test-name
```

#### Performance Issues
```bash
# Analyze bundle size
npm run build:analyze

# Profile render performance
npm run lighthouse -- --only-categories=performance
```

### Getting Help

1. **Documentation**: Check `/docs` folder
2. **Issues**: Search existing GitHub issues  
3. **Discussions**: GitHub Discussions for questions
4. **Community**: Discord server for real-time help

## 📈 Roadmap

### Phase 1: Foundation ✅
- [x] Core architecture and build system
- [x] Modern tooling (Vite, ESLint, TypeScript)
- [x] Comprehensive testing infrastructure
- [x] Security framework and validation
- [x] Error handling and recovery
- [x] CI/CD automation

### Phase 2: Advanced Features (Current)
- [ ] Advanced LLM integrations
- [ ] Real-time collaboration
- [ ] Plugin architecture
- [ ] Advanced analytics
- [ ] Mobile app development

### Phase 3: Scale & Polish
- [ ] Multi-tenant architecture
- [ ] Advanced caching strategies
- [ ] Edge deployment
- [ ] Enterprise SSO
- [ ] Compliance certifications (SOC2, GDPR)

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

### Quick Contribution Steps

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow code standards (auto-enforced by pre-commit hooks)
4. Add tests for new features
5. Ensure all quality gates pass
6. Submit PR with clear description

---

**Built with ❤️ by the Physics Foundry team**

*Making physics education accessible through AI-powered video generation*