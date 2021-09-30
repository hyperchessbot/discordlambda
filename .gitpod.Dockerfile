FROM gitpod/workspace-full

# Install custom tools, runtime, etc.
RUN npm install -g netlify-cli
RUN npm install -g rollup