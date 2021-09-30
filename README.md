# discordlambda

Discord Lambda lets you create web content that has Discord meta information, so that its link is displayed as a nice preview thumbnail when pasted into a Discord channel. You can also add your logo to the preview.

# Online

https://discordlambda.netlify.app/

# Cloning

```
git clone --recurse-submodules https://github.com/hyperchessbot/discordlambda
```

# Building

## Prerequisites

Build needs `Netlify CLI` and `rollup.js` . Install them as follows

```
npm install -g netlify-cli
```

*see also https://docs.netlify.com/cli/get-started/*

```
npm install -g rollup
```

*see also https://rollupjs.org/guide/en/*

## Bundle serverless function

```
rollup -c
```

## Package serverless function for deployment

```
netlify build
```
### Prerequisites for netlify build ( env vars )

`NETLIFY_AUTH_TOKEN`

Generate in User Settings / Applications.

`NETLIFY_SITE_ID`

Look up in Site Details.

## Set up dev server

### Linux

```
rollup -c -w  &
netlify dev &
```

### Windows

```
start rollup -c -w
start netlify dev
```
