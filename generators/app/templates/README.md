# Rocket.Chat CI/CD Artifacts

> Rocket.Chat artifacts as code, just like everything else...

## About

If you're going to integrate Rocket.Chat into your pipelines, you have to treat its artifacts as code too. Plus, the built in editor isn't awesome.

## Getting Started

First, you'll need Yeoman

```Bash
npm install --global yo
```

Then, check the scaffolding section for what you can do.

## Scaffolding

This project uses Yeoman to generate artifacts.

Generate a new integration

```Bash
yo rocket.chat:integration
```

## Merging

Set your config in `config/default.json` then run `scripts/import.js` to merge everything in the `integrations/` folder into your Rocket.Chat instance.

```Bash
node scripts/import.js
```
