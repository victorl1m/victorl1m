<div align="center">

```text
██╗   ██╗██╗ ██████╗████████╗ ██████╗ ██████╗     ██╗     ██╗███╗   ███╗ █████╗ 
██║   ██║██║██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗    ██║     ██║████╗ ████║██╔══██╗
██║   ██║██║██║        ██║   ██║   ██║██████╔╝    ██║     ██║██╔████╔██║███████║
╚██╗ ██╔╝██║██║        ██║   ██║   ██║██╔══██╗    ██║     ██║██║╚██╔╝██║██╔══██║
 ╚████╔╝ ██║╚██████╗   ██║   ╚██████╔╝██║  ██║    ███████╗██║██║ ╚═╝ ██║██║  ██║
  ╚═══╝  ╚═╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚══════╝╚═╝╚═╝     ╚═╝╚═╝  ╚═╝
```

**Full-stack developer and SaaS founder. I build tools for AI coding agents and automation for real businesses.**

[LinkedIn](https://linkedin.com/in/victorl1m) · [Email](mailto:victor@l1ma.com) · [X](https://twitter.com/limaaasds) · [Floq](https://floq.flowless.app)

</div>

```text
   ▄██████████▄       victor@github
 ▄██████████████▄     ─────────────────────────────────────────────────────
 ████  ████  ████     role       Full-stack developer, SaaS founder
 ████  ████  ████     based      Uberaba, Brazil
 ████████████████     building   Floq, a desktop canvas for AI coding agents
 ████████████████     languages  TypeScript · Rust · Python · Dart · SQL
 ▀██████████████▀     frontend   React · Next.js · Tauri · Tailwind
   ▀██████████▀       backend    Node.js · PostgreSQL · MySQL · Redis
                      infra      Docker · Linux · GCP · self-hosted
```

## Now building: Floq

**A desktop workspace for running Claude Code and Codex agents on a server you host.** You start agents in cloud terminals, arrange them on a canvas with notes and wires, and they keep working after you close the laptop. Lead agents recruit subagents, message each other, and stop to ask for your approval before anything irreversible such as a push, a merge or a deploy.

```text
  ┌────────────────────────────────────────┐
  │  Floq app   Tauri 2 · React 19 · Rust  │
  └───────────────────┬────────────────────┘
                      │  HTTPS + WebSocket
  ┌───────────────────▼────────────────────┐      ┌──────────────┐
  │  Runtime    Node.js · node-pty · ws    ├──────┤  PostgreSQL  │
  └───────────────────┬────────────────────┘      └──────────────┘
                      │  one sandbox per user and session
  ┌───────────────────▼────────────────────┐
  │  bubblewrap sandbox · encrypted home   │──▶  claude / codex CLI
  └────────────────────────────────────────┘
```

What I designed and built, end to end:

- **Desktop app.** Tauri 2 shell in Rust, React 19 interface, a node canvas, xterm.js terminals streamed over WebSocket, light and dark themes.
- **Self-hosted runtime.** Node.js and TypeScript server with auth, organizations and roles, PTY sessions that sleep and resume, and PostgreSQL for state.
- **Isolation and secrets.** Each user gets a gocryptfs-encrypted home and an unprivileged bubblewrap sandbox. Credentials and vault secrets are encrypted with AES-256-GCM.
- **Agent orchestration.** A CLI protocol for agents to recruit, message and hand off work, with human approval gates and configurable limits.
- **Quality.** About 80k lines of TypeScript and 3k of Rust, 900+ runtime tests, a Playwright end-to-end suite, Rust unit tests, CI builds and written release notes for every version.

Status: v1.0.5, pre-release. The main repository is private for now and I am glad to walk through the code. The plugin ecosystem is public: [floq-plugins](https://github.com/victorl1m/floq-plugins) (catalog), [WAHA](https://github.com/victorl1m/floq-plugin-waha), [Azure DevOps](https://github.com/victorl1m/floq-plugin-azure-devops), [Movidesk](https://github.com/victorl1m/floq-plugin-movidesk).

## Other work

| Project | What it is | Stack |
|---|---|---|
| [Reader](https://github.com/victorl1m/Reader) | Manga and comic reader that runs entirely in the browser. Opens `.cbr` and `.cbz` files and never uploads them. [Live demo](https://m-reader-xi.vercel.app) | Next.js, React, TypeScript, PWA |
| StockAge | Inventory management with an integrated point of sale | TypeScript |
| Fiscal automation | Brazilian invoice and fiscal document systems (NFe, NFS-e, CTe) and RPA for business workflows | Node.js, Python, SQL |
| Real-time AI | LLM integrations with embeddings, vision models and avatar technology | Python, TypeScript |

## What I'm good at

```text
  backend      API design, database tuning (PostgreSQL, MySQL), real-time
               streaming, auth and security
  frontend     product UI in React and Next.js, desktop apps with Tauri
  automation   RPA, n8n workflows, fiscal document processing
  ai           agent orchestration, LLM integration, embeddings and
               vector search
  ops          Docker, Linux, self-hosting (Coolify, Dokploy), cost control
```

## Get in touch

I'm open to conversations about full-stack and AI tooling roles.

```text
  ┌─────────────────────────────────────────────┐
  │  mail      victor@l1ma.com                  │
  │  linkedin  linkedin.com/in/victorl1m        │
  │  x         @limaaasds                       │
  └─────────────────────────────────────────────┘
```
